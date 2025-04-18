import { GraphQLClient, gql, ClientError } from 'graphql-request';
import Container from '@/components/Container';
// import HeroSection from '@/components/HeroSection'; // Needs props update
import HomepageClientContent from '@/components/HomepageClientContent';
import SearchSection from '@/components/SearchSection'; // Import SearchSection
import QuickLinks from '@/components/QuickLinks';     // Import QuickLinks

import { ArticleCardDataV5 } from '@/types/Article'
import { CategoryV5 } from '@/types/Category'

// --- Type Definitions (Adjusted for Strapi v5 Flattened Structure) ---

interface StrapiImageDataV5 {
  documentId: string; // Or potentially just id for media? Check playground/response
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
}

// Simplified Article type for homepage needs (v5)
export interface HomepageArticleV5 {
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string;
  publication_date: string;
  featured_image?: StrapiImageDataV5; // Media field accessed directly
  categories?: CategoryDataV5[]; // Relation accessed directly (array)
}

interface CategoryDataV5 {
   documentId: string;
   name: string;
   slug: string;
}

// Combined type for the data fetching function result
interface FetchedHomepageDataV5 {
    homepage?: { // Keep homepage for hero articles, SEO etc.
        hero_articles: ArticleCardDataV5[];
        // Remove featured_category_sections
    } | null;
    initialArticles?: ArticleCardDataV5[] | null; // Initial articles for "Home" tab
    allCategories?: CategoryV5[] | null; // All categories for tabs
}

const ARTICLE_CARD_FIELDS_FRAGMENT_V5 = gql`
  fragment ArticleCardFieldsV5 on Article {
    documentId
    title
    slug
    excerpt
    publication_date
  source {
    documentId
    name
    icon {
      documentId
      url
      alternativeText
    }
  }
    featured_image {
      documentId
      url
      alternativeText
      width
      height
    }
    is_advertisement
    external_url
  }
`;


const GET_INITIAL_HOMEPAGE_DATA_V5 = gql`
  ${ARTICLE_CARD_FIELDS_FRAGMENT_V5}

  query GetInitialHomepageDataV5(
      $heroLimit: Int = 5,
      $initialArticlesPageSize: Int = 16
  ) {
    homepage {
      hero_articles(pagination: { limit: $heroLimit }, sort: "publication_date:desc") {
        ...ArticleCardFieldsV5
      }
    }

    initialArticles: articles(
        sort: "publication_date:desc",
        pagination: { page: 1, pageSize: $initialArticlesPageSize }
    ) {
        ...ArticleCardFieldsV5
    }

    allCategories: categories(pagination: { limit: 50 }, sort: "name:asc") {
      documentId
      name
      slug
    }
  }
`;

// --- Data Fetching Function (Adjusted for v5) ---
async function getHomepageDataV5(): Promise<FetchedHomepageDataV5 | null> {
    const endpoint = process.env.NEXT_PUBLIC_STRAPI_API_URL ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/graphql` : null; // Use public base URL + /graphql
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN; // Use public token (as decided earlier)

    if (!endpoint || !token) {
        console.error("Error: Strapi public URL or Token env var not set for initial homepage fetch.");
        return null;
    }
    const client = new GraphQLClient(endpoint, { headers: { Authorization: `Bearer ${token}` } });

    try {
        // Fetch all initial data in one go
        const data = await client.request<FetchedHomepageDataV5>(
            GET_INITIAL_HOMEPAGE_DATA_V5,
            { initialArticlesPageSize: 16 } // Pass variables if needed
        );
        return data;
    } catch (error: unknown) {
        console.error("Failed to fetch initial homepage data:", error);
        if (error instanceof ClientError) {
            console.error("GraphQL Error Details:", JSON.stringify(error, undefined, 2));
        }
        return null; // Return null on error
    }
}

// --- HomePage Component (Adjusted for v5 Data Structure) ---
export default async function HomePage() {
    const initialData = await getHomepageDataV5();

    // Handle potential fetch errors gracefully for initial render
    // const heroArticles = initialData?.homepage?.hero_articles || [];
    const initialArticles = initialData?.initialArticles || [];
    const allCategories = initialData?.allCategories || [];

    return (
        <main className="pb-8">
            <SearchSection />
            <QuickLinks />
            <Container>
                {/* Optional: Render Hero Section server-side if desired */}

                {/* Render the Client Component responsible for dynamic content */}
                {/* Pass initial data needed for hydration */}
{/*heroArticles.length > 0 && <HeroSection articles={heroArticles} />*/}
                <HomepageClientContent
                    initialArticles={initialArticles}
                    allCategories={allCategories}
                 />

            </Container>
        </main>
    );
}
