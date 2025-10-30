# Components and Project Structure

## Project Structure

```
pressScope/
├── src/
│   ├── app/
│   │   ├── (frontend)/          # Next.js frontend pages and components
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── styles.css
│   │   └── (payload)/           # Payload CMS routes
│   │       ├── admin/           # Admin panel
│   │       │   ├── [[...segments]]/
│   │       │   │   ├── not-found.tsx
│   │       │   │   └── page.tsx
│   │       │   ├── importMap.js
│   │       │   └── layout.tsx
│   │       ├── api/             # API routes
│   │       │   ├── [...slug]/route.ts
│   │       │   ├── graphql/route.ts
│   │       │   └── graphql-playground/route.ts
│   │       ├── custom.scss
│   │       └── layout.tsx
│   ├── collections/             # Payload collections
│   │   ├── Media.ts
│   │   └── Users.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── payload-types.ts         # Auto-generated TypeScript types
│   └── payload.config.ts        # Payload configuration
├── tests/
│   ├── e2e/                     # End-to-end tests
│   │   └── frontend.e2e.spec.ts
│   └── int/                     # Integration tests
│       └── api.int.spec.ts
├── .env.example                 # Environment variables template
├── docker-compose.yml           # Docker configuration
├── package.json                 # Project dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Original setup instructions
```

## Key Directories and Files

- **Frontend**: `src/app/(frontend)/` - Contains Next.js pages and components for the public-facing website
- **CMS Admin**: `src/app/(payload)/admin/` - Payload admin interface with import map support
- **API Routes**: `src/app/(payload)/api/` - REST and GraphQL endpoints
- **Collections**: `src/collections/` - Users (auth-enabled) and Media (upload-enabled) collections
- **Configuration**: `src/payload.config.ts` - Main Payload setup with database and plugins
