'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { Button } from '@/components/animate-ui/components/buttons/button'
import { ThumbsUp } from '@/components/animate-ui/icons/thumbs-up'
import { ThumbsDown } from '@/components/animate-ui/icons/thumbs-down'
import { AnimateIcon } from '@/components/animate-ui/icons/icon'
import { voteArticle } from '@/actions/vote'

type ArticleVoteButtonsProps = {
  articleId: string
}

export function ArticleVoteButtons({ articleId }: ArticleVoteButtonsProps) {
  const queryClient = useQueryClient()

  const { data: voteData, isLoading: voteLoading } = useQuery({
    queryKey: ['article-vote-data', articleId],
    queryFn: async () => {
      const res = await fetch(`/api/article-vote-data/${articleId}`)
      if (!res.ok) throw new Error('Failed to fetch vote data')
      return res.json()
    },
  })

  const likesCount = voteData?.likesCount ?? 0
  const dislikesCount = voteData?.dislikesCount ?? 0
  const userVote = voteData?.userVoteType ?? null

  const mutation = useMutation({
    mutationFn: ({ action }: { action: 'like' | 'dislike' | 'remove' }) =>
      voteArticle(Number(articleId), action),
    onSuccess: (data: { likesCount: number; dislikesCount: number }, variables) => {
      // Update cache with server response
      const newUserVoteType = variables.action === 'remove' ? null : variables.action
      queryClient.setQueryData(['article-vote-data', articleId], {
        likesCount: data.likesCount,
        dislikesCount: data.dislikesCount,
        userVoteType: newUserVoteType,
      })
    },
  })

  const handleVote = (type: 'like' | 'dislike') => {
    if (mutation.isPending || voteLoading) return

    let action: 'like' | 'dislike' | 'remove'
    if (type === 'like') {
      action = userVote === 'like' ? 'remove' : 'like'
    } else {
      action = userVote === 'dislike' ? 'remove' : 'dislike'
    }

    // Track vote actions with PostHog
    if (action === 'like') {
      posthog.capture('article_liked', {
        article_id: articleId,
        previous_vote: userVote,
      })
    } else if (action === 'dislike') {
      posthog.capture('article_disliked', {
        article_id: articleId,
        previous_vote: userVote,
      })
    } else if (action === 'remove') {
      posthog.capture('article_vote_removed', {
        article_id: articleId,
        removed_vote_type: userVote,
      })
    }

    mutation.mutate({ action })
  }

  if (voteLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userVote === 'like' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote('like')}
        disabled={mutation.isPending}
      >
        <AnimateIcon animateOnHover="default" animateOnTap="default">
          <ThumbsUp size={16} />
        </AnimateIcon>
        {likesCount}
      </Button>
      <Button
        variant={userVote === 'dislike' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote('dislike')}
        disabled={mutation.isPending}
      >
        <AnimateIcon animateOnHover="default" animateOnTap="default">
          <ThumbsDown size={16} />
        </AnimateIcon>
        {dislikesCount}
      </Button>
    </div>
  )
}
