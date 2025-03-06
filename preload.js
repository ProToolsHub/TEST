const { contextBridge, ipcRenderer } = require('electron');

// Expose des fonctionnalités protégées à la partie renderer
contextBridge.exposeInMainWorld('api', {
  // Fonctions de gestion des outils
  loadTool: (toolPath) => ipcRenderer.invoke('load-tool', toolPath),
  
  // Fonctions de gestion des paramètres
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  
  // Utilitaires système
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Utilitaires de texte
  textStatistics: (text) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s+/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Temps de lecture estimé (basé sur 200 mots par minute)
    const readingTimeMinutes = Math.ceil(words.length / 200);
    
    return {
      words: words.length,
      characters: chars,
      charactersNoSpaces: charsNoSpaces,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      readingTimeMinutes
    };
  },
  
  // Utilitaires de cryptographie
  hash: (text, algorithm) => ipcRenderer.invoke('hash-text', { text, algorithm }),
  generateUUID: () => ipcRenderer.invoke('generate-uuid'),
  
  // Encodage/Décodage
  base64Encode: (text) => ipcRenderer.invoke('base64-encode', text),
  base64Decode: (encoded) => ipcRenderer.invoke('base64-decode', encoded),
  urlEncode: (text) => encodeURIComponent(text),
  urlDecode: (encoded) => decodeURIComponent(encoded)
});