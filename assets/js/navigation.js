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
  
  // Gestion des catégories dans la barre latérale
  document.addEventListener('DOMContentLoaded', async () => {
    // Attendre que l'API soit disponible
    await waitForAPI();
    
    // Références aux éléments
    const categories = document.querySelectorAll('.category');
    const sidebar = document.querySelector('.sidebar');
    
    // Développer/réduire les catégories
    categories.forEach(category => {
      const title = category.querySelector('h3');
      const list = category.querySelector('ul');
      
      // Ajouter un indicateur
      title.innerHTML += '<span class="category-toggle">▼</span>';
      
      // Gestionnaire d'événement pour le titre
      title.addEventListener('click', () => {
        // Basculer la classe expanded
        const isExpanded = category.classList.toggle('expanded');
        
        // Mettre à jour l'indicateur
        const toggle = title.querySelector('.category-toggle');
        toggle.textContent = isExpanded ? '▼' : '►';
        
        // Animer la liste
        if (isExpanded) {
          list.style.maxHeight = list.scrollHeight + 'px';
        } else {
          list.style.maxHeight = '0';
        }
      });
      
      // Définir l'état initial (réduit)
      category.classList.remove('expanded');
      list.style.maxHeight = '0';
      title.querySelector('.category-toggle').textContent = '►';
    });
    
    // Développer la catégorie lorsqu'un outil est sélectionné
    const expandCategoryForTool = (toolPath) => {
      const toolLink = document.querySelector(`a[data-tool="${toolPath}"]`);
      if (toolLink) {
        const category = toolLink.closest('.category');
        if (category && !category.classList.contains('expanded')) {
          category.querySelector('h3').click();
        }
      }
    };
    
    // Charger le dernier outil utilisé
    const loadLastTool = async () => {
      try {
        // Attendre que l'API soit disponible
        await waitForAPI();
        
        const settings = await window.api.loadSettings() || {};
        if (settings.rememberTools !== false && settings.lastTool) {
          expandCategoryForTool(settings.lastTool);
          
          // Simuler un clic sur le lien
          const toolLink = document.querySelector(`a[data-tool="${settings.lastTool}"]`);
          if (toolLink) {
            toolLink.click();
          }
        } else {
          // Développer la première catégorie par défaut
          const firstCategory = document.querySelector('.category');
          if (firstCategory) {
            firstCategory.querySelector('h3').click();
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du dernier outil:', error);
        
        // Développer la première catégorie par défaut en cas d'erreur
        const firstCategory = document.querySelector('.category');
        if (firstCategory) {
          firstCategory.querySelector('h3').click();
        }
      }
    };
    
    // Ajouter un style pour les catégories
    const style = document.createElement('style');
    style.textContent = `
      .category h3 {
        cursor: pointer;
        user-select: none;
        display: flex;
        justify-content: space-between;
        transition: color 0.2s;
      }
      
      .category h3:hover {
        color: var(--accent-color);
      }
      
      .category ul {
        overflow: hidden;
        transition: max-height 0.3s ease-out;
      }
      
      .category-toggle {
        font-size: 10px;
      }
    `;
    document.head.appendChild(style);
    
    // Observer les clics sur les liens d'outils
    sidebar.addEventListener('click', async (e) => {
      const toolLink = e.target.closest('a[data-tool]');
      if (toolLink) {
        const toolPath = toolLink.getAttribute('data-tool');
        
        try {
          // Attendre que l'API soit disponible
          await waitForAPI();
          
          // Enregistrer l'outil actuel dans les paramètres
          const settings = await window.api.loadSettings() || {};
          settings.lastTool = toolPath;
          await window.api.saveSettings(settings);
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement du dernier outil:', error);
        }
      }
    });
    
    // Charger le dernier outil utilisé
    loadLastTool();
  });
  
  // Gestion des raccourcis clavier
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + F pour la recherche
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      const searchInput = document.getElementById('search-tools');
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    }
    
    // Échap pour fermer les modals
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.modal');
      modals.forEach(modal => {
        if (modal.style.display === 'block') {
          modal.style.display = 'none';
        }
      });
    }
  });
  
  // Détection du thème du système
  async function detectSystemTheme() {
    try {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const body = document.body;
      
      // Appliquer le thème en fonction des préférences du système
      async function applySystemTheme(e) {
        try {
          // Attendre que l'API soit disponible
          await waitForAPI();
          
          const settings = await window.api.loadSettings() || {};
          if (settings.theme === 'system') {
            body.classList.remove('theme-light', 'theme-dark');
            body.classList.add(e.matches ? 'theme-dark' : 'theme-light');
          }
        } catch (error) {
          console.error('Erreur lors de l\'application du thème système:', error);
        }
      }
      
      // Écouter les changements de thème du système
      darkModeMediaQuery.addEventListener('change', (e) => applySystemTheme(e));
      
      // Appliquer le thème initial
      await applySystemTheme(darkModeMediaQuery);
    } catch (error) {
      console.error('Erreur lors de la détection du thème système:', error);
    }
  }
  
  // Appeler la détection du thème au chargement
  window.addEventListener('load', detectSystemTheme);