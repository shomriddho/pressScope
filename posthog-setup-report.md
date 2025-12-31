# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into your Next.js 15.5.9 project. The integration includes:

- **Client-side initialization** via `instrumentation-client.ts` (Next.js 15.3+ recommended approach)
- **Server-side PostHog client** for backend event tracking
- **Automatic user identification** when users sign in via Clerk
- **Error tracking** with `posthog.captureException()` for failed operations
- **12 custom events** tracking key user interactions across the application

## Files Created

| File | Purpose |
|------|---------|
| `instrumentation-client.ts` | Client-side PostHog initialization |
| `src/lib/posthog-server.ts` | Server-side PostHog client |
| `src/components/PostHogIdentifier.tsx` | Automatic user identification with Clerk |

## Files Modified

| File | Changes |
|------|---------|
| `.env` | Added `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` |
| `src/components/blocks/ContactFormBlock.tsx` | Added `contact_form_submitted` and `contact_form_error` events |
| `src/components/ArticleVoteButtons.tsx` | Added `article_liked`, `article_disliked`, and `article_vote_removed` events |
| `src/app/(frontend)/[locale]/profile/[user]/GeneralTabClient.tsx` | Added `profile_updated` and `profile_update_error` events |
| `src/components/LanguageSwitcher.tsx` | Added `language_switched` event |
| `src/components/ThemeToggleClient.tsx` | Added `theme_toggled` event |
| `src/components/AuthWrapper.tsx` | Added `sign_in_clicked` event and PostHogIdentifier component |
| `src/components/CustomUserButton.tsx` | Added `sign_out_clicked` and `profile_link_clicked` events |

## Events Implemented

| Event Name | Description | File |
|------------|-------------|------|
| `contact_form_submitted` | User submits a contact form message - key conversion event for lead generation | `src/components/blocks/ContactFormBlock.tsx` |
| `contact_form_error` | Contact form submission failed - error tracking for conversion issues | `src/components/blocks/ContactFormBlock.tsx` |
| `article_liked` | User likes an article - indicates content engagement and satisfaction | `src/components/ArticleVoteButtons.tsx` |
| `article_disliked` | User dislikes an article - indicates content quality issues (potential churn signal) | `src/components/ArticleVoteButtons.tsx` |
| `article_vote_removed` | User removes their vote from an article - engagement change signal | `src/components/ArticleVoteButtons.tsx` |
| `profile_updated` | User updates their profile information - shows user investment in the platform | `src/app/(frontend)/[locale]/profile/[user]/GeneralTabClient.tsx` |
| `profile_update_error` | Profile update failed - error tracking for user experience issues | `src/app/(frontend)/[locale]/profile/[user]/GeneralTabClient.tsx` |
| `language_switched` | User switches language - important for internationalization analytics | `src/components/LanguageSwitcher.tsx` |
| `theme_toggled` | User toggles theme (dark/light mode) - user preference tracking | `src/components/ThemeToggleClient.tsx` |
| `sign_in_clicked` | User clicks sign in button - top of authentication funnel | `src/components/AuthWrapper.tsx` |
| `sign_out_clicked` | User clicks sign out - potential churn indicator | `src/components/CustomUserButton.tsx` |
| `profile_link_clicked` | User navigates to their profile page - engagement signal | `src/components/CustomUserButton.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://us.posthog.com/project/275481/dashboard/960029) - Core analytics dashboard with all key metrics

### Insights
- [Contact Form Submissions](https://us.posthog.com/project/275481/insights/OefvpofR) - Tracks successful contact form submissions (conversion metric)
- [Article Engagement (Likes vs Dislikes)](https://us.posthog.com/project/275481/insights/bj5bgx5P) - Compares article likes and dislikes for content quality measurement
- [User Authentication Funnel](https://us.posthog.com/project/275481/insights/3FdyFQvJ) - Tracks sign-in clicks to successful logins
- [User Retention Signals](https://us.posthog.com/project/275481/insights/baEjGryT) - Monitors sign-out events as potential churn indicators
- [User Preferences & Settings](https://us.posthog.com/project/275481/insights/SRGhq0e3) - Tracks language switches, theme toggles, and profile updates

## Additional Features Enabled

- **Automatic pageview tracking** - PostHog will automatically capture page views
- **Session replay** - User sessions are recorded for debugging and UX analysis
- **Error tracking** - Unhandled exceptions are automatically captured
- **User identification** - Users are automatically identified when they sign in via Clerk
