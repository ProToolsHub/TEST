/**
 * Tool Loader - Gère le chargement dynamique des outils
 */

class ToolLoader {
    constructor() {
      this.loadedTools = new Map();
      this.activeTool = null;
    }
  
    /**
     * Charge un outil à partir de son chemin
     * @param {string} toolPath - Chemin vers l'outil (ex: "text-tools/text-statistics.html")
     * @returns {Promise<HTMLElement>} - Élément racine de l'outil
     */
    async loadTool(toolPath) {
      try {
        // Vérifier si l'outil est déjà chargé
        if (this.loadedTools.has(toolPath)) {
          return this.activateTool(toolPath);
        }
  
        // Charger le contenu HTML
        const htmlContent = await window.api.loadTool(toolPath);
        if (!htmlContent) {
          throw new Error(`Impossible de charger l'outil: ${toolPath}`);
        }
  
        // Créer un élément temporaire pour parser le HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
  
        // Récupérer le contenu principal (div.tool-container)
        const toolContainer = tempDiv.querySelector('.tool-container');
        if (!toolContainer) {
          throw new Error(`Structure invalide pour l'outil: ${toolPath}`);
        }
  
        // Extraire les scripts intégrés
        const scripts = Array.from(tempDiv.querySelectorAll('script'));
        const scriptContents = scripts.map(script => script.textContent).join('\n');
  
        // Extraire les styles intégrés
        const styles = Array.from(tempDiv.querySelectorAll('style'));
        const styleContents = styles.map(style => style.textContent).join('\n');
  
        // Créer l'élément de style
        if (styleContents) {
          const styleElement = document.createElement('style');
          styleElement.textContent = styleContents;
          document.head.appendChild(styleElement);
        }
  
        // Stocker l'outil
        this.loadedTools.set(toolPath, {
          element: toolContainer,
          scriptContent: scriptContents
        });
  
        // Charger le script associé
        const scriptPath = toolPath.replace('.html', '.js');
        this.loadScript(scriptPath);
  
        // Activer l'outil
        return this.activateTool(toolPath);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'outil:', error);
        throw error;
      }
    }
  
    /**
     * Active un outil précédemment chargé
     * @param {string} toolPath - Chemin de l'outil à activer
     * @returns {HTMLElement} - Élément racine de l'outil
     */
    activateTool(toolPath) {
      const tool = this.loadedTools.get(toolPath);
      if (!tool) {
        throw new Error(`Outil non chargé: ${toolPath}`);
      }
  
      // Désactiver l'outil actif
      if (this.activeTool) {
        this.activeTool.element.classList.remove('active-tool');
      }
  
      // Activer le nouvel outil
      tool.element.classList.add('active-tool');
      this.activeTool = tool;
  
      // Évaluer le script intégré
      if (tool.scriptContent) {
        try {
          eval(tool.scriptContent);
        } catch (error) {
          console.error('Erreur lors de l\'évaluation du script intégré:', error);
        }
      }
  
      return tool.element;
    }
  
    /**
     * Charge un script JavaScript externe
     * @param {string} scriptPath - Chemin vers le script
     * @returns {Promise<void>}
     */
    loadScript(scriptPath) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `tools/${scriptPath}`;
        script.onload = () => resolve();
        script.onerror = (error) => reject(new Error(`Erreur de chargement du script: ${scriptPath}`));
        document.body.appendChild(script);
      });
    }
  
    /**
     * Recharge un outil
     * @param {string} toolPath - Chemin de l'outil à recharger
     */
    async reloadTool(toolPath) {
      // Supprimer l'outil de la cache
      this.loadedTools.delete(toolPath);
      
      // Recharger l'outil
      return this.loadTool(toolPath);
    }
  }
  
  // Exporter l'instance du chargeur d'outils
  window.toolLoader = new ToolLoader();