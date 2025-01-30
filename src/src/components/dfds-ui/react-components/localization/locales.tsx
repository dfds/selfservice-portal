import * as flags from '@dfds-ui/icons/flags'

export const locales = [
  'en',
  'nl-BE',
  'bg-BG',
  'pt-BR',
  'en-CA',
  'zh-CN',
  'cs-CZ',
  'da-DK',
  'et-EE',
  'fi-FI',
  'fr-BE',
  'fr-FR',
  'fr-MA',
  'de-DE',
  'hu-HU',
  'it-IT',
  'ja-JP',
  'lv-LV',
  'lt-LT',
  'nl-NL',
  'nb-NO',
  'pl-PL',
  'ro-RO',
  'ru-RU',
  'sk-SK',
  'ko-KR',
  'es-ES',
  'sv-SE',
  'tr-TR',
  'en-GB',
  'en-US',
] as const

export type Locale = typeof locales[number]

export const fallbackLocale = 'en'

export type LocaleInfo = {
  /**
   * Name of the country
   */
  name: string
  /**
   * Country (and occasionally the language) expressed in native language.
   */
  nativeName: string
  /**
   * Country calling code
   */
  callingCode: string
  /**
   * Dialing trunk prefix
   */
  callingTrunkPrefix?: string
  /**
   * Key of flag icon component
   */
  flagIcon: keyof typeof flags
}

export const localeData: { [k in Locale]: LocaleInfo } = {
  en: { name: 'International', callingCode: '+', nativeName: 'International', flagIcon: 'FlagInt' },
  'nl-BE': {
    name: 'Belgium',
    callingCode: '+32',
    callingTrunkPrefix: '0',
    nativeName: 'België - Nederlands',
    flagIcon: 'FlagBe',
  },
  'fr-BE': {
    name: 'Belgium',
    callingCode: '+32',
    callingTrunkPrefix: '0',
    nativeName: 'Belgique - Français',
    flagIcon: 'FlagBe',
  },
  'bg-BG': {
    name: 'Bulgaria',
    callingCode: '+359',
    callingTrunkPrefix: '0',
    nativeName: 'България',
    flagIcon: 'FlagBg',
  },
  'pt-BR': {
    name: 'Brazil',
    callingCode: '+55',
    callingTrunkPrefix: '0',
    nativeName: 'Brasil - Português',
    flagIcon: 'FlagBr',
  },
  'en-CA': {
    name: 'Canada',
    callingCode: '+1',
    callingTrunkPrefix: '1',
    nativeName: 'Canada - English',
    flagIcon: 'FlagCa',
  },
  'zh-CN': { name: 'China', callingCode: '+86', callingTrunkPrefix: '0', nativeName: '中国', flagIcon: 'FlagCn' },
  'cs-CZ': { name: 'Czech Republic', callingCode: '+420', nativeName: 'Česká republika', flagIcon: 'FlagCz' },
  'da-DK': { name: 'Denmark', callingCode: '+45', nativeName: 'Danmark', flagIcon: 'FlagDk' },
  'et-EE': { name: 'Estonia', callingCode: '+372', nativeName: 'Eesti', flagIcon: 'FlagEe' },
  'fi-FI': { name: 'Finland', callingCode: '+358', callingTrunkPrefix: '0', nativeName: 'Suomi', flagIcon: 'FlagFi' },
  'fr-FR': { name: 'France', callingCode: '+33', callingTrunkPrefix: '0', nativeName: 'France', flagIcon: 'FlagFr' },
  'fr-MA': {
    name: 'Morocco',
    callingCode: '+212',
    callingTrunkPrefix: '0',
    nativeName: 'Maroc - Français',
    flagIcon: 'FlagMa',
  },
  'de-DE': {
    name: 'Germany',
    callingCode: '+49',
    callingTrunkPrefix: '0',
    nativeName: 'Deutschland',
    flagIcon: 'FlagDe',
  },
  'hu-HU': {
    name: 'Hungary',
    callingCode: '+36',
    callingTrunkPrefix: '06',
    nativeName: 'Magyarország',
    flagIcon: 'FlagHu',
  },
  'it-IT': { name: 'Italy', callingCode: '+39', nativeName: 'Italia', flagIcon: 'FlagIt' },
  'ja-JP': { name: 'Japan', callingCode: '+81', callingTrunkPrefix: '0', nativeName: '日本', flagIcon: 'FlagJp' },
  'lv-LV': { name: 'Latvia', callingCode: '+371', nativeName: 'Latvija', flagIcon: 'FlagLv' },
  'lt-LT': {
    name: 'Lithuania',
    callingCode: '+370',
    callingTrunkPrefix: '8',
    nativeName: 'Lietuva',
    flagIcon: 'FlagLt',
  },
  'nl-NL': {
    name: 'Netherlands',
    callingCode: '+31',
    callingTrunkPrefix: '0',
    nativeName: 'Nederland',
    flagIcon: 'FlagNl',
  },
  'nb-NO': { name: 'Norway', callingCode: '+47', nativeName: 'Norge', flagIcon: 'FlagNo' },
  'pl-PL': { name: 'Poland', callingCode: '+48', nativeName: 'Polska', flagIcon: 'FlagPl' },
  'ro-RO': { name: 'Romania', callingCode: '+40', callingTrunkPrefix: '0', nativeName: 'România', flagIcon: 'FlagRo' },
  'ru-RU': { name: 'Russia', callingCode: '+7', callingTrunkPrefix: '8', nativeName: 'Россия', flagIcon: 'FlagRu' },
  'sk-SK': {
    name: 'Slovakia',
    callingCode: '+421',
    callingTrunkPrefix: '0',
    nativeName: 'Slovensko',
    flagIcon: 'FlagSk',
  },
  'ko-KR': {
    name: 'South Korea',
    callingCode: '+82',
    callingTrunkPrefix: '0',
    nativeName: '대한민국',
    flagIcon: 'FlagKr',
  },
  'es-ES': { name: 'Spain', callingCode: '+34', nativeName: 'España', flagIcon: 'FlagEs' },
  'sv-SE': { name: 'Sweden', callingCode: '+46', callingTrunkPrefix: '0', nativeName: 'Sverige', flagIcon: 'FlagSe' },
  'tr-TR': { name: 'Turkey', callingCode: '+90', callingTrunkPrefix: '0', nativeName: 'Türkçe', flagIcon: 'FlagTr' },
  'en-GB': {
    name: 'United Kingdom',
    callingCode: '+44',
    callingTrunkPrefix: '0',
    nativeName: 'United Kingdom - English',
    flagIcon: 'FlagGb',
  },
  'en-US': {
    name: 'United States',
    callingCode: '+1',
    callingTrunkPrefix: '1',
    nativeName: 'United States',
    flagIcon: 'FlagUs',
  },
}

/**
 * Returns an array of locales where each country only appears once.
 *
 * @return {Locale[]}
 */
export function uniqueCountryLocales(): Locale[] {
  const processed: string[] = []
  return locales.filter((locale) => {
    const split = locale.split('-')
    if (split.length === 2) {
      if (processed.indexOf(split[1]) !== -1) {
        return false
      }
      processed.push(split[1])
    }
    return true
  })
}
