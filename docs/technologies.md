# Technologies

## Core Technologies

- **Framework**: Next.js 15.4.4 with React 19.1.0
- **CMS**: Payload CMS 3.61.1
  - PostgreSQL adapter (@payloadcms/db-postgres)
  - Lexical rich text editor (@payloadcms/richtext-lexical)
  - Payload Cloud plugin (@payloadcms/payload-cloud)
- **Styling**: Tailwind CSS 4.1.16 with PostCSS
- **Language**: TypeScript 5.7.3
- **Database**: PostgreSQL (via @payloadcms/db-postgres)
- **Image Processing**: Sharp 0.34.2

## Testing Frameworks

- **Integration Tests**: Vitest 3.2.3 (configured for `tests/int/` directory)
- **End-to-End Tests**: Playwright 1.54.1 (configured for `tests/e2e/` directory)

## Additional Dependencies

- GraphQL support
- Lucide React for icons
- Class Variance Authority and clsx for styling utilities
- Tailwind Merge for class merging
- Cross-env for environment variable handling
