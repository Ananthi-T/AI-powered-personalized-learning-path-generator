import { useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'

type Dict = Record<string, Record<'English' | 'Tamil' | 'Hindi', string>>

const dict: Dict = {
  'nav.aiSnapshot': { English: 'AI Career Snapshot', Tamil: 'ஏஐ தொழில் நிலை', Hindi: 'एआई करियर स्नैपशॉट' },
  'nav.learningPath': { English: 'Dynamic Learning Path', Tamil: 'மாற்றுப்படும் கற்றல் பாதை', Hindi: 'गतिशील सीखने का मार्ग' },
  'nav.dailyTasks': { English: 'Daily Micro Tasks', Tamil: 'தினசரி சிறு பணிகள்', Hindi: 'दैनिक माइक्रो कार्य' },
  'nav.skillValidation': { English: 'AI Skill Validation', Tamil: 'ஏஐ திறன் சரிபார்ப்பு', Hindi: 'एआई कौशल सत्यापन' },
  'nav.adaptivePath': { English: 'Adaptive Learning Path', Tamil: 'செயல்முறை கற்றல் பாதை', Hindi: 'अनुकूली सीखने का मार्ग' },
  'nav.dashboard': { English: 'Career Readiness Dashboard', Tamil: 'தொழில் தயார் பலகை', Hindi: 'करियर तत्परता डैशबोर्ड' },
  'nav.aiCoach': { English: 'AI Career Coach', Tamil: 'ஏஐ தொழில் வழிகாட்டி', Hindi: 'एआई करियर कोच' },
  'nav.realWorld': { English: 'Real World Alignment', Tamil: 'உண்மை உலக இணைவு', Hindi: 'वास्तविक दुनिया संरेखण' },
  'nav.settings': { English: 'Settings', Tamil: 'அமைப்புகள்', Hindi: 'सेटिंग्स' },
  'nav.profile': { English: 'Profile', Tamil: 'சுயவிவரம்', Hindi: 'प्रोफ़ाइल' },
  'settings.title': { English: 'Settings', Tamil: 'அமைப்புகள்', Hindi: 'सेटिंग्स' },
  'settings.subtitle': { English: 'Manage account, privacy, language, and theme.', Tamil: 'கணக்கு, தனியுரிமை, மொழி, தீம் மேலாண்மை.', Hindi: 'खाता, गोपनीयता, भाषा और थीम प्रबंधित करें.' },
  'settings.account': { English: 'Account Preferences', Tamil: 'கணக்கு முன்னுரிமைகள்', Hindi: 'खाता वरीयताएँ' },
  'settings.privacy': { English: 'Privacy Settings', Tamil: 'தனியுரிமை அமைப்புகள்', Hindi: 'गोपनीयता सेटिंग्स' },
  'settings.language': { English: 'Language Preferences', Tamil: 'மொழி முன்னுரிமைகள்', Hindi: 'भाषा वरीयताएँ' },
  'settings.theme': { English: 'Theme Preferences', Tamil: 'தீம் முன்னுரிமைகள்', Hindi: 'थीम वरीयताएँ' },
  'settings.help': { English: 'Help Center', Tamil: 'உதவி மையம்', Hindi: 'सहायता केंद्र' },
  'lang.english': { English: 'English', Tamil: 'ஆங்கிலம்', Hindi: 'अंग्रेज़ी' },
  'lang.tamil': { English: 'Tamil', Tamil: 'தமிழ்', Hindi: 'तमिल' },
  'lang.hindi': { English: 'Hindi', Tamil: 'இந்தி', Hindi: 'हिंदी' },
  'theme.dark': { English: 'Dark', Tamil: 'டார்க்', Hindi: 'डार्क' },
  'theme.light': { English: 'Light', Tamil: 'லைட்', Hindi: 'लाइट' },
  'theme.blueLight': { English: 'Blue', Tamil: 'நீலம்', Hindi: 'नीला' },
  'action.changePassword': { English: 'Change Password', Tamil: 'கடவுச்சொல்லை மாற்றவும்', Hindi: 'पासवर्ड बदलें' },
  'action.deleteAccount': { English: 'Delete Account', Tamil: 'கணக்கை நீக்கவும்', Hindi: 'खाता हटाएं' }
}

export function useI18n() {
  const { language } = useLanguage()
  const t = useMemo(() => {
    return (k: string) => {
      const row = dict[k]
      if (!row) return k
      return row[language] || row['English']
    }
  }, [language])
  return { t, language }
}
