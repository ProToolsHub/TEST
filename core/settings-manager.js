/**
 * Settings Manager - Gère les paramètres de l'application
 */

class SettingsManager {
    constructor() {
      this.settings = {};
      this.defaultSettings = {
        theme: 'system',           // system, light, dark
        rememberTools: true,       // mémoriser les derniers outils
        lastTool: null,            // dernier outil utilisé
        frequentTools: [],         // outils fréquemment utilisés
        customStyles: null,        // styles personnalisés
        toolSettings: {}           // paramètres spécifiques aux outils
      };
      this.eventListeners = {};
    }
  
    /**
     * Initialise le gestionnaire de paramètres
     * @returns {Promise<void>}
     */
    async init() {
      try {
        // Charger les paramètres depuis le stockage
        const loadedSettings = await window.api.loadSettings();
        this.settings = { ...this.defaultSettings, ...loadedSettings };
        
        // Appliquer les paramètres initiaux
        this.applySettings();
        
        // Déclencher l'événement d'initialisation
        this.triggerEvent('init', this.settings);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des paramètres:', error);
        this.settings = { ...this.defaultSettings };
      }
    }
  
    /**
     * Obtient la valeur d'un paramètre
     * @param {string} key - Clé du paramètre
     * @param {*} defaultValue - Valeur par défaut si le paramètre n'existe pas
     * @returns {*} - Valeur du paramètre
     */
    get(key, defaultValue = null) {
      const parts = key.split('.');
      let current = this.settings;
      
      for (const part of parts) {
        if (current === undefined || current === null) {
          return defaultValue;
        }
        current = current[part];
      }
      
      return current !== undefined ? current : defaultValue;
    }
  
    /**
     * Définit la valeur d'un paramètre
     * @param {string} key - Clé du paramètre
     * @param {*} value - Nouvelle valeur
     * @returns {Promise<void>}
     */
    async set(key, value) {
      const parts = key.split('.');
      const lastPart = parts.pop();
      let current = this.settings;
      
      for (const part of parts) {
        if (current[part] === undefined) {
          current[part] = {};
        }
        current = current[part];
      }
      
      current[lastPart] = value;
      
      // Enregistrer les paramètres
      await this.saveSettings();
      
      // Appliquer les changements
      this.applySettings();
      
      // Déclencher l'événement de modification
      this.triggerEvent('change', { key, value });
    }
  
    /**
     * Enregistre tous les paramètres
     * @returns {Promise<void>}
     */
    async saveSettings() {
      try {
        await window.api.saveSettings(this.settings);
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement des paramètres:', error);
      }
    }
  
    /**
     * Obtient tous les paramètres d'un outil spécifique
     * @param {string} toolId - Identifiant de l'outil
     * @returns {Object} - Paramètres de l'outil
     */
    getToolSettings(toolId) {
      return this.get(`toolSettings.${toolId}`, {});
    }
  
    /**
     * Enregistre les paramètres d'un outil spécifique
     * @param {string} toolId - Identifiant de l'outil
     * @param {Object} settings - Paramètres de l'outil
     * @returns {Promise<void>}
     */
    async saveToolSettings(toolId, settings) {
      await this.set(`toolSettings.${toolId}`, settings);
    }
  
    /**
     * Applique les paramètres à l'application
     */
    applySettings() {
      // Appliquer le thème
      this.applyTheme(this.get('theme'));
      
      // Appliquer les styles personnalisés
      const customStyles = this.get('customStyles');
      if (customStyles) {
        let styleElement = document.getElementById('custom-styles');
        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = 'custom-styles';
          document.head.appendChild(styleElement);
        }
        styleElement.textContent = customStyles;
      }
    }
  
    /**
     * Applique un thème spécifique
     * @param {string} theme - Thème à appliquer (system, light, dark)
     */
    applyTheme(theme) {
      const body = document.body;
      
      // Supprimer les classes de thème existantes
      body.classList.remove('theme-light', 'theme-dark');
      
      // Appliquer le thème
      if (theme === 'system') {
        // Détecter le thème du système
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
      } else {
        body.classList.add(`theme-${theme}`);
      }
    }
  
    /**
     * Ajoute un écouteur d'événements
     * @param {string} event - Nom de l'événement (init, change)
     * @param {Function} callback - Fonction de rappel
     */
    addEventListener(event, callback) {
      if (!this.eventListeners[event]) {
        this.eventListeners[event] = [];
      }
      this.eventListeners[event].push(callback);
    }
  
    /**
     * Supprime un écouteur d'événements
     * @param {string} event - Nom de l'événement
     * @param {Function} callback - Fonction de rappel à supprimer
     */
    removeEventListener(event, callback) {
      if (!this.eventListeners[event]) return;
      const index = this.eventListeners[event].indexOf(callback);
      if (index !== -1) {
        this.eventListeners[event].splice(index, 1);
      }
    }
  
    /**
     * Déclenche un événement
     * @param {string} event - Nom de l'événement
     * @param {*} data - Données associées à l'événement
     */
    triggerEvent(event, data) {
      if (!this.eventListeners[event]) return;
      for (const callback of this.eventListeners[event]) {
        callback(data);
      }
    }
  }
  
  // Exporter l'instance du gestionnaire de paramètres
  window.settingsManager = new SettingsManager();
  
  // Initialiser les paramètres au chargement du document
  document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager.init();
  });