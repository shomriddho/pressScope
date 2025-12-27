import { RichText } from '@payloadcms/richtext-lexical/react'
import { HeroVideoDialog } from '../ui/hero-video-dialog'

interface VideoBlockProps {
  youtubeUrl: string
  title?: string
  description?: any // Rich text data
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

export default function VideoBlock({ youtubeUrl, title, description }: VideoBlockProps) {
  const videoId = extractYouTubeId(youtubeUrl)

  if (!videoId) {
    return (
      <div className="mb-8 p-4 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400">Invalid YouTube URL</p>
      </div>
    )
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}`
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

  return (
    <div className="mb-8">
      {title && <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>}

      <div className="max-w-4xl mx-auto">
        <HeroVideoDialog
          videoSrc={embedUrl}
          thumbnailSrc={thumbnailUrl}
          thumbnailAlt={title || 'YouTube Video'}
          animationStyle="from-center"
        />
      </div>

      {description && (
        <div className="prose lg:prose-xl mx-auto mt-6 dark:prose-invert">
          <RichText data={description} />
        </div>
      )}
    </div>
  )
}
