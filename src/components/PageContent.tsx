import TextBlock from './blocks/TextBlock'
import ImageBlock from './blocks/ImageBlock'
import VideoBlock from './blocks/VideoBlock'

interface PageContentProps {
  content: any[] // Array of blocks
}

export default function PageContent({ content }: PageContentProps) {
  if (!content || !Array.isArray(content)) return null

  return (
    <div className="space-y-8">
      {content.map((block, index) => {
        switch (block.blockType) {
          case 'textBlock':
            return <TextBlock key={index} {...block} />
          case 'imageBlock':
            return <ImageBlock key={index} {...block} />
          case 'videoBlock':
            return <VideoBlock key={index} {...block} />
          default:
            return null
        }
      })}
    </div>
  )
}
