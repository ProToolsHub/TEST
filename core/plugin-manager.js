/**
 * Plugin Manager - Gère les plugins pour étendre les fonctionnalités de l'application
 */

class PluginManager {
    constructor() {
      this.plugins = {};
      this.hooks = {};
      this.registeredTools = [];
    }
  
    /**
     * Initialise le gestionnaire de plugins
     */
    init() {
      // Créer les hooks par défaut
      this.createDefaultHooks();
      
      // Charger les plugins intégrés
      this.loadBuiltinPlugins();
      
      console.log('Gestionnaire de plugins initialisé');
    }
  
    /**
     * Crée les hooks (points d'extension) par défaut
     */
    createDefaultHooks() {
      this.hooks = {
        'app:init': [],              // Initialisation de l'application
        'app:beforeunload': [],      // Avant la fermeture de l'application
        'tool:load': [],             // Chargement d'un outil
        'tool:beforeunload': [],     // Avant le déchargement d'un outil
        'sidebar:init': [],          // Initialisation de la barre latérale
        'settings:changed': [],      // Changement des paramètres
        'theme:changed': []          // Changement de thème
      };
    }
  
    /**
     * Charge les plugins intégrés
     */
    loadBuiltinPlugins() {
      // Cette fonction sera utilisée pour charger les plugins intégrés
      // Exemples : plugin de sauvegarde automatique, plugin d'historique, etc.
    }
  
    /**
     * Enregistre un plugin
     * @param {string} id - Identifiant unique du plugin
     * @param {Object} plugin - Objet plugin
     * @returns {boolean} - true si l'enregistrement est réussi
     */
    register(id, plugin) {
      if (this.plugins[id]) {
        console.warn(`Un plugin avec l'ID '${id}' est déjà enregistré`);
        return false;
      }
      
      // Vérifier la structure minimale du plugin
      if (!plugin.name || typeof plugin.init !== 'function') {
        console.error(`Le plugin '${id}' n'a pas la structure requise`);
        return false;
      }
      
      this.plugins[id] = {
        id,
        ...plugin,
        enabled: true
      };
      
      // Enregistrer les hooks du plugin
      if (plugin.hooks) {
        this.registerHooks(id, plugin.hooks);
      }
      
      // Enregistrer les outils du plugin
      if (plugin.tools) {
        this.registerTools(id, plugin.tools);
      }
      
      console.log(`Plugin '${plugin.name}' (${id}) enregistré`);
      return true;
    }
  
    /**
     * Enregistre les hooks d'un plugin
     * @param {string} pluginId - Identifiant du plugin
     * @param {Object} pluginHooks - Hooks du plugin
     */
    registerHooks(pluginId, pluginHooks) {
      for (const [hookName, callback] of Object.entries(pluginHooks)) {
        if (typeof callback !== 'function') {
          console.warn(`Hook '${hookName}' du plugin '${pluginId}' n'est pas une fonction`);
          continue;
        }
        
        if (!this.hooks[hookName]) {
          this.hooks[hookName] = [];
        }
        
        this.hooks[hookName].push({
          pluginId,
          callback
        });
        
        console.log(`Hook '${hookName}' enregistré pour le plugin '${pluginId}'`);
      }
    }
  
    /**
     * Enregistre les outils d'un plugin
     * @param {string} pluginId - Identifiant du plugin
     * @param {Array} tools - Outils du plugin
     */
    registerTools(pluginId, tools) {
      for (const tool of tools) {
        if (!tool.id || !tool.name || !tool.path) {
          console.warn(`Outil invalide dans le plugin '${pluginId}'`);
          continue;
        }
        
        const toolInfo = {
          id: tool.id,
          name: tool.name,
          path: tool.path,
          category: tool.category || 'Plugins',
          description: tool.description || '',
          icon: tool.icon || 'plugin-icon.png',
          pluginId
        };
        
        this.registeredTools.push(toolInfo);
        
        console.log(`Outil '${tool.name}' enregistré par le plugin '${pluginId}'`);
      }
      
      // Déclencher un événement pour mettre à jour la barre latérale
      this.executeHook('sidebar:init');
    }
  
    /**
     * Active ou désactive un plugin
     * @param {string} id - Identifiant du plugin
     * @param {boolean} enabled - État d'activation
     * @returns {boolean} - true si l'opération est réussie
     */
    setPluginState(id, enabled) {
      const plugin = this.plugins[id];
      if (!plugin) {
        console.warn(`Plugin '${id}' non trouvé`);
        return false;
      }
      
      plugin.enabled = enabled;
      
      // Appeler la méthode enable/disable du plugin si elle existe
      if (enabled && typeof plugin.enable === 'function') {
        plugin.enable();
      } else if (!enabled && typeof plugin.disable === 'function') {
        plugin.disable();
      }
      
      console.log(`Plugin '${plugin.name}' ${enabled ? 'activé' : 'désactivé'}`);
      return true;
    }
  
    /**
     * Exécute un hook particulier
     * @param {string} hookName - Nom du hook à exécuter
     * @param {Object} data - Données à passer au hook
     * @returns {Promise<Array>} - Résultats des callbacks
     */
    async executeHook(hookName, data = {}) {
      if (!this.hooks[hookName]) {
        return [];
      }
      
      const results = [];
      
      for (const { pluginId, callback } of this.hooks[hookName]) {
        const plugin = this.plugins[pluginId];
        
        // Ne pas exécuter les hooks des plugins désactivés
        if (!plugin || !plugin.enabled) {
          continue;
        }
        
        try {
          // Exécuter le callback de manière asynchrone
          const result = await Promise.resolve(callback(data));
          results.push(result);
        } catch (error) {
          console.error(`Erreur lors de l'exécution du hook '${hookName}' du plugin '${pluginId}':`, error);
        }
      }
      
      return results;
    }
  
    /**
     * Obtient la liste des plugins enregistrés
     * @returns {Array} - Liste des plugins
     */
    getPlugins() {
      return Object.values(this.plugins).map(plugin => ({
        id: plugin.id,
        name: plugin.name,
        description: plugin.description || '',
        version: plugin.version || '1.0.0',
        author: plugin.author || 'Inconnu',
        enabled: plugin.enabled
      }));
    }
  
    /**
     * Obtient la liste des outils enregistrés par les plugins
     * @param {string} category - Catégorie pour filtrer (optionnel)
     * @returns {Array} - Liste des outils
     */
    getTools(category = null) {
      if (category) {
        return this.registeredTools.filter(tool => tool.category === category);
      }
      return this.registeredTools;
    }
  
    /**
     * Obtient les catégories uniques des outils
     * @returns {Array} - Liste des catégories
     */
    getCategories() {
      const categories = new Set(this.registeredTools.map(tool => tool.category));
      return Array.from(categories);
    }
  }
  
  // Exporter l'instance du gestionnaire de plugins
  window.pluginManager = new PluginManager();
  
  // Initialiser le gestionnaire de plugins au chargement du document
  document.addEventListener('DOMContentLoaded', () => {
    window.pluginManager.init();
    
    // S'abonner aux événements pertinents
    document.addEventListener('themechanged', (e) => {
      window.pluginManager.executeHook('theme:changed', e.detail);
    });
    
    // Exécuter le hook d'initialisation
    window.pluginManager.executeHook('app:init');
    
    // S'abonner à l'événement beforeunload
    window.addEventListener('beforeunload', () => {
      window.pluginManager.executeHook('app:beforeunload');
    });
  });