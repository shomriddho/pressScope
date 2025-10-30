# Setup

## Prerequisites

- Node.js version ^18.20.2 or >=20.9.0
- pnpm package manager (^9 or ^10)
- PostgreSQL database (or MongoDB for local development)

## Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd pressScope
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Environment setup**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - `DATABASE_URI`: Your PostgreSQL connection string (or MongoDB for local dev)
   - `PAYLOAD_SECRET`: A secure random string for Payload encryption

4. **Start development server**:

   ```bash
   pnpm dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Admin panel: Follow on-screen instructions to create your first admin user

## Docker Setup (Optional)

For local development with Docker:

1. Modify `DATABASE_URI` in `.env` to: `mongodb://127.0.0.1/<dbname>`
2. Update `docker-compose.yml` to match the database name
3. Run: `docker-compose up` (add `-d` for background execution)

## Development Commands

- `pnpm dev` - Start development server
- `pnpm devsafe` - Clean start (removes .next cache)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm generate:types` - Generate Payload TypeScript types
- `pnpm generate:importmap` - Generate admin import map
- `pnpm test` - Run all tests
- `pnpm test:int` - Run integration tests
- `pnpm test:e2e` - Run end-to-end tests

## Deployment

### Payload Cloud

This template is optimized for deployment to Payload Cloud, which provides:

- Automatic MongoDB setup
- Cloud S3 storage for media
- Scalable hosting

### Other Platforms

The project can be deployed to any platform supporting Node.js applications. Ensure environment variables are properly configured for production.

## Notable Configurations

- **Webpack Extensions**: Custom module resolution
- **Sharp Integration**: For image processing
- **Environment-based Setup**: Flexible configuration via .env files
- **Type Safety**: Auto-generated Payload types
- **Docker Support**: Standardized development environment
