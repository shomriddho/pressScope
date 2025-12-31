import type { Article } from '@/payload-types'

type LikedArticle = Pick<
  Article,
  'id' | 'title' | 'slug' | 'thumbnail' | 'excerpt' | 'category' | 'fullUrl'
>

export default async function LikesPage({
  params,
}: {
  params: Promise<{ locale: string; user: string }>
}) {
  const { locale, user: userId } = await params

  let articles: LikedArticle[] = []

  try {
    // Fetch liked articles from API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user-likes/${userId}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return <p className="text-sm text-muted-foreground">Error loading liked articles.</p>
    }

    const data = await response.json()
    articles = data.articles
  } catch (error) {
    console.error('Error fetching liked articles:', error)
    return <p className="text-sm text-muted-foreground">Error loading liked articles.</p>
  }

  return (
    <>
      {articles.length > 0 ? (
        <div className="grid gap-4">
          {articles.map((article) => (
            <div key={article.id} className="flex items-center space-x-4 p-4 border rounded-lg">
              {(article.thumbnail as any)?.url && (
                <img
                  src={(article.thumbnail as any).url}
                  alt={article.title}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">
                  <a href={`/${locale}/${article.fullUrl}`} className="hover:underline">
                    {article.title}
                  </a>
                </h3>
                {article.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No liked articles yet.</p>
      )}
    </>
  )
}
