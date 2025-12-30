'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface LikedArticlesProps {
  userId: string
  type: 'like' | 'dislike'
}

interface Article {
  id: string
  title: string
  fullUrl: string
}

export default function LikedArticles({ userId, type }: LikedArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`/api/user-liked-articles?userId=${userId}&type=${type}`)
        if (response.ok) {
          const data = await response.json()
          setArticles(data)
        } else {
          setArticles([])
        }
      } catch (error) {
        console.error('Error fetching liked articles:', error)
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [userId, type])

  if (loading) {
    return <p>Loading...</p>
  }

  if (articles.length === 0) {
    return <p className="text-sm text-muted-foreground">No {type}d articles yet.</p>
  }

  return (
    <div className="space-y-2">
      {articles.map((article) => (
        <div key={article.id} className="border p-2 rounded">
          <Link href={article.fullUrl} className="text-blue-600 hover:underline">
            {article.title}
          </Link>
        </div>
      ))}
    </div>
  )
}
