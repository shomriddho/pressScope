'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from './animate-ui/components/buttons/button'

const languages = [
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1] || 'bn'
  const currentLang = languages.find((lang) => lang.code === currentLocale) || languages[0]

  const switchLanguage = (newLocale: string) => {
    if (newLocale === currentLocale) return

    // Replace the locale in the pathname
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
    router.push(newPath)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button onClick={() => setIsOpen(!isOpen)}>
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-sm font-medium dark:text-black">{currentLang.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                lang.code === currentLocale ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.name}</span>
              {lang.code === currentLocale && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
