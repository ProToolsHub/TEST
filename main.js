const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Stocke une référence globale à la fenêtre
let mainWindow;

function createWindow() {
  // Crée la fenêtre du navigateur
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icons/app-icon.png')
  });

  // Charge la page d'index
  mainWindow.loadFile('index.html');

  // Ouvre les DevTools en mode développement
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Gère la fermeture de la fenêtre
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Crée les dossiers nécessaires s'ils n'existent pas
function ensureDirectories() {
  const directories = [
    path.join(__dirname, 'tools'),
    path.join(__dirname, 'tools', 'text-tools'),
    path.join(__dirname, 'tools', 'converters'),
    path.join(__dirname, 'tools', 'generators'),
    path.join(__dirname, 'tools', 'formatters'),
    path.join(__dirname, 'tools', 'encoders-decoders'),
    path.join(__dirname, 'tools', 'networking'),
    path.join(__dirname, 'tools', 'dev-tools'),
    path.join(__dirname, 'tools', 'cryptography'),
    path.join(__dirname, 'assets'),
    path.join(__dirname, 'assets', 'css'),
    path.join(__dirname, 'assets', 'js'),
    path.join(__dirname, 'assets', 'icons'),
    path.join(__dirname, 'assets', 'icons', 'tool-icons'),
    path.join(__dirname, 'assets', 'fonts'),
    path.join(__dirname, 'core')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('Dossier créé:', dir);
    }
  });
}

