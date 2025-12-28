'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useUser } from '@clerk/nextjs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/animate-ui/components/buttons/button'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(1, 'Message is required'),
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactFormBlockProps {
  title?: string
  description?: string
}

export default function ContactFormBlock({
  title = 'Contact Us',
  description,
}: ContactFormBlockProps) {
  const { user } = useUser()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: user?.firstName || '',
      email: user?.primaryEmailAddress?.emailAddress || '',
      message: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await fetch('/api/submit-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: user?.id,
        }),
      })
      if (!response.ok) throw new Error('Failed to submit')
      return response.json()
    },
    onSuccess: () => {
      reset()
      alert('Message sent successfully!')
    },
    onError: () => {
      alert('Failed to send message. Please try again.')
    },
  })

  const onSubmit = (data: ContactFormData) => {
    mutation.mutate(data)
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {description && <p className="mb-4 text-muted-foreground">{description}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input {...register('name')} placeholder="Your Name" disabled={mutation.isPending} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        <div>
          <Input
            {...register('email')}
            type="email"
            placeholder="Your Email"
            disabled={mutation.isPending}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <Textarea
            {...register('message')}
            placeholder="Your Message"
            rows={4}
            disabled={mutation.isPending}
          />
          {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
        </div>
        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  )
}
