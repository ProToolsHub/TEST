
// Création des fichiers d'outils
// 1. Base64 Encoder/Decoder
createFile(path.join(rootPath, 'tools', 'encoders-decoders', 'base64.html'), base64Html);
createFile(path.join(rootPath, 'tools', 'encoders-decoders', 'base64.js'), base64Js);

// 2. JSON Formatter
createFile(path.join(rootPath, 'tools', 'formatters', 'json-formatter.html'), jsonFormatterHtml);
createFile(path.join(rootPath, 'tools', 'formatters', 'json-formatter.js'), jsonFormatterJs);

// 3. UUID Generator
createFile(path.join(rootPath, 'tools', 'generators', 'uuid-generator.html'), uuidGeneratorHtml);
createFile(path.join(rootPath, 'tools', 'generators', 'uuid-generator.js'), uuidGeneratorJs);

console.log('Tous les outils ont été créés avec succès !');
const fs = require('fs');
const path = require('path');

// Chemin racine du projet (change avec votre chemin réel)
const rootPath = __dirname;

// Fonction pour garantir l'existence d'un dossier
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Dossier créé: ${dirPath}`);
    }
}

// Fonction pour créer un fichier s'il n'existe pas
function createFile(filePath, content) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fichier créé: ${filePath}`);
    } else {
        console.log(`Le fichier existe déjà: ${filePath}`);
    }
}

// Création de tous les dossiers d'outils
const toolDirectories = [
    path.join(rootPath, 'tools', 'text-tools'),
    path.join(rootPath, 'tools', 'converters'),
    path.join(rootPath, 'tools', 'generators'),
    path.join(rootPath, 'tools', 'formatters'),
    path.join(rootPath, 'tools', 'encoders-decoders'),
    path.join(rootPath, 'tools', 'networking'),
    path.join(rootPath, 'tools', 'dev-tools'),
    path.join(rootPath, 'tools', 'cryptography')
];

toolDirectories.forEach(dir => ensureDir(dir));

// Définition des outils avec leur contenu

// 1. Outil: Base64 Encoder/Decoder
const base64Html = `<div class="tool-container base64-tool">
  <div class="tool-header">
    <h2>Base64 Encoder/Decoder</h2>
    <p>Encodez et décodez du texte en Base64</p>
  </div>
  
  <div class="tool-content">
    <div class="tool-columns">
      <div class="tool-column">
        <h3>Texte Original</h3>
        <textarea id="input-text" placeholder="Entrez votre texte ici..."></textarea>
        <div class="tool-actions">
          <button id="encode-button">Encoder en Base64</button>
          <button id="clear-input-button">Effacer</button>
          <button id="sample-text-button">Exemple</button>
        </div>
      </div>
      
      <div class="tool-column">
        <h3>Texte Encodé/Décodé</h3>
        <textarea id="output-text" placeholder="Résultat..." readonly></textarea>
        <div class="tool-actions">
          <button id="decode-button">Décoder du Base64</button>
          <button id="copy-output-button">Copier</button>
          <button id="swap-button">Échanger ⇄</button>
        </div>
      </div>
    </div>
    
    <div class="tool-options">
      <div class="option-group">
        <label>
          <input type="checkbox" id="url-safe-checkbox"> 
          Encoder/Décoder en URL-safe Base64
        </label>
        <span class="info-tooltip" title="Remplace + par - et / par _">ℹ️</span>
      </div>
    </div>
  </div>
</div>

<style>
  .base64-tool .tool-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .tool-columns {
    display: flex;
    gap: 20px;
    flex-grow: 1;
  }
  
  .tool-column {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .tool-column h3 {
    margin-bottom: 10px;
  }
  
  .base64-tool textarea {
    flex-grow: 1;
    min-height: 200px;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background-color: var(--input-bg);
    color: var(--text-color);
    resize: none;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .tool-actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    margin-bottom: 20px;
  }
  
  .tool-options {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid var(--border-color);
  }
  
  .option-group {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .info-tooltip {
    margin-left: 5px;
    cursor: help;
  }
  
  @media (max-width: 768px) {
    .tool-columns {
      flex-direction: column;
    }
  }
</style>`;

