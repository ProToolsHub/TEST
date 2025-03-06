// Références aux éléments du DOM
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
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  
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
    row.innerHTML = `
      <td>${word}</td>
      <td>${count}</td>
      <td>${frequency}%</td>
    `;
    
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
  textInput.value = `L'informatique est un domaine d'activité scientifique, technique, et industriel concernant le traitement automatique de l'information numérique par l'exécution de programmes informatiques hébergés par des dispositifs électriques-électroniques : des systèmes embarqués, des ordinateurs, des robots, des automates, etc.

Ces champs d'application peuvent être séparés en deux branches :
- Théorique : qui concerne la définition de concepts et modèles
- Pratique : qui s'intéresse aux techniques concrètes d'implantation et de mise en œuvre

Certains domaines de l'informatique peuvent être très abstraits, comme la complexité algorithmique, et d'autres peuvent être plus proches d'un public profane. Ainsi, la théorie des langages demeure un domaine davantage accessible aux professionnels formés (description des ordinateurs et méthodes de programmation), tandis que les métiers liés aux interfaces homme-machine sont accessibles à un plus large public.`;
  
  analyzeText();
}

function copyStatistics() {
  // Créer une chaîne formatée des statistiques
  const stats = `
Statistiques de texte:
-------------------
Nombre de mots: ${wordCount.textContent}
Nombre de caractères: ${charCount.textContent}
Nombre de caractères (sans espaces): ${charNoSpacesCount.textContent}
Nombre de phrases: ${sentenceCount.textContent}
Nombre de paragraphes: ${paragraphCount.textContent}
Temps de lecture estimé: ${readingTime.textContent} minute(s)

Détails sur les mots:
-------------------
Longueur moyenne des mots: ${avgWordLength.textContent}
Mots uniques: ${uniqueWords.textContent}
Mots longs (>6 lettres): ${longWords.textContent}

Généré avec IT-Tools Desktop
  `;
  
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
      console.error('Erreur lors de la copie des statistiques:', err);
    });
}