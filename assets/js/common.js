/**
 * Fonctions utilitaires communes pour tous les outils
 */

// Namespace pour les utilitaires
window.Utils = {
    /**
     * Génère un identifiant unique
     * @returns {string} - Identifiant unique
     */
    generateId: function() {
      return '_' + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Crée un élément DOM avec des attributs et contenu
     * @param {string} tag - Nom de la balise
     * @param {Object} attrs - Attributs de l'élément
     * @param {Array|string|Node} children - Enfants de l'élément
     * @returns {HTMLElement} - Élément créé
     */
    createElement: function(tag, attrs = {}, children = []) {
      const element = document.createElement(tag);
      
      // Ajouter les attributs
      for (const [key, value] of Object.entries(attrs)) {
        if (key === 'className') {
          element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
          Object.assign(element.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
          const eventName = key.substring(2).toLowerCase();
          element.addEventListener(eventName, value);
        } else {
          element.setAttribute(key, value);
        }
      }
      
      // Ajouter les enfants
      if (children) {
        if (!Array.isArray(children)) {
          children = [children];
        }
        
        children.forEach(child => {
          if (child instanceof Node) {
            element.appendChild(child);
          } else if (child !== null && child !== undefined) {
            element.appendChild(document.createTextNode(String(child)));
          }
        });
      }
      
      return element;
    },
    
    /**
     * Formate un nombre avec des séparateurs de milliers
     * @param {number} number - Nombre à formater
     * @param {number} decimals - Nombre de décimales
     * @param {string} decimalSeparator - Séparateur décimal
     * @param {string} thousandsSeparator - Séparateur de milliers
     * @returns {string} - Nombre formaté
     */
    formatNumber: function(number, decimals = 0, decimalSeparator = ',', thousandsSeparator = ' ') {
      const fixed = parseFloat(number).toFixed(decimals);
      const [whole, decimal] = fixed.split('.');
      
      const parts = [];
      let count = 0;
      
      for (let i = whole.length - 1; i >= 0; i--) {
        if (count === 3) {
          parts.unshift(thousandsSeparator);
          count = 0;
        }
        parts.unshift(whole[i]);
        count++;
      }
      
      return decimal 
        ? parts.join('') + decimalSeparator + decimal 
        : parts.join('');
    },
    
    /**
     * Copie du texte dans le presse-papier
     * @param {string} text - Texte à copier
     * @returns {Promise<boolean>} - true si la copie est réussie
     */
    copyToClipboard: function(text) {
      return navigator.clipboard.writeText(text)
        .then(() => true)
        .catch(err => {
          console.error('Erreur lors de la copie dans le presse-papier:', err);
          return false;
        });
    },
    
    /**
     * Formate une taille de fichier en unités lisibles (KB, MB, etc.)
     * @param {number} bytes - Taille en octets
     * @param {number} decimals - Nombre de décimales
     * @returns {string} - Taille formatée
     */
    formatFileSize: function(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
    },
    
    /**
     * Échappe les caractères HTML spéciaux
     * @param {string} text - Texte à échapper
     * @returns {string} - Texte échappé
     */
    escapeHtml: function(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      
      return text.replace(/[&<>"']/g, m => map[m]);
    },
    
    /**
     * Crée un délai (debounce) pour une fonction
     * @param {Function} func - Fonction à exécuter
     * @param {number} wait - Temps d'attente en ms
     * @returns {Function} - Fonction avec délai
     */
    debounce: function(func, wait) {
      let timeout;
      
      return function(...args) {
        const context = this;
        clearTimeout(timeout);
        
        timeout = setTimeout(() => {
          func.apply(context, args);
        }, wait);
      };
    },
    
    /**
     * Crée une limite d'appels (throttle) pour une fonction
     * @param {Function} func - Fonction à exécuter
     * @param {number} limit - Limite en ms
     * @returns {Function} - Fonction avec limite
     */
    throttle: function(func, limit) {
      let inThrottle;
      
      return function(...args) {
        const context = this;
        
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          
          setTimeout(() => {
            inThrottle = false;
          }, limit);
        }
      };
    },
    
    /**
     * Détecte le type MIME à partir d'une extension de fichier
     * @param {string} extension - Extension du fichier
     * @returns {string} - Type MIME
     */
    getMimeType: function(extension) {
      const mimeTypes = {
        'txt': 'text/plain',
        'html': 'text/html',
        'css': 'text/css',
        'js': 'text/javascript',
        'json': 'application/json',
        'xml': 'application/xml',
        'csv': 'text/csv',
        'pdf': 'application/pdf',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'mp3': 'audio/mpeg',
        'mp4': 'video/mp4'
      };
      
      extension = extension.toLowerCase().replace('.', '');
      return mimeTypes[extension] || 'application/octet-stream';
    },
    
    /**
     * Formate une date selon un format spécifié
     * @param {Date|string} date - Date à formater
     * @param {string} format - Format de date (par défaut: DD/MM/YYYY)
     * @returns {string} - Date formatée
     */
    formatDate: function(date, format = 'DD/MM/YYYY') {
      date = date instanceof Date ? date : new Date(date);
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    }
  };
  
  // Ajouter des méthodes utilitaires aux prototypes
  String.prototype.slugify = function() {
    return this
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };
  
  // Détection des fonctionnalités du navigateur
  window.Features = {
    clipboardAPI: navigator.clipboard !== undefined,
    fileSystemAPI: 'showOpenFilePicker' in window,
    darkModeSupport: window.matchMedia('(prefers-color-scheme)').media !== 'not all',
    localStorageAvailable: (function() {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })()
  };
  
  // Enregistrer les événements communs
  document.addEventListener('DOMContentLoaded', () => {
    // Gérer l'affichage des messages toast
    window.showToast = function(message, type = 'info', duration = 3000) {
      const toast = Utils.createElement('div', {
        className: `toast toast-${type}`,
        style: {
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 15px',
          borderRadius: '4px',
          backgroundColor: type === 'error' ? 'var(--error-bg)' : 'var(--success-bg)',
          color: type === 'error' ? 'var(--error-text)' : 'var(--success-text)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          zIndex: '9999',
          opacity: '0',
          transition: 'opacity 0.3s ease-in-out'
        }
      }, message);
      
      document.body.appendChild(toast);
      
      // Animation d'entrée
      setTimeout(() => {
        toast.style.opacity = '1';
      }, 10);
      
      // Animation de sortie et suppression
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, duration);
    };
  });