const base64Js = `// Éléments DOM
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const encodeButton = document.getElementById('encode-button');
const decodeButton = document.getElementById('decode-button');
const clearInputButton = document.getElementById('clear-input-button');
const copyOutputButton = document.getElementById('copy-output-button');
const sampleTextButton = document.getElementById('sample-text-button');
const swapButton = document.getElementById('swap-button');
const urlSafeCheckbox = document.getElementById('url-safe-checkbox');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Écouter les événements
  encodeButton.addEventListener('click', encodeToBase64);
  decodeButton.addEventListener('click', decodeFromBase64);
  clearInputButton.addEventListener('click', clearInput);
  copyOutputButton.addEventListener('click', copyOutput);
  sampleTextButton.addEventListener('click', loadSampleText);
  swapButton.addEventListener('click', swapTexts);
  
  // Activer/désactiver les boutons en fonction du contenu
  inputText.addEventListener('input', updateButtonStates);
  outputText.addEventListener('input', updateButtonStates);
  
  // État initial des boutons
  updateButtonStates();
});

// Encoder le texte en Base64
async function encodeToBase64() {
  try {
    const text = inputText.value;
    if (!text) return;
    
    const isUrlSafe = urlSafeCheckbox.checked;
    
    // Utiliser l'API de l'application pour l'encodage
    let encoded = await window.api.base64Encode(text);
    
    // Si URL-safe est coché, remplacer les caractères + et /
    if (isUrlSafe) {
      encoded = encoded.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
    }
    
    outputText.value = encoded;
    
    // Mettre à jour l'état des boutons
    updateButtonStates();
  } catch (error) {
    showError('Erreur lors de l\\'encodage: ' + error.message);
  }
}

// Décoder le texte depuis Base64
async function decodeFromBase64() {
  try {
    let text = outputText.value;
    if (!text) return;
    
    const isUrlSafe = urlSafeCheckbox.checked;
    
    // Si URL-safe est coché, restaurer les caractères standard
    if (isUrlSafe) {
      // Restaurer les caractères standards
      text = text.replace(/-/g, '+').replace(/_/g, '/');
      
      // Ajouter les = de padding si nécessaire
      switch (text.length % 4) {
        case 2: text += '=='; break;
        case 3: text += '='; break;
      }
    }
    
    // Utiliser l'API de l'application pour le décodage
    const decoded = await window.api.base64Decode(text);
    
    inputText.value = decoded;
    
    // Mettre à jour l'état des boutons
    updateButtonStates();
  } catch (error) {
    showError('Erreur lors du décodage: Le texte n\\'est pas un Base64 valide');
  }
}

// Effacer le champ d'entrée
function clearInput() {
  inputText.value = '';
  updateButtonStates();
}

// Copier le résultat dans le presse-papier
function copyOutput() {
  const text = outputText.value;
  if (!text) return;
  
  navigator.clipboard.writeText(text)
    .then(() => {
      // Indication visuelle temporaire
      const originalText = copyOutputButton.textContent;
      copyOutputButton.textContent = 'Copié !';
      setTimeout(() => {
        copyOutputButton.textContent = originalText;
      }, 2000);
    })
    .catch(err => {
      showError('Erreur lors de la copie: ' + err.message);
    });
}

// Charger un exemple de texte
function loadSampleText() {
  inputText.value = 'Voici un exemple de texte qui peut être encodé en Base64. Base64 est un groupe de schémas d\\'encodage qui représentent des données binaires sous forme de chaînes ASCII.';
  updateButtonStates();
}

// Échanger les textes d'entrée et de sortie
function swapTexts() {
  const temp = inputText.value;
  inputText.value = outputText.value;
  outputText.value = temp;
  updateButtonStates();
}

// Mettre à jour l'état des boutons
function updateButtonStates() {
  const hasInput = inputText.value.trim() !== '';
  const hasOutput = outputText.value.trim() !== '';
  
  encodeButton.disabled = !hasInput;
  decodeButton.disabled = !hasOutput;
  clearInputButton.disabled = !hasInput;
  copyOutputButton.disabled = !hasOutput;
  swapButton.disabled = !hasInput && !hasOutput;
}

// Afficher une erreur
function showError(message) {
  // Créer une notification d'erreur
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-notification';
  errorDiv.textContent = message;
  
  // Ajouter à la page
  document.body.appendChild(errorDiv);
  
  // Supprimer après quelques secondes
  setTimeout(() => {
    errorDiv.classList.add('fade-out');
    setTimeout(() => {
      errorDiv.remove();
    }, 500);
  }, 3000);
}`;

