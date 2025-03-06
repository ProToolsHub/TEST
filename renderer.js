// Variables globales
let currentTool = null;
let settings = {};
let frequentTools = [];

// Fonction pour vérifier si l'API est disponible
function waitForAPI() {
  return new Promise((resolve) => {
    if (window.api) {
      resolve();
    } else {
      const interval = setInterval(() => {
        if (window.api) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    }
  });
}

// Chargement initial
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Attendre que l'API soit disponible
    await waitForAPI();
    
    // Charger les paramètres
    settings = await window.api.loadSettings() || {};
    
    // Appliquer le thème
    applyTheme(settings.theme || 'system');
    
    // Charger les outils fréquemment utilisés
    loadFrequentTools();
    
    // Initialiser les gestionnaires d'événements
    initEventListeners();
  } catch (error) {
    console.error('Erreur d\initialisation :', error);
    showError('Erreur lors de l\'initialisation de l\'application');
  }
});

// Initialisation des gestionnaires d'événements
function initEventListeners() {
  // Gestionnaire pour le bouton de thème
  document.getElementById('toggle-theme').addEventListener('click', toggleTheme);
  
  // Gestionnaire pour les liens d'outils
  document.querySelectorAll('nav a[data-tool]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const toolPath = e.target.getAttribute('data-tool');
      loadTool(toolPath);
    });
  });
  
  // Gestionnaire pour le bouton de paramètres
  document.getElementById('settings-button').addEventListener('click', openSettings);
  
  // Fermeture du modal de paramètres
  document.querySelector('#settings-modal .close').addEventListener('click', closeSettings);
  document.getElementById('cancel-settings').addEventListener('click', closeSettings);
  
  // Sauvegarde des paramètres
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  
  // Gestionnaire de recherche
  document.getElementById('search-tools').addEventListener('input', searchTools);
}

// Charger un outil
async function loadTool(toolPath) {
  if (!toolPath) return;
  
  try {
    console.log('Chargement de l\'outil:', toolPath);
    
    // Charger le contenu HTML de l'outil
    const content = await window.api.loadTool(toolPath);
    if (!content) {
      console.error('Contenu nul reçu pour:', toolPath);
      showError(`Erreur lors du chargement de l'outil: ${toolPath}`);
      return;
    }
    
    // Mettre à jour le contenu principal
    const mainContent = document.getElementById('content');
    mainContent.innerHTML = content;
    
    // Exécuter le script associé
    const scriptPath = toolPath.replace('.html', '.js');
    const scriptElement = document.createElement('script');
    scriptElement.src = `tools/${scriptPath}`;
    scriptElement.onerror = (e) => {
      console.error('Erreur lors du chargement du script:', scriptPath, e);
      showError(`Erreur lors du chargement du script: ${scriptPath}`);
    };
    document.body.appendChild(scriptElement);
    
    // Mettre à jour l'outil actuel
    currentTool = toolPath;
    
    // Mettre à jour les outils fréquents
    updateFrequentTools(toolPath);
    
    // Mettre en évidence le lien sélectionné
    highlightSelectedTool(toolPath);
    
    console.log('Outil chargé avec succès:', toolPath);
  } catch (error) {
    console.error('Erreur lors du chargement de l\'outil:', error);
    showError(`Erreur: ${error.message}`);
  }
}

