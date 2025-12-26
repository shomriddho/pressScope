// import React from 'react'
// import { getPayload } from 'payload'
// import config from '../../../payload.config'
// import type { Metadata } from 'next'

// interface HomePageProps {
//   params: Promise<{ locale: string }>
// }

// export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
//   const { locale } = await params

//   const payload = await getPayload({ config })
//   const seo = await payload.findGlobal({
//     slug: 'seo',
//     locale: locale as 'en' | 'bn',
//     depth: 1, // Populate relationships
//   })

//   // Extract image URL safely
//   const ogImageUrl =
//     seo.ogImage && typeof seo.ogImage === 'object' && 'url' in seo.ogImage && seo.ogImage.url
//       ? (seo.ogImage.url as string)
//       : undefined

//   return {
//     title: seo.title || 'PressScope',
//     description: seo.description || 'A modern content management system built with Payload CMS',
//     keywords: seo.keywords,
//     openGraph: {
//       title: seo.title || 'PressScope',
//       description: seo.description || 'A modern content management system built with Payload CMS',
//       images: ogImageUrl ? [{ url: ogImageUrl }] : [],
//       type: 'website',
//     },
//     twitter: {
//       card: seo.twitterCard || 'summary_large_image',
//       title: seo.title || 'PressScope',
//       description: seo.description || 'A modern content management system built with Payload CMS',
//       images: ogImageUrl ? [ogImageUrl] : [],
//     },
//   }
// }

// export default async function HomePage({ params }: HomePageProps) {
//   const { locale } = await params

//   return (
//     <div className="min-h-screen">
//       <div className="container mx-auto px-4 py-16">
//         <div className="text-center">
//           <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
//             {locale === 'bn' ? 'স্বাগতম PressScope-এ' : 'Welcome to PressScope'}
//           </h1>
//           <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
//             {locale === 'bn'
//               ? 'আধুনিক কনটেন্ট ম্যানেজমেন্ট সিস্টেম Payload CMS দিয়ে তৈরি'
//               : 'A modern content management system built with Payload CMS'}
//           </p>
//           <div className="prose lg:prose-xl mx-auto">
//             <p>
//               {locale === 'bn'
//                 ? 'এটি একটি উদাহরণ পৃষ্ঠা যা দেখায় কিভাবে Payload CMS এর সাথে আন্তর্জাতিকীকরণ কাজ করে।'
//                 : 'This is an example page that demonstrates how internationalization works with Payload CMS.'}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'bn' }]
}

export default function HomePage() {
  return <div>page</div>
}

export const revalidate = 60
