import { RichText } from '@payloadcms/richtext-lexical/react'

interface TextBlockProps {
  content: any // Rich text data
}

export default function TextBlock({ content }: TextBlockProps) {
  if (!content) return null

  return (
    <div className="prose lg:prose-xl mx-auto mb-8 dark:prose-invert">
      <RichText data={content} />
    </div>
  )
}
