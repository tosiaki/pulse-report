import { type MetadataRoute } from 'next';
import { GraphQLClient, gql } from 'graphql-request';
// ... other necessary imports and types ...

// Define types for fetched slugs
interface SlugData { slug: string; updatedAt?: string; } // Add updatedAt if available for lastmod
interface AllSlugsResponse {
    articles?: SlugData[];
    categories?: SlugData[];
    staticPages?: SlugData[];
}

// Consolidated GraphQL Query for all slugs needed
const GET_ALL_SLUGS_FOR_SITEMAP = gql`
    query GetAllSlugsForSitemap {
        articles(pagination: { limit: 5000 }) { # Fetch many articles
            slug
            # updatedAt # Fetch Strapi's updatedAt for lastmod if desired
        }
        categories(pagination: { limit: 200 }) {
            slug
            # updatedAt
        }
        staticPages(pagination: { limit: 100 }) {
            slug
            # updatedAt
        }
    }
`;

// Helper function to fetch slugs (similar to generateStaticParams logic)
async function getAllSlugs(): Promise<AllSlugsResponse | null> {
    const endpoint = process.env.NEXT_PUBLIC_STRAPI_API_URL ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/graphql` : null;
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    if (!endpoint || !token) {
        console.error("Sitemap: Strapi Env Vars not set.");
        return null;
    }
    const client = new GraphQLClient(endpoint, { headers: { Authorization: `Bearer ${token}` } });
    try {
        const data = await client.request<AllSlugsResponse>(GET_ALL_SLUGS_FOR_SITEMAP);
        return data;
    } catch (error) {
        console.error("Sitemap: Failed to fetch slugs:", error);
        return null;
    }
}

// Use default export and correct return type
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;

    console.log("Generating sitemap object...");
    const slugsData = await getAllSlugs();

    const articleUrls = slugsData?.articles?.map((item) => ({
        url: `${baseUrl}/article/${item.slug}`, // Use slug directly
        lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    })) || [];

    const categoryUrls = slugsData?.categories?.map((item) => ({
        url: `${baseUrl}/category/${item.slug}`,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    })) || [];

    const staticPageUrls = slugsData?.staticPages?.map((item) => ({
        url: `${baseUrl}/pages/${item.slug}`,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
    })) || [];

    console.log(`Sitemap: Found ${articleUrls.length} articles, ${categoryUrls.length} categories, ${staticPageUrls.length} static pages.`);

    // Return the array of sitemap entries directly
    return [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0, },
        ...staticPageUrls,
        ...categoryUrls,
        ...articleUrls,
    ];
    // REMOVE the manual XML string building and 'new Response(...)'
}