// 2. Outil: JSON Formatter
const jsonFormatterHtml = `<div class="tool-container json-formatter-tool">
  <div class="tool-header">
    <h2>Formateur JSON</h2>
    <p>Formatez et validez vos données JSON</p>
  </div>
  
  <div class="tool-content">
    <div class="tool-columns">
      <div class="tool-column">
        <h3>JSON Brut</h3>
        <textarea id="input-json" placeholder="Collez votre JSON ici..."></textarea>
        
        <div class="tool-actions">
          <button id="format-button">Formater</button>
          <button id="minify-button">Minifier</button>
          <button id="validate-button">Valider</button>
          <button id="clear-button">Effacer</button>
          <button id="sample-button">Exemple</button>
        </div>
      </div>
      
      <div class="tool-column">
        <h3>Résultat</h3>
        <textarea id="output-json" placeholder="Résultat..." readonly></textarea>
        
        <div class="tool-actions">
          <button id="copy-button">Copier</button>
        </div>
      </div>
    </div>
    
    <div class="tool-options">
      <div class="option-group">
        <label for="indent-select">Indentation:</label>
        <select id="indent-select">
          <option value="2">2 espaces</option>
          <option value="4">4 espaces</option>
          <option value="tab">Tab</option>
        </select>
      </div>
      
      <div class="option-group">
        <label>
          <input type="checkbox" id="sort-keys-checkbox"> 
          Trier les clés par ordre alphabétique
        </label>
      </div>
    </div>
    
    <div class="validation-result" id="validation-result"></div>
  </div>
</div>

<style>
  .json-formatter-tool .tool-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .tool-columns {
    display: flex;
    gap: 20px;
    flex-grow: 1;
  }
  
  .tool-column {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .tool-column h3 {
    margin-bottom: 10px;
  }
  
  .json-formatter-tool textarea {
    flex-grow: 1;
    min-height: 200px;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background-color: var(--input-bg);
    color: var(--text-color);
    resize: none;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .tool-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
    margin-bottom: 20px;
  }
  
  .tool-options {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid var(--border-color);
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .option-group {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .option-group label {
    margin-right: 10px;
  }
  
  .validation-result {
    margin-top: 15px;
    padding: 10px;
    border-radius: 4px;
    font-family: monospace;
  }
  
  .validation-success {
    background-color: var(--success-bg);
    color: var(--success-color);
    border-left: 4px solid var(--success-color);
  }
  
  .validation-error {
    background-color: var(--error-bg);
    color: var(--error-color);
    border-left: 4px solid var(--error-color);
  }
  
  @media (max-width: 768px) {
    .tool-columns {
      flex-direction: column;
    }
  }
</style>`;