// Mettre en évidence l'outil sélectionné dans le menu
function highlightSelectedTool(toolPath) {
  // Supprimer la classe active de tous les liens
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
  });
  
  // Ajouter la classe active au lien correspondant
  const activeLink = document.querySelector(`nav a[data-tool="${toolPath}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
    
    // Développer la catégorie si nécessaire
    const category = activeLink.closest('.category');
    if (category) {
      category.classList.add('expanded');
    }
  }
}

// Charger les outils fréquemment utilisés
function loadFrequentTools() {
  // Récupérer la liste des outils fréquents depuis les paramètres
  frequentTools = settings.frequentTools || [];
  
  // Afficher les outils fréquents
  updateFrequentToolsDisplay();
}

// Mettre à jour la liste des outils fréquemment utilisés
function updateFrequentTools(toolPath) {
  // Vérifier si l'outil est déjà dans la liste
  const index = frequentTools.findIndex(tool => tool.path === toolPath);
  
  if (index !== -1) {
    // Incrémenter le compteur d'utilisation
    frequentTools[index].count++;
  } else {
    // Ajouter le nouvel outil
    const toolElement = document.querySelector(`nav a[data-tool="${toolPath}"]`);
    const toolName = toolElement ? toolElement.textContent : toolPath.split('/').pop().replace('.html', '');
    
    frequentTools.push({
      path: toolPath,
      name: toolName,
      count: 1,
      lastUsed: new Date().toISOString()
    });
  }
  
  // Trier par fréquence d'utilisation
  frequentTools.sort((a, b) => b.count - a.count);
  
  // Limiter à 6 outils
  if (frequentTools.length > 6) {
    frequentTools = frequentTools.slice(0, 6);
  }
  
  // Mettre à jour l'affichage
  updateFrequentToolsDisplay();
  
  // Sauvegarder dans les paramètres
  settings.frequentTools = frequentTools;
  window.api.saveSettings(settings);
}

// Mettre à jour l'affichage des outils fréquents
function updateFrequentToolsDisplay() {
  const container = document.getElementById('frequent-tools');
  if (!container) return;
  
  // Vider le conteneur
  container.innerHTML = '';
  
  // Ajouter les outils fréquents
  frequentTools.forEach(tool => {
    const toolElement = document.createElement('div');
    toolElement.className = 'tool-item';
    toolElement.innerHTML = `
      <div class="tool-icon">
        <img src="assets/icons/tool-icons/${tool.path.split('/')[0]}.png" alt="">
      </div>
      <div class="tool-name">${tool.name}</div>
    `;
    
    toolElement.addEventListener('click', () => {
      loadTool(tool.path);
    });
    
    container.appendChild(toolElement);
  });
  
  // Afficher un message si aucun outil n'est trouvé
  if (frequentTools.length === 0) {
    container.innerHTML = '<p>Aucun outil récemment utilisé</p>';
  }
}

// Recherche d'outils
function searchTools(e) {
  const searchTerm = e.target.value.toLowerCase();
  const allTools = document.querySelectorAll('nav a[data-tool]');
  
  allTools.forEach(tool => {
    const toolName = tool.textContent.toLowerCase();
    const toolCategory = tool.closest('.category').querySelector('h3').textContent.toLowerCase();
    
    if (toolName.includes(searchTerm) || toolCategory.includes(searchTerm)) {
      tool.style.display = '';
      tool.closest('.category').style.display = '';
    } else {
      tool.style.display = 'none';
    }
  });
  
  // Masquer les catégories vides
  document.querySelectorAll('.category').forEach(category => {
    const visibleTools = category.querySelectorAll('a[data-tool]:not([style="display: none;"])');
    if (visibleTools.length === 0) {
      category.style.display = 'none';
    }
  });
}

// Gestion du thème
function applyTheme(theme) {
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
  
  // Mettre à jour la sélection dans les paramètres
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.value = theme;
  }
}

function toggleTheme() {
  // Basculer entre les thèmes clair et sombre
  const currentTheme = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
  applyTheme(currentTheme);
  
  // Mettre à jour les paramètres
  settings.theme = currentTheme;
  window.api.saveSettings(settings);
}

// Gestion des paramètres
function openSettings() {
  // Mettre à jour les valeurs du formulaire
  document.getElementById('theme-select').value = settings.theme || 'system';
  document.getElementById('remember-tools').checked = settings.rememberTools !== false;
  
  // Afficher le modal
  document.getElementById('settings-modal').style.display = 'block';
}

function closeSettings() {
  document.getElementById('settings-modal').style.display = 'none';
}

async function saveSettings() {
  // Récupérer les valeurs du formulaire
  settings.theme = document.getElementById('theme-select').value;
  settings.rememberTools = document.getElementById('remember-tools').checked;
  
  // Sauvegarder les paramètres
  await window.api.saveSettings(settings);
  
  // Appliquer le thème
  applyTheme(settings.theme);
  
  // Fermer le modal
  closeSettings();
}

// Affichage des erreurs
function showError(message) {
  const mainContent = document.getElementById('content');
  mainContent.innerHTML = `
    <div class="error-message">
      <h2>Erreur</h2>
      <p>${message}</p>
      <button id="error-back">Retour</button>
    </div>
  `;
  
  // Bouton de retour
  document.getElementById('error-back').addEventListener('click', () => {
    mainContent.innerHTML = `
      <div class="welcome-screen">
        <h2>Bienvenue sur IT-Tools Desktop</h2>
        <p>Sélectionnez un outil dans le menu de gauche pour commencer.</p>
        <div class="quick-access">
          <h3>Outils fréquemment utilisés</h3>
          <div class="tool-grid" id="frequent-tools"></div>
        </div>
      </div>
    `;
    loadFrequentTools();
  });
}