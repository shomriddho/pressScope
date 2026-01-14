'use client'

import { useRouter, usePathname } from 'next/navigation'
import posthog from 'posthog-js'
import { Button } from '../animate-ui/components/buttons/button'

const languages = [
  { code: 'bn', name: 'বাংলা' },
  { code: 'en', name: 'English' },
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1] || 'bn'
  const currentLang = languages.find((lang) => lang.code === currentLocale) || languages[0]
  const otherLang = languages.find((lang) => lang.code !== currentLocale) || languages[1]

  const switchLanguage = () => {
    // Track language switch event
    posthog.capture('language_switched', {
      from_language: currentLocale,
      to_language: otherLang.code,
      current_path: pathname,
    })
    // Replace the locale in the pathname
    const newPath = pathname.replace(`/${currentLocale}`, `/${otherLang.code}`)
    router.push(newPath)
  }

  return (
    <Button onClick={switchLanguage}>
      <span className="text-md font-medium dark:text-black">{otherLang.name}</span>
    </Button>
  )
}