const jsonFormatterJs = `// Éléments DOM
const inputJson = document.getElementById('input-json');
const outputJson = document.getElementById('output-json');
const formatButton = document.getElementById('format-button');
const minifyButton = document.getElementById('minify-button');
const validateButton = document.getElementById('validate-button');
const clearButton = document.getElementById('clear-button');
const sampleButton = document.getElementById('sample-button');
const copyButton = document.getElementById('copy-button');
const indentSelect = document.getElementById('indent-select');
const sortKeysCheckbox = document.getElementById('sort-keys-checkbox');
const validationResult = document.getElementById('validation-result');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Écouter les événements
  formatButton.addEventListener('click', formatJson);
  minifyButton.addEventListener('click', minifyJson);
  validateButton.addEventListener('click', validateJson);
  clearButton.addEventListener('click', clearInput);
  sampleButton.addEventListener('click', loadSampleJson);
  copyButton.addEventListener('click', copyOutput);
  
  // Activer/désactiver les boutons en fonction du contenu
  inputJson.addEventListener('input', updateButtonStates);
  outputJson.addEventListener('input', updateButtonStates);
  
  // État initial des boutons
  updateButtonStates();
});

// Formater le JSON
function formatJson() {
  try {
    // Valider d'abord le JSON
    const json = JSON.parse(inputJson.value);
    
    // Déterminer l'indentation
    let indent = Number(indentSelect.value);
    if (isNaN(indent) || indentSelect.value === 'tab') {
      indent = '\\t';
    }
    
    // Trier les clés si l'option est cochée
    let result;
    if (sortKeysCheckbox.checked) {
      result = JSON.stringify(sortObjectKeys(json), null, indent);
    } else {
      result = JSON.stringify(json, null, indent);
    }
    
    // Afficher le résultat
    outputJson.value = result;
    
    // Mettre à jour l'état des boutons
    updateButtonStates();
    
    // Mettre à jour le résultat de validation
    showValidationSuccess('JSON valide et formaté');
  } catch (error) {
    showValidationError('Erreur de formatage: ' + error.message);
  }
}

// Minifier le JSON
function minifyJson() {
  try {
    // Valider d'abord le JSON
    const json = JSON.parse(inputJson.value);
    
    // Minifier
    const result = JSON.stringify(json);
    
    // Afficher le résultat
    outputJson.value = result;
    
    // Mettre à jour l'état des boutons
    updateButtonStates();
    
    // Mettre à jour le résultat de validation
    showValidationSuccess('JSON valide et minifié');
  } catch (error) {
    showValidationError('Erreur de minification: ' + error.message);
  }
}

// Valider le JSON
function validateJson() {
  try {
    // Essayer de parser le JSON
    JSON.parse(inputJson.value);
    
    // Si pas d'erreur, le JSON est valide
    showValidationSuccess('Le JSON est valide');
  } catch (error) {
    showValidationError('JSON invalide: ' + error.message);
  }
}

// Effacer le champ d'entrée
function clearInput() {
  inputJson.value = '';
  outputJson.value = '';
  validationResult.innerHTML = '';
  validationResult.className = 'validation-result';
  updateButtonStates();
}

// Charger un exemple de JSON
function loadSampleJson() {
  inputJson.value = \`{
  "nom": "Dupont",
  "prenom": "Jean",
  "age": 35,
  "adresse": {
    "rue": "123 Rue de la République",
    "ville": "Paris",
    "codePostal": "75001",
    "pays": "France"
  },
  "telephone": [
    {
      "type": "personnel",
      "numero": "0123456789"
    },
    {
      "type": "professionnel",
      "numero": "0987654321"
    }
  ],
  "estClient": true,
  "derniereVisite": "2023-05-15T14:30:00Z"
}\`;
  updateButtonStates();
}

// Copier le résultat dans le presse-papier
function copyOutput() {
  const text = outputJson.value;
  if (!text) return;
  
  navigator.clipboard.writeText(text)
    .then(() => {
      // Indication visuelle temporaire
      const originalText = copyButton.textContent;
      copyButton.textContent = 'Copié !';
      setTimeout(() => {
        copyButton.textContent = originalText;
      }, 2000);
    })
    .catch(err => {
      showValidationError('Erreur lors de la copie: ' + err.message);
    });
}

// Trier les clés d'un objet récursivement
function sortObjectKeys(obj) {
  // Si ce n'est pas un objet ou si c'est null, le retourner tel quel
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  // Si c'est un tableau, trier ses éléments (mais pas les clés)
  if (Array.isArray(obj)) {
    return obj.map(item => sortObjectKeys(item));
  }
  
  // Créer un nouvel objet avec les clés triées
  return Object.keys(obj)
    .sort()
    .reduce((sorted, key) => {
      sorted[key] = sortObjectKeys(obj[key]);
      return sorted;
    }, {});
}

// Mettre à jour l'état des boutons
function updateButtonStates() {
  const hasInput = inputJson.value.trim() !== '';
  const hasOutput = outputJson.value.trim() !== '';
  
  formatButton.disabled = !hasInput;
  minifyButton.disabled = !hasInput;
  validateButton.disabled = !hasInput;
  clearButton.disabled = !hasInput && !hasOutput;
  copyButton.disabled = !hasOutput;
}

// Afficher un message de succès de validation
function showValidationSuccess(message) {
  validationResult.textContent = '✓ ' + message;
  validationResult.className = 'validation-result validation-success';
}

// Afficher un message d'erreur de validation
function showValidationError(message) {
  validationResult.textContent = '✗ ' + message;
  validationResult.className = 'validation-result validation-error';
}`;