// Crée un fichier de statistiques de texte si nécessaire
function createTextStatisticsFiles() {
  const htmlContent = `<div class="tool-container text-statistics-tool">
  <div class="tool-header">
    <h2>Statistiques de texte</h2>
    <p>Analysez votre texte pour obtenir des statistiques détaillées</p>
  </div>
  
  <div class="tool-content">
    <div class="tool-input">
      <textarea id="text-input" placeholder="Collez ou tapez votre texte ici..."></textarea>
      <div class="tool-actions">
        <button id="analyze-button">Analyser</button>
        <button id="clear-button">Effacer</button>
        <button id="sample-button">Texte d'exemple</button>
        <button id="copy-stats-button" disabled>Copier les résultats</button>
      </div>
    </div>
    
    <div class="tool-output">
      <div class="stats-container">
        <div class="stats-summary">
          <div class="stats-card">
            <div class="stats-value" id="word-count">0</div>
            <div class="stats-label">Mots</div>
          </div>
          <div class="stats-card">
            <div class="stats-value" id="char-count">0</div>
            <div class="stats-label">Caractères</div>
          </div>
          <div class="stats-card">
            <div class="stats-value" id="char-no-spaces-count">0</div>
            <div class="stats-label">Caractères (sans espaces)</div>
          </div>
          <div class="stats-card">
            <div class="stats-value" id="sentence-count">0</div>
            <div class="stats-label">Phrases</div>
          </div>
          <div class="stats-card">
            <div class="stats-value" id="paragraph-count">0</div>
            <div class="stats-label">Paragraphes</div>
          </div>
          <div class="stats-card">
            <div class="stats-value" id="reading-time">0</div>
            <div class="stats-label">Temps de lecture (minutes)</div>
          </div>
        </div>
        
        <div class="stats-details">
          <div class="stats-section">
            <h3>Détails sur les mots</h3>
            <div class="stats-detail-item">
              <span>Longueur moyenne des mots:</span>
              <span id="avg-word-length">0</span>
            </div>
            <div class="stats-detail-item">
              <span>Mots uniques:</span>
              <span id="unique-words">0</span>
            </div>
            <div class="stats-detail-item">
              <span>Mots longs (>6 lettres):</span>
              <span id="long-words">0</span>
            </div>
          </div>
          
          <div class="stats-section">
            <h3>Densité des mots</h3>
            <table class="word-density-table">
              <thead>
                <tr>
                  <th>Mot</th>
                  <th>Occurrences</th>
                  <th>Fréquence</th>
                </tr>
              </thead>
              <tbody id="word-density-body">
                <!-- Sera rempli dynamiquement -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .text-statistics-tool {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .tool-header {
    margin-bottom: 20px;
  }
  
  .tool-header h2 {
    margin-bottom: 5px;
  }
  
  .tool-header p {
    color: var(--text-muted);
  }
  
  .tool-content {
    display: flex;
    flex-grow: 1;
    gap: 20px;
    height: calc(100vh - 200px);
  }
  
  .tool-input {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  #text-input {
    flex-grow: 1;
    resize: none;
    padding: 15px;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.6;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background-color: var(--input-bg);
    color: var(--text-color);
    min-height: 200px;
  }
  
  .tool-actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
  
  .tool-output {
    flex: 1;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    overflow-y: auto;
  }
  
  .stats-container {
    padding: 20px;
  }
  
  .stats-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
  }
  
  .stats-card {
    background-color: var(--bg-color);
    border-radius: 4px;
    padding: 15px;
    text-align: center;
    border: 1px solid var(--border-color);
  }
  
  .stats-value {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 5px;
    color: var(--accent-color);
  }
  
  .stats-label {
    font-size: 12px;
    color: var(--text-muted);
  }
  
  .stats-details {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .stats-section {
    margin-bottom: 20px;
  }
  
  .stats-section h3 {
    font-size: 16px;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid var(--border-color);
  }
  
  .stats-detail-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-color);
  }
  
  .word-density-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .word-density-table th, .word-density-table td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  .word-density-table th {
    font-weight: 600;
    color: var(--text-muted);
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .tool-content {
      flex-direction: column;
      height: auto;
    }
    
    #text-input {
      min-height: 150px;
    }
  }
</style>`;

  const jsContent = `// Références aux éléments du DOM
const textInput = document.getElementById('text-input');
const analyzeButton = document.getElementById('analyze-button');
const clearButton = document.getElementById('clear-button');
const sampleButton = document.getElementById('sample-button');
const copyStatsButton = document.getElementById('copy-stats-button');

// Éléments d'affichage des statistiques
const wordCount = document.getElementById('word-count');
const charCount = document.getElementById('char-count');
const charNoSpacesCount = document.getElementById('char-no-spaces-count');
const sentenceCount = document.getElementById('sentence-count');
const paragraphCount = document.getElementById('paragraph-count');
const readingTime = document.getElementById('reading-time');
const avgWordLength = document.getElementById('avg-word-length');
const uniqueWords = document.getElementById('unique-words');
const longWords = document.getElementById('long-words');
const wordDensityBody = document.getElementById('word-density-body');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
});

function initEventListeners() {
  analyzeButton.addEventListener('click', analyzeText);
  clearButton.addEventListener('click', clearAll);
  sampleButton.addEventListener('click', loadSampleText);
  copyStatsButton.addEventListener('click', copyStatistics);
  
  // Analyser le texte automatiquement lors de la frappe (avec debounce)
  let debounceTimer;
  textInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(analyzeText, 500);
    
    // Désactiver le bouton de copie si le texte est vide
    copyStatsButton.disabled = textInput.value.trim() === '';
  });
}

function analyzeText() {
  const text = textInput.value;
  
  if (!text.trim()) {
    resetStats();
    return;
  }
  
  // Activer le bouton de copie
  copyStatsButton.disabled = false;
  
  // Utiliser l'API de l'application pour les statistiques
  const stats = window.api.textStatistics(text);
  
  // Afficher les statistiques de base
  wordCount.textContent = stats.words;
  charCount.textContent = stats.characters;
  charNoSpacesCount.textContent = stats.charactersNoSpaces;
  sentenceCount.textContent = stats.sentences;
  paragraphCount.textContent = stats.paragraphs;
  readingTime.textContent = stats.readingTimeMinutes;
  
  // Calculer des statistiques supplémentaires
  calculateAdvancedStats(text);
}

function calculateAdvancedStats(text) {
  // Tableau des mots (convertis en minuscules)
  const words = text.toLowerCase().match(/\\b\\w+\\b/g) || [];
  
  // Longueur moyenne des mots
  const totalLetters = words.reduce((sum, word) => sum + word.length, 0);
  const average = words.length ? (totalLetters / words.length).toFixed(1) : 0;
  avgWordLength.textContent = average;
  
  // Mots uniques
  const uniqueWordSet = new Set(words);
  uniqueWords.textContent = uniqueWordSet.size;
  
  // Mots longs (plus de 6 lettres)
  const longWordsCount = words.filter(word => word.length > 6).length;
  longWords.textContent = longWordsCount;
  
  // Fréquence des mots (densité)
  calculateWordDensity(words);
}

function calculateWordDensity(words) {
  // Ignorer les mots courts et courants
  const stopWords = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'à', 'de', 'ce', 'ces',
    'en', 'au', 'aux', 'du', 'par', 'pour', 'dans', 'sur', 'il', 'elle', 'ils',
    'elles', 'je', 'tu', 'nous', 'vous', 'est', 'sont', 'qui', 'que', 'quoi'
  ]);
  
  // Compter les occurrences de chaque mot
  const wordFrequency = {};
  
  words.forEach(word => {
    if (word.length < 3 || stopWords.has(word)) return;
    
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Convertir en tableau et trier par fréquence
  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);  // Limiter aux 15 mots les plus fréquents
  
  // Calculer la fréquence en pourcentage
  const totalWords = words.length;
  
  // Vider et remplir le tableau de densité
  wordDensityBody.innerHTML = '';
  
  if (sortedWords.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="3">Aucune donnée disponible</td>';
    wordDensityBody.appendChild(row);
    return;
  }
  
  sortedWords.forEach(([word, count]) => {
    const frequency = ((count / totalWords) * 100).toFixed(1);
    
    const row = document.createElement('tr');
    row.innerHTML = \`
      <td>\${word}</td>
      <td>\${count}</td>
      <td>\${frequency}%</td>
    \`;
    
    wordDensityBody.appendChild(row);
  });
}

function resetStats() {
  // Réinitialiser toutes les statistiques à zéro
  wordCount.textContent = '0';
  charCount.textContent = '0';
  charNoSpacesCount.textContent = '0';
  sentenceCount.textContent = '0';
  paragraphCount.textContent = '0';
  readingTime.textContent = '0';
  avgWordLength.textContent = '0';
  uniqueWords.textContent = '0';
  longWords.textContent = '0';
  
  // Vider le tableau de densité
  wordDensityBody.innerHTML = '<tr><td colspan="3">Aucune donnée disponible</td></tr>';
  
  // Désactiver le bouton de copie
  copyStatsButton.disabled = true;
}

function clearAll() {
  textInput.value = '';
  resetStats();
}

function loadSampleText() {
  textInput.value = \`L'informatique est un domaine d'activité scientifique, technique, et industriel concernant le traitement automatique de l'information numérique par l'exécution de programmes informatiques hébergés par des dispositifs électriques-électroniques : des systèmes embarqués, des ordinateurs, des robots, des automates, etc.

Ces champs d'application peuvent être séparés en deux branches :
- Théorique : qui concerne la définition de concepts et modèles
- Pratique : qui s'intéresse aux techniques concrètes d'implantation et de mise en œuvre

Certains domaines de l'informatique peuvent être très abstraits, comme la complexité algorithmique, et d'autres peuvent être plus proches d'un public profane. Ainsi, la théorie des langages demeure un domaine davantage accessible aux professionnels formés (description des ordinateurs et méthodes de programmation), tandis que les métiers liés aux interfaces homme-machine sont accessibles à un plus large public.\`;
  
  analyzeText();
}

function copyStatistics() {
  // Créer une chaîne formatée des statistiques
  const stats = \`
Statistiques de texte:
-------------------
Nombre de mots: \${wordCount.textContent}
Nombre de caractères: \${charCount.textContent}
Nombre de caractères (sans espaces): \${charNoSpacesCount.textContent}
Nombre de phrases: \${sentenceCount.textContent}
Nombre de paragraphes: \${paragraphCount.textContent}
Temps de lecture estimé: \${readingTime.textContent} minute(s)

Détails sur les mots:
-------------------
Longueur moyenne des mots: \${avgWordLength.textContent}
Mots uniques: \${uniqueWords.textContent}
Mots longs (>6 lettres): \${longWords.textContent}

Généré avec IT-Tools Desktop
  \`;
  
  // Copier dans le presse-papier
  navigator.clipboard.writeText(stats)
    .then(() => {
      // Indication visuelle temporaire
      const originalText = copyStatsButton.textContent;
      copyStatsButton.textContent = "Copié !";
      setTimeout(() => {
        copyStatsButton.textContent = originalText;
      }, 2000);
    })
    .catch(err => {
      console.error('Erreur lors de la copie dans le presse-papier:', err);
    });
}`;

  const mainCssContent = `.theme-light {
  --accent-color: #007bff;
  --accent-color-light: rgba(0, 123, 255, 0.25);
  --accent-color-dark: #0056b3;
  
  --bg-color: #f8f9fa;
  --text-color: #212529;
  --text-muted: #6c757d;
  
  --border-color: #dee2e6;
  --hover-color: #f1f3f5;
  --active-color: #e9f2fe;
  
  --header-bg: #ffffff;
  --sidebar-bg: #f8f9fa;
  --content-bg: #ffffff;
  --footer-bg: #f8f9fa;
  --modal-bg: #ffffff;
  --card-bg: #ffffff;
  
  --input-bg: #ffffff;
  --button-bg: #f8f9fa;
  --button-text: #212529;
  --button-hover-bg: #e9ecef;
  
  --error-bg: #fff5f5;
  --error-color: #dc3545;
  --error-text: #212529;
  
  --success-bg: #f4faf6;
  --success-color: #28a745;
  --success-text: #212529;
}

/* Thème sombre */
.theme-dark {
  --accent-color: #0d6efd;
  --accent-color-light: rgba(13, 110, 253, 0.25);
  --accent-color-dark: #0a58ca;
  
  --bg-color: #212529;
  --text-color: #f8f9fa;
  --text-muted: #adb5bd;
  
  --border-color: #495057;
  --hover-color: #2b3035;
  --active-color: #0d3663;
  
  --header-bg: #343a40;
  --sidebar-bg: #2b3035;
  --content-bg: #343a40;
  --footer-bg: #212529;
  --modal-bg: #343a40;
  --card-bg: #2b3035;
  
  --input-bg: #212529;
  --button-bg: #495057;
  --button-text: #f8f9fa;
  --button-hover-bg: #343a40;
  
  --error-bg: #3a2021;
  --error-color: #ef5654;
  --error-text: #f8f9fa;
  
  --success-bg: #1a2e21;
  --success-color: #4ad364;
  --success-text: #f8f9fa;
}`;

  const mainCssPath = path.join(__dirname, 'assets', 'css', 'themes.css');
  if (!fs.existsSync(mainCssPath)) {
    fs.writeFileSync(mainCssPath, mainCssContent, 'utf8');
    console.log('Fichier CSS des thèmes créé');
  }

  const htmlPath = path.join(__dirname, 'tools', 'text-tools', 'text-statistics.html');
  const jsPath = path.join(__dirname, 'tools', 'text-tools', 'text-statistics.js');

  if (!fs.existsSync(htmlPath)) {
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('Fichier HTML de statistiques de texte créé');
  }

  if (!fs.existsSync(jsPath)) {
    fs.writeFileSync(jsPath, jsContent, 'utf8');
    console.log('Fichier JS de statistiques de texte créé');
  }
}

