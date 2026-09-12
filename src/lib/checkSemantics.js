import nlp from 'compromise';
import { fleschKincaid } from 'flesch-kincaid';

/**
 * Perform server-side semantic analysis of the main body text
 * using entirely free local NLP libraries.
 */
export function checkSemantics(text) {
  if (!text || text.length < 50) {
    return {
      entityDensity: 0,
      readabilityScore: null,
      topEntities: [],
      hasSufficientSemantics: false
    };
  }

  // 1. Entity Extraction (People, Places, Organizations, Topics)
  const doc = nlp(text);
  const entities = doc.topics().out('topk');
  
  // Calculate Density (Entities per 1000 words)
  const wordCount = doc.wordCount() || 1;
  const entityDensity = (entities.length / wordCount) * 1000;

  // 2. Readability Score (Flesch-Kincaid)
  let readabilityScore = null;
  try {
    const syllables = countSyllables(text);
    const sentences = doc.sentences().length || 1;
    readabilityScore = fleschKincaid({
      sentence: sentences,
      word: wordCount,
      syllable: syllables
    });
  } catch (e) {
    console.error('Readability calculation failed', e);
  }

  // Determine if it passes basic semantic threshold
  const hasSufficientSemantics = entityDensity > 5;

  return {
    entityDensity: Number(entityDensity.toFixed(2)),
    readabilityScore: readabilityScore != null ? Number(readabilityScore.toFixed(2)) : null,
    topEntities: entities.slice(0, 5).map(e => e.normal),
    hasSufficientSemantics
  };
}

// Simple fallback syllable counter if library doesn't provide it easily
function countSyllables(word) {
  word = word.toLowerCase();
  if(word.length <= 3) { return 1; }
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const match = word.match(/[aeiouy]{1,2}/g);
  return match != null ? match.length : 1;
}