// 3. Outil: UUID Generator
const uuidGeneratorHtml = `<div class="tool-container uuid-generator-tool">
  <div class="tool-header">
    <h2>Générateur d'UUID</h2>
    <p>Générez des identifiants universels uniques (UUID)</p>
  </div>
  
  <div class="tool-content">
    <div class="tool-main">
      <div class="uuid-display">
        <input type="text" id="uuid-output" readonly>
        <button id="copy-button" title="Copier"><i class="icon-copy">📋</i></button>
      </div>
      
      <div class="uuid-actions">
        <button id="generate-button" class="primary-button">Générer un UUID</button>
        <button id="generate-multiple-button">Générer plusieurs UUIDs</button>
      </div>
      
      <div class="uuid-options">
        <div class="option-group">
          <label for="version-select">Version:</label>
          <select id="version-select">
            <option value="4" selected>v4 (aléatoire)</option>
            <option value="1">v1 (basé sur l'horodatage)</option>
          </select>
        </div>
        
        <div class="option-group">
          <label for="format-select">Format:</label>
          <select id="format-select">
            <option value="standard">Standard (avec tirets)</option>
            <option value="no-hyphens">Sans tirets</option>
            <option value="braces">Avec accolades</option>
            <option value="uppercase">MAJUSCULES</option>
          </select>
        </div>
      </div>
      
      <div class="multiple-uuid-container" style="display: none;">
        <div class="multiple-options">
          <label for="count-input">Nombre d'UUIDs:</label>
          <input type="number" id="count-input" min="1" max="1000" value="10">
          <button id="generate-list-button">Générer la liste</button>
        </div>
        
        <textarea id="uuid-list" readonly></textarea>
        
        <div class="list-actions">
          <button id="copy-list-button">Copier la liste</button>
          <button id="download-list-button">Télécharger comme TXT</button>
        </div>
      </div>
    </div>
    
    <div class="uuid-info">
      <h3>À propos des UUIDs</h3>
      <p>Un UUID (Universally Unique IDentifier) est un identifiant de 128 bits standardisé par la RFC 4122 garantissant une unicité quasi-certaine à travers l'espace et le temps.</p>
      
      <h4>Versions d'UUID</h4>
      <ul>
        <li><strong>UUID v1</strong> : Basé sur l'horodatage et l'adresse MAC du système.</li>
        <li><strong>UUID v4</strong> : Généré à l'aide de nombres aléatoires ou pseudo-aléatoires.</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .uuid-generator-tool .tool-content {
    display: flex;
    flex-direction: column;
  }
  
  .tool-main {
    margin-bottom: 30px;
  }
  
  .uuid-display {
    display: flex;
    margin-bottom: 20px;
  }
  
  #uuid-output {
    flex-grow: 1;
    padding: 12px 15px;
    font-family: monospace;
    font-size: 16px;
    border: 1px solid var(--border-color);
    border-radius: 4px 0 0 4px;
    background-color: var(--input-bg);
    color: var(--text-color);
  }
  
  #copy-button {
    padding: 12px 15px;
    border: 1px solid var(--border-color);
    border-left: none;
    border-radius: 0 4px 4px 0;
    background-color: var(--button-bg);
    cursor: pointer;
  }
  
  #copy-button:hover {
    background-color: var(--button-hover-bg);
  }
  
  .uuid-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .primary-button {
    background-color: var(--accent-color);
    color: white;
    border-color: var(--accent-color-dark);
  }
  
  .primary-button:hover {
    background-color: var(--accent-color-dark);
  }
  
  .uuid-options {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .option-group {
    display: flex;
    align-items: center;
  }
  
  .option-group label {
    margin-right: 10px;
  }
  
  .multiple-uuid-container {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
  }
  
  .multiple-options {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
  }
  
  #count-input {
    width: 80px;
    padding: 8px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--input-bg);
    color: var(--text-color);
  }
  
  #uuid-list {
    width: 100%;
    height: 200px;
    padding: 12px;
    margin-bottom: 15px;
    font-family: monospace;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--input-bg);
    color: var(--text-color);
    resize: vertical;
  }
  
  .list-actions {
    display: flex;
    gap: 10px;
  }
  
  .uuid-info {
    background-color: var(--card-bg);
    padding: 20px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
  }
  
  .uuid-info h3 {
    margin-bottom: 15px;
  }
  
  .uuid-info p {
    margin-bottom: 15px;
    line-height: 1.6;
  }
  
  .uuid-info h4 {
    margin-bottom: 10px;
    margin-top: 20px;
  }
  
  .uuid-info ul {
    padding-left: 20px;
    line-height: 1.6;
  }
</style>`;