// Crée les fichiers CSS principaux s'ils n'existent pas
function createMainCssFiles() {
  const mainCssContent = `/* Reset et bases */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
  height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
}

/* Variables (définies par thème dans themes.css) */
:root {
  --transition-speed: 0.3s;
}

/* Structure de l'application */
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

header {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  height: 60px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
}

.logo h1 {
  margin-left: 10px;
  font-size: 18px;
  font-weight: 600;
}

.search-bar {
  flex-grow: 1;
  margin: 0 20px;
}

.search-bar input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background-color: var(--input-bg);
  color: var(--text-color);
  transition: border-color var(--transition-speed);
}

.search-bar input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px var(--accent-color-light);
}

.header-controls {
  display: flex;
  gap: 10px;
}

.header-controls button {
  background: none;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  font-size: 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-speed);
}

.header-controls button:hover {
  background-color: var(--hover-color);
}

/* Conteneur principal */
.main-container {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
}

/* Barre latérale */
.sidebar {
  width: 250px;
  overflow-y: auto;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  padding: 15px 0;
  transition: width var(--transition-speed);
}

.category {
  margin-bottom: 15px;
}

.category h3 {
  padding: 5px 15px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category ul {
  list-style-type: none;
}

.category li {
  padding: 2px 0;
}

.category a {
  display: block;
  padding: 8px 15px 8px 25px;
  color: var(--text-color);
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: background-color var(--transition-speed);
}

.category a:hover {
  background-color: var(--hover-color);
}

.category a.active {
  background-color: var(--active-color);
  border-left-color: var(--accent-color);
  font-weight: 500;
}

/* Contenu principal */
main {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--content-bg);
}

/* Écran de bienvenue */
.welcome-screen {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

.welcome-screen h2 {
  font-size: 24px;
  margin-bottom: 15px;
}

.welcome-screen p {
  font-size: 16px;
  color: var(--text-muted);
  margin-bottom: 30px;
}

.quick-access {
  margin-top: 40px;
}

.quick-access h3 {
  font-size: 18px;
  margin-bottom: 20px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  justify-content: center;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background-color: var(--card-bg);
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.tool-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.tool-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.tool-name {
  font-size: 12px;
  text-align: center;
}

/* Pied de page */
footer {
  padding: 10px 20px;
  text-align: center;
  background-color: var(--footer-bg);
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-muted);
}

/* Modal */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-content {
  position: relative;
  background-color: var(--modal-bg);
  margin: 10% auto;
  padding: 0;
  width: 500px;
  max-width: 90%;
  border-radius: 6px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  animation: modalFadeIn 0.3s;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(-50px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 500;
}

.close {
  font-size: 24px;
  cursor: pointer;
  color: var(--text-muted);
}

.close:hover {
  color: var(--text-color);
}

.modal-body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid var(--border-color);
  text-align: right;
}

/* Sections de paramètres */
.settings-section {
  margin-bottom: 25px;
}

.settings-section h3 {
  font-size: 16px;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--border-color);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

/* Boutons */
button {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background-color: var(--button-bg);
  color: var(--button-text);
  cursor: pointer;
  transition: background-color var(--transition-speed);
}

button:hover {
  background-color: var(--button-hover-bg);
}

button:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--accent-color-light);
}

button#save-settings {
  background-color: var(--accent-color);
  color: white;
  border-color: var(--accent-color-dark);
}

button#save-settings:hover {
  background-color: var(--accent-color-dark);
}

/* Contrôles de formulaire */
select, input[type="text"], input[type="number"], textarea {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background-color: var(--input-bg);
  color: var(--text-color);
}

select {
  min-width: 120px;
}

/* Messages d'erreur */
.error-message {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--error-bg);
  border-radius: 6px;
  border-left: 4px solid var(--error-color);
  color: var(--error-text);
}

.error-message h2 {
  color: var(--error-color);
  margin-bottom: 10px;
}

/* Adaptations pour les petits écrans */
@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  
  .category a {
    padding: 8px 10px 8px 15px;
  }
}`;

  const mainCssPath = path.join(__dirname, 'assets', 'css', 'main.css');
  if (!fs.existsSync(mainCssPath)) {
    fs.writeFileSync(mainCssPath, mainCssContent, 'utf8');
    console.log('Fichier CSS principal créé');
  }
}

