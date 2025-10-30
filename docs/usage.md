# Usage

## Collections

### Users Collection

- Authentication-enabled collection
- Access to admin panel
- Pre-configured for user management

### Media Collection

- Upload-enabled collection
- Pre-configured image sizes and focal point support
- Manual resizing capabilities

## API Access

- **REST API**: Available at `/api/[...slug]`
- **GraphQL API**: Available at `/api/graphql`
- **GraphQL Playground**: Available at `/api/graphql-playground` for testing queries

## Admin Panel

Access the Payload admin panel to manage content, users, and media. The admin interface includes:

- Import map support for custom components
- Type-safe operations
- Rich text editing with Lexical editor

## Frontend Integration

The frontend is built with Next.js and can consume Payload data via:

- Direct API calls
- GraphQL queries
- Payload's generated TypeScript types for type safety
