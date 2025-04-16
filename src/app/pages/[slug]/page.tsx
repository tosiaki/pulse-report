import React from 'react';
import { notFound } from 'next/navigation'; // Use notFound for server components
import { GraphQLClient, gql, ClientError } from 'graphql-request';
import ReactMarkdown from 'react-markdown'; // Import markdown renderer
import type { Metadata } from 'next';
import { StaticPageDataV5 } from '@/types/StaticPage';

// --- Type Definition for Slug Fetching ---
interface StaticPageSlug {
    slug: string;
}

interface AllStaticPageSlugsResponseV5 {
    staticPages: StaticPageSlug[]; // Expecting array of objects with slug
}

// --- GraphQL Query for Slugs ---
const GET_ALL_STATIC_PAGE_SLUGS_QUERY_V5 = gql`
  query GetAllStaticPageSlugsV5 {
    # Query the collection, set a reasonable limit
    staticPages(pagination: { limit: 100 }) {
       slug # Fetch only the slug
    }
  }
`;

// --- generateStaticParams Function ---
export async function generateStaticParams(): Promise<{ slug: string }[]> {
    console.log("Attempting to generate static params for static pages...");

    const endpoint = process.env.NEXT_PUBLIC_STRAPI_API_URL ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/graphql` : null;
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

    if (!endpoint || !token) {
        console.error("Error: Strapi URL/Token not set for static page generateStaticParams.");
        return [];
    }

    const client = new GraphQLClient(endpoint, { headers: { Authorization: `Bearer ${token}` } });

    try {
        const data = await client.request<AllStaticPageSlugsResponseV5>(
            GET_ALL_STATIC_PAGE_SLUGS_QUERY_V5
        );

        if (data?.staticPages) {
             console.log(`Found ${data.staticPages.length} static page slugs for pre-rendering.`);
             const params = data.staticPages
                .filter(page => page.slug) // Ensure slug exists
                .map((page) => ({
                    slug: page.slug,
                }));
             // console.log("Generated Static Page Params:", params);
             return params;
        } else {
             console.warn("No static page slugs found for pre-rendering.");
             return [];
        }

    } catch (error: unknown) {
        console.error("Failed to fetch static page slugs for generateStaticParams:", error);
         if (error instanceof ClientError) {
            console.error("GraphQL Error Details:", JSON.stringify(error, undefined, 2));
        }
        return [];
    }
}

import Container from '@/components/Container';
// import { Metadata, ResolvingMetadata } from 'next'; // Import Metadata types

interface StaticPageApiResponseV5 {
    staticPages: StaticPageDataV5[]; // Querying collection returns an array
}

// --- GraphQL Query ---
const GET_STATIC_PAGE_QUERY_V5 = gql`
  query GetStaticPageBySlugV5($slug: String!) {
    # Query the collection type, filter by slug
    staticPages(filters: { slug: { eq: $slug } }) {
        documentId
        title
        slug
        body
        seo_title
        seo_description
    }
  }
`;

// --- Data Fetching Function ---
async function getStaticPageData(slug: string): Promise<StaticPageDataV5 | null> {
    const endpoint = process.env.NEXT_PUBLIC_STRAPI_API_URL ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/graphql` : null;
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN; // Use public token for server components too

    if (!endpoint || !token) {
        console.error("Error: Strapi URL or Token not set for static page fetch.");
        return null;
    }
    const client = new GraphQLClient(endpoint, { headers: { Authorization: `Bearer ${token}` } });

    try {
        const data = await client.request<StaticPageApiResponseV5>(
            GET_STATIC_PAGE_QUERY_V5,
            { slug }
        );
        // Return the first match from the array, or null if not found
        return data?.staticPages?.[0] || null;
    } catch (error: unknown) {
        console.error(`Failed to fetch static page with slug '${slug}':`, error);
        // Handle specific errors if needed
        if (error instanceof ClientError) { /* ... */ }
        return null;
    }
}

// --- Props Type (Params only for Server Component) ---
type StaticPageProps = {
  params: Promise<{ slug: string }>;
  // No promise needed for params in Server Components if not using generateStaticParams' result directly
  // searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

// --- generateMetadata Function ---
type Props = {
  params: Promise<{ slug: string }>;
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>; // Not needed here currently
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  // No need to await params here - Next.js resolves it before passing
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Fetch page data specifically for metadata
  // Note: Next.js automatically deduplicates fetch requests if using native fetch
  // If getStaticPageData uses a different client (like graphql-request),
  // it might fetch twice. Consider caching or passing data if performance is critical.
  const pageData = await getStaticPageData(slug);

  // Handle case where page is not found
  if (!pageData) {
    // Return default metadata or metadata indicating not found
    return {
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist.',
    };
  }

  // Optionally merge with parent metadata
  // const previousImages = (await parent).openGraph?.images || []; // Example

  // Construct metadata object
  const pageTitle = pageData.seo_title || pageData.title; // Use SEO title or fallback to main title
  const pageDescription = pageData.seo_description || `Read more about ${pageData.title} on Pulse Report.`; // Use SEO description or generate default

  return {
    title: `${pageTitle} | Pulse Report`, // Add site name to title
    description: pageDescription,
    // --- Open Graph Meta Tags (for social sharing) ---
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `/pages/${pageData.slug}`, // Canonical URL for this page
      siteName: 'Pulse Report', // Your site name
      // images: [ // Optional: Add a default image for static pages
      //   {
      //     url: '/images/default-og-image.jpg', // URL needs to be absolute or Next.js handles relative paths
      //     width: 1200,
      //     height: 630,
      //     alt: 'Pulse Report Logo',
      //   },
      // ],
      locale: 'en_US', // Set appropriate locale
      type: 'website', // Type of content
    },
    // --- Twitter Card Meta Tags ---
    twitter: {
        card: 'summary_large_image', // Or 'summary'
        title: pageTitle,
        description: pageDescription,
        // images: ['/images/default-twitter-image.jpg'], // Optional: Specific Twitter image
        // site: '@YourTwitterHandle', // Optional: Your site's Twitter handle
        // creator: '@CreatorTwitterHandle', // Optional: Content creator's handle
    },
    // --- Other Meta Tags ---
     alternates: { // Add canonical URL
         canonical: `/pages/${pageData.slug}`,
     },
    // robots: { // Optional: Control indexing
    //   index: true,
    //   follow: true,
    //   googleBot: { index: true, follow: true },
    // },
  };
}

// --- StaticPage Component (Server Component) ---
// Make component async to fetch data
export default async function StaticPage({ params }: StaticPageProps) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const pageData = await getStaticPageData(slug);

    // If page data not found, trigger 404
    if (!pageData) {
        notFound();
    }

    return (
        <main className="py-8 md:py-12">
            <Container>
                 <div className="bg-white rounded-lg p-6 md:p-8 shadow">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                       {pageData.title} {/* Use fetched title */}
                    </h1>
                    {/* Render fetched Markdown content */}
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                       <ReactMarkdown>{pageData.body}</ReactMarkdown>
                    </div>
                 </div>
            </Container>
        </main>
    );
}
