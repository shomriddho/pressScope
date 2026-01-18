import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/payload-generated-schema.ts*',

  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URI || '',
  },
})
