import type { Block } from 'payload'

export const ContactFormBlock: Block = {
  slug: 'contactFormBlock',
  interfaceName: 'ContactFormBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Form Title',
      defaultValue: 'Contact Us',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Form Description',
    },
  ],
}
