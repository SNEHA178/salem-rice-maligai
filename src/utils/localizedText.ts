export type SupportedLanguage = 'en' | 'ta';

export interface LocalizedString {
  en?: string;
  ta?: string;
}

/**
 * Extracts the appropriate string based on the active language.
 * Seamlessly handles:
 * 1. Bilingual objects: { en: "Ponni Rice", ta: "பொன்னி அரிசி" }
 * 2. Legacy objects: { name: "...", tamilName: "..." }
 * 3. Plain strings with fallback
 * Always falls back to the opposite language if the requested language is missing/empty.
 */
export function getLocalizedText(
  value: any,
  language: SupportedLanguage = 'en',
  fallbackText: string = ''
): string {
  if (value === null || value === undefined) {
    return fallbackText;
  }

  // Case 1: Plain string
  if (typeof value === 'string') {
    return value;
  }

  // Case 2: Bilingual dictionary object { en: "...", ta: "..." }
  if (typeof value === 'object') {
    const enVal = typeof value.en === 'string' ? value.en.trim() : '';
    const taVal = typeof value.ta === 'string' ? value.ta.trim() : '';

    if (language === 'ta') {
      return taVal || enVal || fallbackText;
    }
    return enVal || taVal || fallbackText;
  }

  return String(value);
}

/**
 * Extracts a product or category name with language awareness,
 * supporting both new schema { name: { en, ta } } and legacy { name: string, tamilName?: string }.
 */
export function getLocalizedName(
  item: any,
  language: SupportedLanguage = 'en'
): string {
  if (!item) return '';

  // Direct localized object item.name = { en, ta }
  if (item.name && typeof item.name === 'object') {
    return getLocalizedText(item.name, language);
  }

  // Legacy item.name (string) + item.tamilName (string)
  if (language === 'ta' && item.tamilName) {
    return item.tamilName;
  }

  if (typeof item.name === 'string') {
    return item.name;
  }

  return '';
}

/**
 * Extracts description with language awareness.
 */
export function getLocalizedDescription(
  item: any,
  language: SupportedLanguage = 'en'
): string {
  if (!item) return '';

  if (item.description && typeof item.description === 'object') {
    return getLocalizedText(item.description, language);
  }

  if (language === 'ta' && item.tamilDescription) {
    return item.tamilDescription;
  }

  if (typeof item.description === 'string') {
    return item.description;
  }

  return '';
}

/**
 * Translates product unit with numeric preservation.
 * E.g., "25kg Bag" -> "25 கிலோ பை"
 * "1 kg" -> "1 கிலோ"
 * "500 g" -> "500 கிராம்"
 * "1 Litre" -> "1 லிட்டர்"
 */
export function formatLocalizedUnit(
  unit: any,
  language: SupportedLanguage = 'en'
): string {
  if (!unit) return '';

  if (typeof unit === 'object') {
    return getLocalizedText(unit, language);
  }

  const raw = String(unit).trim();
  if (language === 'en') {
    return raw;
  }

  // Tamil replacements for common grocery units while keeping numbers
  let tamilUnit = raw
    .replace(/\bkg\b/gi, 'கிலோ')
    .replace(/\bg\b/gi, 'கிராம்')
    .replace(/\bgrams?\b/gi, 'கிராம்')
    .replace(/\blitres?\b/gi, 'லிட்டர்')
    .replace(/\bltr\b/gi, 'லிட்டர்')
    .replace(/\bml\b/gi, 'மில்லி')
    .replace(/\bbags?\b/gi, 'பை')
    .replace(/\bpiece\b/gi, 'பீஸ்')
    .replace(/\bpackets?\b/gi, 'பாக்கெட்')
    .replace(/\bpkt\b/gi, 'பாக்கெட்')
    .replace(/\bbottle\b/gi, 'பாட்டில்')
    .replace(/\bbox\b/gi, 'பாக்ஸ்');

  return tamilUnit;
}

/**
 * Translates order statuses cleanly.
 */
export function formatLocalizedStatus(
  status: string,
  language: SupportedLanguage = 'en'
): string {
  if (!status) return '';
  if (language === 'en') {
    return status;
  }

  const normalized = status.toUpperCase().replace(/\s+/g, '_');
  switch (normalized) {
    case 'PENDING':
      return 'நிலுவையில்';
    case 'CONFIRMED':
      return 'உறுதிசெய்யப்பட்டது';
    case 'PROCESSING':
      return 'செயலாக்கத்தில்';
    case 'OUT_FOR_DELIVERY':
    case 'OUT_FOR_DELIVERY_':
      return 'விநியோகத்திற்கு புறப்பட்டது';
    case 'DELIVERED':
      return 'விநியோகிக்கப்பட்டது';
    case 'CANCELLED':
      return 'ரத்து செய்யப்பட்டது';
    default:
      return status;
  }
}