// Crée l'icône de l'application si elle n'existe pas
function createAppIcon() {
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Fond -->
  <rect width="512" height="512" rx="100" fill="#3498db" />
  
  <!-- Icône d'outils -->
  <g fill="#ffffff" transform="translate(90, 90) scale(0.65)">
    <!-- Clé à molette -->
    <path d="M425.7 118.8l-72.1 72.1c-8.7 8.7-22.9 8.7-31.6 0L273.3 142c-8.7-8.7-8.7-22.9 0-31.6l72.1-72.1c-45.4-31.5-107.6-29.2-148.7 11.9-44.7 44.7-44.7 117.2 0 161.9l-94.4 94.4c-12.5 12.5-12.5 32.8 0 45.3l77.8 77.8c12.5 12.5 32.8 12.5 45.3 0l94.4-94.4c44.7 44.7 117.2 44.7 161.9 0 41.1-41.1 43.4-103.3 11.9-148.7l-72.1 72.1c-8.7 8.7-22.9 8.7-31.6 0L340 209.9c-8.7-8.7-8.7-22.9 0-31.6l72.1-72.1c-13.7-9.5-29.1-16-45.3-19.2-17.9-3.5-36.6-2.9-54.3 1.7l67 67c3.1 3.1 3.1 8.2 0 11.3l-11.3 11.3c-3.1 3.1-8.2 3.1-11.3 0l-67-67c-4.6 17.7-5.2 36.4-1.7 54.3 3.2 16.2 9.7 31.6 19.2 45.3z"/>
    
    <!-- Code et accolades -->
    <path d="M186.2 137.8L81.5 242.5c-4.7 4.7-4.7 12.3 0 17l35.7 35.7c4.7 4.7 12.3 4.7 17 0L239 190.5c4.7-4.7 4.7-12.3 0-17l-35.7-35.7c-4.7-4.7-12.3-4.7-17.1 0zm156.5 58.3l-17.4 17.4c-4.7 4.7-4.7 12.3 0 17l97.1 97.1c4.7 4.7 12.3 4.7 17 0l17.4-17.4c4.7-4.7 4.7-12.3 0-17l-97.1-97.1c-4.7-4.7-12.3-4.7-17 0z"/>
  </g>
</svg>`;

  const iconPath = path.join(__dirname, 'assets', 'icons', 'app-icon.png');
  
  // Cette partie est un peu tricky car on doit convertir le SVG en PNG
  // Dans une vraie application, vous utiliseriez une bibliothèque comme sharp
  // pour cette conversion, mais pour simplifier, nous allons simplement écrire le SVG
  if (!fs.existsSync(iconPath)) {
    // Écrire un fichier temporaire SVG
    const svgPath = path.join(__dirname, 'assets', 'icons', 'app-icon.svg');
    fs.writeFileSync(svgPath, iconSvg, 'utf8');
    console.log('Fichier SVG d\'icône créé (à convertir en PNG pour production)');
  }
}

// Crée le fichier navigation.js s'il n'existe pas
function createNavigationJs() {
  const content = `// Fonction pour vérifier si l'API est disponible
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
    const toolLink = document.querySelector(\`a[data-tool="\${toolPath}"]\`);
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
        const toolLink = document.querySelector(\`a[data-tool="\${settings.lastTool}"]\`);
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
  style.textContent = \`
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
  \`;
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
        console.error('Erreur lors de l\\'enregistrement du dernier outil:', error);
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
        console.error('Erreur lors de l\\'application du thème système:', error);
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
window.addEventListener('load', detectSystemTheme);`;

  const jsPath = path.join(__dirname, 'assets', 'js', 'navigation.js');
  if (!fs.existsSync(jsPath)) {
    fs.writeFileSync(jsPath, content, 'utf8');
    console.log('Fichier navigation.js créé');
  }
}

// Initialise l'application quand elle est prête
app.whenReady().then(() => {
  // Assurer que tous les dossiers nécessaires existent
  ensureDirectories();

  // Créer les fichiers de base s'ils n'existent pas
  createTextStatisticsFiles();
  createMainCssFiles();
  createAppIcon();
  createNavigationJs();
  
  createWindow();
  
  // Crée le menu de l'application
  const template = [
    {
      label: 'Fichier',
      submenu: [
        { role: 'quit', label: 'Quitter' }
      ]
    },
    {
      label: 'Édition',
      submenu: [
        { role: 'undo', label: 'Annuler' },
        { role: 'redo', label: 'Rétablir' },
        { type: 'separator' },
        { role: 'cut', label: 'Couper' },
        { role: 'copy', label: 'Copier' },
        { role: 'paste', label: 'Coller' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'reload', label: 'Actualiser' },
        { role: 'toggledevtools', label: 'Outils de développement' },
        { type: 'separator' },
        { role: 'resetzoom', label: 'Taille normale' },
        { role: 'zoomin', label: 'Zoom avant' },
        { role: 'zoomout', label: 'Zoom arrière' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' }
      ]
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'À propos',
          click: async () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              title: 'À propos de IT-Tools Desktop',
              message: 'IT-Tools Desktop v1.0.0',
              detail: 'Un ensemble d\'outils de développement et utilitaires informatiques.'
            });
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quitte quand toutes les fenêtres sont fermées, sauf sur macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Gestionnaire de chargement des outils
ipcMain.handle('load-tool', async (event, toolPath) => {
  try {
    const htmlPath = path.join(__dirname, 'tools', toolPath);
    console.log('Tentative de chargement du fichier:', htmlPath);
    
    if (!fs.existsSync(htmlPath)) {
      console.error('Fichier non trouvé:', htmlPath);
      return null;
    }
    
    const content = fs.readFileSync(htmlPath, 'utf8');
    return content;
  } catch (error) {
    console.error('Erreur lors du chargement de l\'outil:', error.message);
    console.error('Stack trace:', error.stack);
    return null;
  }
});

// Gestionnaire de sauvegarde des paramètres
ipcMain.handle('save-settings', async (event, settings) => {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des paramètres:', error);
    return false;
  }
});

// Gestionnaire de chargement des paramètres
ipcMain.handle('load-settings', async () => {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      return settings;
    }
    return {}; // Paramètres par défaut si le fichier n'existe pas
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error);
    return {};
  }
});

// Gestionnaire pour les informations système
ipcMain.handle('get-system-info', () => {
  const os = require('os');
  return {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpus: os.cpus(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem()
  };
});

// Gestionnaire pour les fonctionnalités de cryptographie
ipcMain.handle('hash-text', async (event, { text, algorithm }) => {
  const crypto = require('crypto');
  return crypto.createHash(algorithm).update(text).digest('hex');
});

ipcMain.handle('generate-uuid', async () => {
  const crypto = require('crypto');
  return crypto.randomUUID();
});

// Gestionnaires d'encodage/décodage
ipcMain.handle('base64-encode', async (event, text) => {
  return Buffer.from(text).toString('base64');
});

ipcMain.handle('base64-decode', async (event, encoded) => {
  return Buffer.from(encoded, 'base64').toString('utf8');
});