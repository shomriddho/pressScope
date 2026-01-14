'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface LogoData {
  smallLight?: string
  smallDark?: string
  mediumLight?: string
  mediumDark?: string
  largeLight?: string
  largeDark?: string
}

interface LogoProps {
  size: 'small' | 'mid' | 'large'
}

export default function Logo({ size }: LogoProps) {
  const { resolvedTheme } = useTheme()
  const [logoData, setLogoData] = useState<LogoData | null>(null)
  const [svgContents, setSvgContents] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const fetchSvg = async (url: string) => {
    try {
      const response = await fetch(url)
      return await response.text()
    } catch (e) {
      return ''
    }
  }

  useEffect(() => {
    const cacheKey = 'active-logo-cache'
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        const { data, contents } = JSON.parse(cached)
        setLogoData(data)
        setSvgContents(contents)
        setLoading(false)
      } catch (e) {
        // invalid cache
      }
    }

    fetch('/api/active-logo')
      .then((r) => r.json())
      .then(async (data: LogoData) => {
        setLogoData(data)
        if (!cached) {
          // First load, fetch current theme's SVG
          const isDark = resolvedTheme === 'dark'
          const key = size === 'mid' ? 'medium' : size
          const svgKey = isDark ? `${key}Dark` : `${key}Light`
          const url = data[svgKey as keyof LogoData]
          if (url) {
            const content = await fetchSvg(url)
            setSvgContents({ [svgKey]: content })
            setLoading(false)
          } else {
            setLoading(false)
          }
        }
        // Always fetch all in background for cache
        const contents: Record<string, string> = {}
        const keys = [
          'smallLight',
          'smallDark',
          'mediumLight',
          'mediumDark',
          'largeLight',
          'largeDark',
        ]
        await Promise.all(
          keys.map(async (key) => {
            if (data[key as keyof LogoData]) {
              contents[key] = await fetchSvg(data[key as keyof LogoData]!)
            }
          }),
        )
        setSvgContents(contents)
        localStorage.setItem(cacheKey, JSON.stringify({ data, contents }))
      })
      .catch(() => {
        setLoading(false)
        if (!logoData) setLogoData(null)
      })
  }, [])

  // Fetch other theme's SVG when theme changes
  useEffect(() => {
    if (!logoData) return
    const isDark = resolvedTheme === 'dark'
    const key = size === 'mid' ? 'medium' : size
    const svgKey = isDark ? `${key}Dark` : `${key}Light`
    if (!svgContents[svgKey] && logoData[svgKey as keyof LogoData]) {
      fetchSvg(logoData[svgKey as keyof LogoData]!).then((content) => {
        setSvgContents((prev) => ({ ...prev, [svgKey]: content }))
      })
    }
  }, [resolvedTheme, logoData, svgContents, size])

  if (loading && !logoData) return <Skeleton className="w-8 h-8" />

  if (!logoData) return null

  const isDark = resolvedTheme === 'dark'
  const key = size === 'mid' ? 'medium' : size
  const svgKey = isDark ? `${key}Dark` : `${key}Light`
  const svgContent = svgContents[svgKey]

  if (!svgContent) return null

  return <div dangerouslySetInnerHTML={{ __html: svgContent }} />
}
