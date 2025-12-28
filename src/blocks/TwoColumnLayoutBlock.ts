import type { Block } from 'payload'
import { TextBlock } from './TextBlock'
import { ImageBlock } from './ImageBlock'
import { VideoBlock } from './VideoBlock'
import { ContactFormBlock } from './ContactFormBlock'

export const TwoColumnLayoutBlock: Block = {
  slug: 'twoColumnLayoutBlock',
  interfaceName: 'TwoColumnLayoutBlock',
  fields: [
    {
      name: 'leftColumn',
      type: 'blocks',
      label: 'Left Column',
      blocks: [TextBlock, ImageBlock, VideoBlock, ContactFormBlock],
      maxRows: 1,
    },
    {
      name: 'rightColumn',
      type: 'blocks',
      label: 'Right Column',
      blocks: [TextBlock, ImageBlock, VideoBlock, ContactFormBlock],
      maxRows: 1,
    },
  ],
}
