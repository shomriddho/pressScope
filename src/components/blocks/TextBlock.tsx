import type { DefaultNodeTypes, SerializedLinkNode } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText,
} from '@payloadcms/richtext-lexical/react'

interface TextBlockProps {
  content: any // Rich text data
  locale: string
}

export default function TextBlock({ content, locale }: TextBlockProps) {
  const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
    const { relationTo, value } = linkNode.fields.doc!
    if (typeof value !== 'object') {
      throw new Error('Expected value to be an object')
    }

    switch (relationTo) {
      case 'simple-pages':
        return `/${locale}/${value.url}`
      default:
        return `/${locale}/${relationTo}/${value.slug || value.url || 'unknown'}`
    }
  }

  const jsxConverters: JSXConvertersFunction<DefaultNodeTypes> = ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({ internalDocToHref }),
  })
  if (!content) return null

  return (
    <div className="prose lg:prose-xl mx-auto mb-8 dark:prose-invert">
      <RichText converters={jsxConverters} data={content} />
    </div>
  )
}
