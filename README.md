# Pulse Report - Frontend (Next.js)

This project is a news website frontend built with Next.js, Tailwind CSS, and TypeScript, designed to replicate the functionality and layout of sites like OneNews/Microsoft Start. It fetches content from a Strapi CMS backend.

## Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn
*   A running instance of the corresponding [Pulse Report Strapi CMS](link-to-your-strapi-repo-if-public) (local or deployed).

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <your-frontend-repo-url>
    cd pulse-report
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the project root directory by copying `.env.example` (if you create one) or manually adding the required variables:
    ```dotenv
    # .env.local

    # URL for the Strapi GraphQL endpoint (ensure it's accessible from your machine)
    # Use NEXT_PUBLIC_ for variables needed by the client-side store/components
    NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
    # Read-only API Token generated in Strapi (Settings -> API Tokens)
    # Use NEXT_PUBLIC_ if the token is needed client-side (e.g., by Zustand store fetch)
    NEXT_PUBLIC_STRAPI_API_TOKEN=YOUR_STRAPI_READ_ONLY_API_TOKEN

    # Base URL of this frontend deployment (used for canonical URLs, sitemap)
    # For local dev, localhost:3000 is fine
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```
    *   Replace `YOUR_STRAPI_READ_ONLY_API_TOKEN` with the actual token from your Strapi admin panel.
    *   Ensure the `NEXT_PUBLIC_STRAPI_API_URL` points to your running Strapi instance (local or deployed).

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

1.  **Ensure environment variables are set correctly for production.**
2.  **Run the build command:**
    ```bash
    npm run build
    ```
3.  **Start the production server:**
    ```bash
    npm start
    ```

## Deployment

This project is configured for deployment on platforms like Vercel or Netlify.

1.  Connect your Git repository to the hosting provider.
2.  Configure the following environment variables in the hosting provider's settings:
    *   `NEXT_PUBLIC_STRAPI_API_URL` (pointing to your *deployed* Strapi backend URL)
    *   `NEXT_PUBLIC_STRAPI_API_TOKEN`
    *   `NEXT_PUBLIC_SITE_URL` (the final deployment URL)
3.  The build command is typically `npm run build` or automatically detected.

## Tech Stack

*   Framework: Next.js (App Router)
*   Styling: Tailwind CSS (v4+)
*   CMS Integration: Strapi (v5+) via GraphQL
*   State Management: Zustand (for client-side category filtering)
*   Libraries: `graphql-request`, `react-share`, `date-fns`, `@headlessui/react`, `@heroicons/react`, `react-markdown`, `swiper`, `tailwind-scrollbar`

## Project Structure

*   `src/app/`: Main application routes (App Router)
*   `src/components/`: Reusable React components
*   `src/hooks/`: Custom React hooks (e.g., `useMediaQuery`)
*   `src/store/`: Zustand state management stores
*   `src/types/`: TypeScript type definitions
*   `public/`: Static assets