const uuidGeneratorJs = `// Éléments DOM
const uuidOutput = document.getElementById('uuid-output');
const copyButton = document.getElementById('copy-button');
const generateButton = document.getElementById('generate-button');
const generateMultipleButton = document.getElementById('generate-multiple-button');
const versionSelect = document.getElementById('version-select');
const formatSelect = document.getElementById('format-select');
const countInput = document.getElementById('count-input');
const generateListButton = document.getElementById('generate-list-button');
const uuidList = document.getElementById('uuid-list');
const copyListButton = document.getElementById('copy-list-button');
const downloadListButton = document.getElementById('download-list-button');
const multipleUuidContainer = document.querySelector('.multiple-uuid-container');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Générer un UUID initial
  generateUUID();
  
  // Écouter les événements
  generateButton.addEventListener('click', generateUUID);
  copyButton.addEventListener('click', copyUUID);
  generateMultipleButton.addEventListener('click', toggleMultipleMode);
  generateListButton.addEventListener('click', generateUUIDList);
  copyListButton.addEventListener('click', copyUUIDList);
  downloadListButton.addEventListener('click', downloadUUIDList);
  
  // Écouter les changements de version et format
  versionSelect.addEventListener('change', generateUUID);
  formatSelect.addEventListener('change', () => formatUUID(uuidOutput.value));
});

// Générer un UUID
async function generateUUID() {
  try {
    // Déterminer la version
    const version = versionSelect.value;
    
    // Utiliser l'API de l'application pour générer un UUID
    const uuid = await window.api.generateUUID();
    
    // Appliquer le format
    formatUUID(uuid);
  } catch (error) {
    showError('Erreur lors de la génération de l\\'UUID: ' + error.message);
  }
}

// Formater l'UUID selon les préférences
function formatUUID(uuid) {
  // S'assurer que l'UUID est en format standard
  const standardUUID = uuid.replace(/[{}\\-]/g, '').toLowerCase();
  
  // Appliquer le format sélectionné
  let formattedUUID;
  switch (formatSelect.value) {
    case 'no-hyphens':
      formattedUUID = standardUUID;
      break;
    case 'braces':
      formattedUUID = '{' + standardUUID.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5') + '}';
      break;
    case 'uppercase':
      formattedUUID = standardUUID.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5').toUpperCase();
      break;
    default: // standard
      formattedUUID = standardUUID.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
  }
  
  // Mettre à jour l'affichage
  uuidOutput.value = formattedUUID;
}

// Copier l'UUID dans le presse-papier
function copyUUID() {
  const uuid = uuidOutput.value;
  if (!uuid) return;
  
  navigator.clipboard.writeText(uuid)
    .then(() => {
      // Indication visuelle temporaire
      copyButton.innerHTML = '✓';
      setTimeout(() => {
        copyButton.innerHTML = '📋';
      }, 2000);
    })
    .catch(err => {
      showError('Erreur lors de la copie: ' + err.message);
    });
}

// Basculer l'affichage du mode multiple
function toggleMultipleMode() {
  const isVisible = multipleUuidContainer.style.display !== 'none';
  multipleUuidContainer.style.display = isVisible ? 'none' : 'block';
  
  // Générer la liste si elle est vide
  if (!isVisible && !uuidList.value) {
    generateUUIDList();
  }
}

// Générer une liste d'UUIDs
async function generateUUIDList() {
  try {
    // Obtenir le nombre d'UUIDs à générer
    const count = parseInt(countInput.value);
    if (isNaN(count) || count < 1 || count > 1000) {
      showError('Le nombre d\\'UUIDs doit être entre 1 et 1000');
      return;
    }
    
    // Déterminer la version et le format
    const version = versionSelect.value;
    const format = formatSelect.value;
    
    // Générer les UUIDs
    uuidList.value = 'Génération en cours...';
    
    // Liste pour stocker les UUIDs
    const uuids = [];
    
    // Générer les UUIDs un par un
    for (let i = 0; i < count; i++) {
      const uuid = await window.api.generateUUID();
      
      // Formater l'UUID
      let formattedUUID;
      switch (format) {
        case 'no-hyphens':
          formattedUUID = uuid.replace(/[\\-]/g, '');
          break;
        case 'braces':
          formattedUUID = '{' + uuid + '}';
          break;
        case 'uppercase':
          formattedUUID = uuid.toUpperCase();
          break;
        default: // standard
          formattedUUID = uuid;
      }
      
      uuids.push(formattedUUID);
    }
    
    // Mettre à jour la liste
    uuidList.value = uuids.join('\\n');
  } catch (error) {
    showError('Erreur lors de la génération des UUIDs: ' + error.message);
  }
}

// Copier la liste d'UUIDs dans le presse-papier
function copyUUIDList() {
  const list = uuidList.value;
  if (!list) return;
  
  navigator.clipboard.writeText(list)
    .then(() => {
      // Indication visuelle temporaire
      const originalText = copyListButton.textContent;
      copyListButton.textContent = 'Copié !';
      setTimeout(() => {
        copyListButton.textContent = originalText;
      }, 2000);
    })
    .catch(err => {
      showError('Erreur lors de la copie: ' + err.message);
    });
}

// Télécharger la liste d'UUIDs en tant que fichier texte
function downloadUUIDList() {
  const list = uuidList.value;
  if (!list) return;
  
  // Créer un blob avec le contenu
  const blob = new Blob([list], { type: 'text/plain' });
  
  // Créer un URL pour le blob
  const url = URL.createObjectURL(blob);
  
  // Créer un élément d'ancrage pour le téléchargement
  const a = document.createElement('a');
  a.href = url;
  a.download = 'uuids_' + new Date().toISOString().slice(0, 10) + '.txt';
  
  // Ajouter l'élément à la page, cliquer dessus, puis le supprimer
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Libérer l'URL
  URL.revokeObjectURL(url);
}

// Afficher une erreur
function showError(message) {
  // Créer une notification d'erreur
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-notification';
  errorDiv.textContent = message;
  errorDiv.style.position = 'fixed';
  errorDiv.style.bottom = '20px';
  errorDiv.style.right = '20px';
  errorDiv.style.backgroundColor = 'var(--error-bg)';
  errorDiv.style.color = 'var(--error-color)';
  errorDiv.style.padding = '10px 15px';
  errorDiv.style.borderRadius = '4px';
  errorDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
  errorDiv.style.zIndex = '1000';
  
  // Ajouter à la page
  document.body.appendChild(errorDiv);
  
  // Supprimer après quelques secondes
  setTimeout(() => {
    errorDiv.style.opacity = '0';
    errorDiv.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      errorDiv.remove();
    }, 500);
  }, 3000);
}
  `;