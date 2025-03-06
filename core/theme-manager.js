/**
 * Theme Manager - Gère les thèmes de l'application
 */

class ThemeManager {
    constructor() {
      this.currentTheme = 'system';
      this.systemPrefersDark = false;
      this.themes = {
        light: {
          name: 'Clair',
          variables: {
            // Variables CSS définies dans themes.css
          }
        },
        dark: {
          name: 'Sombre',
          variables: {
            // Variables CSS définies dans themes.css
          }
        },
        custom: {
          name: 'Personnalisé',
          variables: {}
        }
      };
    }
  
    /**
     * Initialise le gestionnaire de thèmes
     */
    init() {
      // Détecter les préférences du système
      this.detectSystemPreferences();
      
      // Charger le thème depuis les paramètres
      const settingsTheme = window.settingsManager?.get('theme') || 'system';
      this.setTheme(settingsTheme);
      
      // Écouter les changements du thème système
      this.listenForSystemChanges();
      
      // Écouter les changements de paramètres
      if (window.settingsManager) {
        window.settingsManager.addEventListener('change', (data) => {
          if (data.key === 'theme') {
            this.setTheme(data.value);
          }
        });
      }
    }
  
    /**
     * Détecte les préférences de thème du système
     */
    detectSystemPreferences() {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemPrefersDark = darkModeMediaQuery.matches;
    }
  
    /**
     * Écoute les changements du thème système
     */
    listenForSystemChanges() {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      darkModeMediaQuery.addEventListener('change', (e) => {
        this.systemPrefersDark = e.matches;
        
        // Mettre à jour le thème si le mode système est utilisé
        if (this.currentTheme === 'system') {
          this.applyTheme();
        }
      });
    }
  
    /**
     * Définit le thème actif
     * @param {string} theme - Thème à appliquer (system, light, dark, custom)
     */
    setTheme(theme) {
      if (!this.themes[theme] && theme !== 'system') {
        console.warn(`Thème inconnu: ${theme}`);
        theme = 'system';
      }
      
      this.currentTheme = theme;
      this.applyTheme();
      
      // Mettre à jour les paramètres si le gestionnaire est disponible
      if (window.settingsManager && window.settingsManager.get('theme') !== theme) {
        window.settingsManager.set('theme', theme);
      }
    }
  
    /**
     * Applique le thème actuel
     */
    applyTheme() {
      const body = document.body;
      
      // Supprimer toutes les classes de thème
      body.classList.remove('theme-light', 'theme-dark', 'theme-custom');
      
      // Déterminer le thème à appliquer
      let themeToApply = this.currentTheme;
      
      if (themeToApply === 'system') {
        themeToApply = this.systemPrefersDark ? 'dark' : 'light';
      }
      
      // Appliquer la classe du thème
      body.classList.add(`theme-${themeToApply}`);
      
      // Mettre à jour les éléments de l'interface qui dépendent du thème
      this.updateUIForTheme(themeToApply);
      
      // Déclencher un événement personnalisé
      const event = new CustomEvent('themechanged', { detail: { theme: themeToApply } });
      document.dispatchEvent(event);
    }
  
    /**
     * Met à jour l'interface pour le thème spécifié
     * @param {string} theme - Thème appliqué
     */
    updateUIForTheme(theme) {
      // Mettre à jour le bouton de thème
      const toggleButton = document.getElementById('toggle-theme');
      if (toggleButton) {
        toggleButton.textContent = theme === 'dark' ? '🌙' : '☀️';
        toggleButton.title = theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre';
      }
      
      // Mettre à jour le sélecteur de thème dans les paramètres
      const themeSelect = document.getElementById('theme-select');
      if (themeSelect) {
        themeSelect.value = this.currentTheme;
      }
    }
  
    /**
     * Bascule entre les thèmes clair et sombre
     */
    toggleTheme() {
      if (this.currentTheme === 'light') {
        this.setTheme('dark');
      } else if (this.currentTheme === 'dark') {
        this.setTheme('light');
      } else if (this.currentTheme === 'system') {
        // Si le système est sombre, passer à clair, sinon passer à sombre
        this.setTheme(this.systemPrefersDark ? 'light' : 'dark');
      } else {
        // Pour le thème personnalisé, revenir au thème système
        this.setTheme('system');
      }
    }
  
    /**
     * Charge un thème personnalisé
     * @param {Object} variables - Variables CSS du thème
     */
    loadCustomTheme(variables) {
      this.themes.custom.variables = variables;
      
      // Créer ou mettre à jour l'élément de style personnalisé
      let styleElement = document.getElementById('custom-theme');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-theme';
        document.head.appendChild(styleElement);
      }
      
      // Générer les variables CSS
      let css = '.theme-custom {\n';
      for (const [key, value] of Object.entries(variables)) {
        css += `  --${key}: ${value};\n`;
      }
      css += '}';
      
      styleElement.textContent = css;
      
      // Appliquer le thème personnalisé
      this.setTheme('custom');
    }
  }
  
  // Exporter l'instance du gestionnaire de thèmes
  window.themeManager = new ThemeManager();
  
  // Initialiser le gestionnaire de thèmes au chargement du document
  document.addEventListener('DOMContentLoaded', () => {
    window.themeManager.init();
    
    // Ajouter un gestionnaire pour le bouton de basculement du thème
    const toggleButton = document.getElementById('toggle-theme');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        window.themeManager.toggleTheme();
      });
    }
  });