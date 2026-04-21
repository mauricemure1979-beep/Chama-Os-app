import type { VoiceParseResult } from '@/types/database';

/**
 * Voice & Text Parser for Chama OS
 * Parses Swahili/Sheng voice dictation for contribution records.
 */

// Swahili number words to numeric
const numberWords: Record<string, number> = {
  'sifuri': 0, 'moja': 1, 'mmoja': 1, 'mbili': 2, 'tatu': 3, 'nne': 4,
  'tano': 5, 'sita': 6, 'saba': 7, 'nane': 8, 'tisa': 9, 'kumi': 10,
  'ishirini': 20, 'thelathini': 30, 'arubaini': 40, 'hamsini': 50,
  'sitini': 60, 'sabini': 70, 'thembani': 80, 'tisini': 90,
  'elfu': 1000, 'miliyoni': 1000000, 'shilingi': 1, 'sh': 1, 'mia': 100
};

// Sheng abbreviations
const shengAbbrevs: Record<string, number> = {
  '2k': 2000, '3k': 3000, '4k': 4000, '5k': 5000, '10k': 10000,
  '20k': 20000, '50k': 50000, '100k': 100000, '1m': 1000000,
  '100b': 100, '50b': 50, '20b': 20
};

// Time word handlers
const timeWords: Record<string, (today: Date) => Date> = {
  'leo': () => new Date(),
  'jana': () => new Date(Date.now() - 86400000),
  'kesho': () => new Date(Date.now() + 86400000),
  'wiki iliyopita': () => new Date(Date.now() - 604800000),
  'ijayo': () => new Date(Date.now() + 604800000)
};

// Action verbs indicating a contribution
const actionVerbs = ['ametuma', 'ameweka', 'alituma', 'alihamsika', 'huduma', 'tuma', 'weka', 'hamsika'];

/**
 * Normalize input text
 */
function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract amount from words
 */
function extractAmount(words: string[]): { value: number; index: number } | null {
  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (shengAbbrevs[word]) return { value: shengAbbrevs[word], index: i };

    const numericMatch = word.match(/^(\d+)\s*(\/)?=$/);
    if (numericMatch) return { value: parseInt(numericMatch[1], 10), index: i };

    if (/^\d+$/.test(word)) {
      const value = parseInt(word, 10);
      if (value >= 50 && value <= 1000000) return { value, index: i };
    }

    if (numberWords[word]) return { value: numberWords[word], index: i };
  }
  return null;
}

/**
 * Extract date reference from words
 */
function extractDate(words: string[]): Date | null {
  for (const [word, getDate] of Object.entries(timeWords)) {
    if (words.includes(word)) return getDate(new Date());
  }

  const datePatterns = [
    /(?:tarehe|siku)\s+(\d{1,2})/,
    /(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/
  ];

  const fullText = words.join(' ');
  for (const pattern of datePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = match[2] ? parseInt(match[2], 10) - 1 : new Date().getMonth();
      const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();
      return new Date(year, month, day);
    }
  }
  return null;
}

/**
 * Extract member name from words
 */
function extractMemberName(words: string[]): string {
  const amountIdx = words.findIndex(w => shengAbbrevs[w] || /^\d+$/.test(w));
  let endIdx = amountIdx > 0 ? amountIdx : words.length;

  for (let i = 0; i < endIdx; i++) {
    if (timeWords[words[i]]) { endIdx = i; break; }
  }

  const candidateWords: string[] = [];
  for (let i = 0; i < endIdx; i++) {
    const word = words[i];
    if (['kwa', 'ni', 'ya', 'wa', 'mimi', 'yeye'].includes(word)) continue;
    if (actionVerbs.includes(word)) break;
    if (/\d/.test(word)) break;
    candidateWords.push(word);
  }

  return candidateWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Main parsing entry point
 */
export function parseVoiceInput(text: string): VoiceParseResult {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);

  let memberName = '';
  let amount: number | null = null;
  let date: Date | null = null;
  let confidence = 0.5;

  const amountResult = extractAmount(words);
  if (amountResult) { amount = amountResult.value; confidence += 0.2; }

  const extractedDate = extractDate(words);
  if (extractedDate) { date = extractedDate; confidence += 0.1; }

  memberName = extractMemberName(words);

  if (!date) { date = new Date(); confidence -= 0.1; }

  if (memberName) confidence += 0.2;
  if (amount) confidence += 0.2;

  return { memberName, amount, date, confidence: Math.min(confidence, 1.0), raw_text: text };
}

/**
 * Fuzzy name matching for voice dictation errors
 */
export function getFuzzyNameSuggestions(query: string, allNames: string[]): string[] {
  const normalized = query.toLowerCase().trim();
  const scores: Array<{ name: string; score: number }> = [];

  for (const name of allNames) {
    const nameLower = name.toLowerCase();
    let score = 0;

    if (nameLower === normalized) score += 100;
    else if (nameLower.startsWith(normalized)) score += 80;
    else if (nameLower.includes(normalized)) score += 50;

    const commonPrefix = Math.min(4, normalized.length, nameLower.length);
    for (let i = 0; i < commonPrefix; i++) {
      if (normalized[i] === nameLower[i]) score += 10;
      else break;
    }

    scores.push({ name, score });
  }

  return scores
    .filter(s => s.score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.name);
}

/**
 * Validate parse result
 */
export function validateParseResult(result: VoiceParseResult): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!result.memberName || result.memberName.length < 2) {
    errors.push('Jina la mwanachama haijulikani (Member name unclear)');
  }
  if (!result.amount || result.amount <= 0) {
    errors.push('Kiasi haijulikani (Amount unclear)');
  }
  if (result.amount && (result.amount < 50 || result.amount > 1000000)) {
    errors.push('Kiasi kinachokubalika ni KES 50 - KES 1,000,000');
  }

  return { isValid: errors.length === 0, errors };
}
