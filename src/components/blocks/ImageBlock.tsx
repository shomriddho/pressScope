import Image from 'next/image'

interface ImageBlockProps {
  image: {
    url: string
    alt?: string
    width?: number
    height?: number
  }
  caption?: string
  alt: string
  size: 'small' | 'medium' | 'large' | 'full'
  alignment: 'left' | 'center' | 'right'
}

export default function ImageBlock({ image, caption, alt, size, alignment }: ImageBlockProps) {
  if (!image?.url) return null

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
    full: 'w-full',
  }

  const alignmentClasses = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
  }

  return (
    <div className={`mb-8 ${alignmentClasses[alignment]}`}>
      <div className={`${sizeClasses[size]} overflow-hidden rounded-lg`}>
        <Image
          src={image.url}
          alt={alt || image.alt || ''}
          width={image.width || 800}
          height={image.height || 600}
          className="w-full h-auto object-cover"
        />
      </div>
      {caption && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center italic">
          {caption}
        </p>
      )}
    </div>
  )
}
