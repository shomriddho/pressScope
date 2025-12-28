import TextBlock from './blocks/TextBlock'
import ImageBlock from './blocks/ImageBlock'
import VideoBlock from './blocks/VideoBlock'
import ContactFormBlock from './blocks/ContactFormBlock'
import TwoColumnLayoutBlock from './blocks/TwoColumnLayoutBlock'

interface PageContentProps {
  content: any[] // Array of blocks
  locale: string
}

export default function PageContent({ content, locale }: PageContentProps) {
  if (!content || !Array.isArray(content)) return null

  return (
    <div className="space-y-8 w-full">
      {content.map((block, index) => {
        switch (block.blockType) {
          case 'textBlock':
            return <TextBlock key={index} {...block} locale={locale} />
          case 'imageBlock':
            return <ImageBlock key={index} {...block} />
          case 'videoBlock':
            return <VideoBlock key={index} {...block} />
          case 'contactFormBlock':
            return <ContactFormBlock key={index} {...block} />
          case 'twoColumnLayoutBlock':
            return <TwoColumnLayoutBlock key={index} {...block} locale={locale} />
          default:
            return null
        }
      })}
    </div>
  )
}
