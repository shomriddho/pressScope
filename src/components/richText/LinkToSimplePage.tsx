'use client'

import { useState, useEffect } from 'react'
import { getPayload } from 'payload'
import config from '../../payload.config'
import type { SimplePage } from '../../payload-types'
import type { Payload } from 'payload'

interface LinkToSimplePageProps {
  value?: { url?: string; target?: string }
  onChange: (value: { url: string; target: string }) => void
  initialValue?: { url?: string; target?: string }
}

export function LinkToSimplePage({ value, onChange, initialValue }: LinkToSimplePageProps) {
  const [payload, setPayload] = useState<Payload | null>(null)
  const [pages, setPages] = useState<SimplePage[]>([])
  const [selectedPageId, setSelectedPageId] = useState<number | ''>('')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''

  useEffect(() => {
    getPayload({ config }).then(setPayload)
  }, [])

  useEffect(() => {
    if (!payload) return
    const fetchPages = async () => {
      try {
        const result = await payload.find({
          collection: 'simple-pages',
          limit: 100,
        })
        setPages(result.docs)
      } catch (error) {
        console.error('Error fetching pages:', error)
      }
    }
    fetchPages()
  }, [payload])

  useEffect(() => {
    if (value?.url) {
      // Find the page by URL, extracting relative part from absolute URL
      const relativeUrl = value.url.replace(new RegExp(`^${baseUrl}`), '').replace(/^\/+/, '')
      const page = pages.find((p) => p.url === relativeUrl)
      if (page) {
        setSelectedPageId(page.id)
      }
    }
  }, [value, pages, baseUrl])

  const handlePageChange = (pageId: string) => {
    const id = pageId ? parseInt(pageId) : ''
    setSelectedPageId(id)
    const page = pages.find((p) => p.id === id)
    if (page) {
      onChange({
        url: `${baseUrl}/${page.url}`,
        target: value?.target || '_self',
      })
    }
  }

  const handleTargetChange = (target: string) => {
    onChange({
      url: value?.url || '',
      target,
    })
  }

  return (
    <div className="link-to-simple-page space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Select Page</label>
        <select
          value={selectedPageId === '' ? '' : selectedPageId.toString()}
          onChange={(e) => handlePageChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a page...</option>
          {pages.map((page) => (
            <option key={page.id} value={page.id.toString()}>
              {page.name} ({page.url})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Target</label>
        <select
          value={value?.target || '_self'}
          onChange={(e) => handleTargetChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="_self">Same tab</option>
          <option value="_blank">New tab</option>
        </select>
      </div>
    </div>
  )
}
