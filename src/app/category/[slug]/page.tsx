'use client'; // <-- Make this a Client Component

import React, { useEffect, useState, use } from 'react'; // Import hooks
import { GraphQLClient, gql, ClientError } from 'graphql-request';
// import { useRouter } from 'next/navigation'; // Keep router for CategoryTabs potentially
// Cannot use notFound in client component
// import { notFound } from 'next/navigation';

import Container from '@/components/Container';
import SectionHeader from '@/components/SectionHeader';
import ArticleGrid from '@/components/ArticleGrid';
import PaginationControls from '@/components/PaginationControls';
import CategoryTabs from '@/components/CategoryTabs'; // Import CategoryTabs
import LoadingSpinner from '@/components/LoadingSpinner';

// Import central types
import { CategoryV5 } from '@/types/Category';
import { ArticleCardDataV5 } from '@/types/Article';

// Import Zustand store hook and actions
import { useCategoryStore } from '@/store/categoryStore';

// --- Type Definitions ---
// (Keep existing types: FetchedCategoryDetails, ArticlesAPIResponsePart, etc.)
type FetchedCategoryDetails = Pick<CategoryV5, 'documentId' | 'name' | 'slug' | 'description'>;
interface CategoryAPIResponsePart { categories: FetchedCategoryDetails[]; }
interface ArticlesAPIResponsePart { articles: ArticleCardDataV5[]; }
interface AllCategoriesResponsePart { allCategories?: CategoryV5[] | null; }
type CategoryPageGQLResponse = CategoryAPIResponsePart & ArticlesAPIResponsePart & AllCategoriesResponsePart;
interface FetchedCategoryData {
    category: FetchedCategoryDetails;
    articles: ArticleCardDataV5[];
    page: number;
    pageSize: number;
    hasNextPageGuess: boolean;
    allCategories: CategoryV5[];
}


// --- GraphQL Query (remains the same) ---
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
      # website # Optionally fetch website URL
    }
    featured_image {
      documentId
      url
      alternativeText
      width
      height
    }
  }
`;

const GET_CATEGORY_DATA_BY_SLUG_QUERY_V5 = gql`
  ${ARTICLE_CARD_FIELDS_FRAGMENT_V5}

  query GetCategoryDataAndAllCatsV5(
      $slug: String!,
      $page: Int = 1,
      $pageSize: Int = 12
  ) {
    # Fetch Category Details
    categories(filters: { slug: { eq: $slug } }) {
        documentId
        name
        slug
        description
    }

    # Fetch Paginated Articles
    articles(
      filters: { categories: { slug: { eq: $slug } } }
      sort: "publication_date:desc"
      pagination: {
          page: $page
          pageSize: $pageSize
      }
    ) {
      ...ArticleCardFieldsV5
    }

    # Fetch ALL Categories for Tabs (using an alias)
    allCategories: categories(pagination: { limit: 50 }, sort: "name:asc") {
      documentId
      name
      slug
    }

    # REMOVED the articles_connection part
  }
`;


// --- Data Fetching Function (remains the same) ---
const DEFAULT_PAGE_SIZE = 12;
async function getCategoryData(
    slug: string,
    page: number = 1,
    pageSize: number = DEFAULT_PAGE_SIZE
): Promise<FetchedCategoryData | null> {
    const endpoint = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/graphql`;
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

    if (!endpoint || !token) {
        console.error("Error: Strapi URL or Token environment variable not set for category fetching.");
        return null;
    }

    // Ensure page is at least 1
    const currentPage = Math.max(1, page);

    const client = new GraphQLClient(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
    });

    try {
        const data = await client.request<CategoryPageGQLResponse>(
            GET_CATEGORY_DATA_BY_SLUG_QUERY_V5,
            { slug, page: currentPage, pageSize }
        );

        const category = data?.categories?.[0];
        if (!category) {
            console.log(`Category with slug '${slug}' not found.`);
            return null; // Category not found
	}

        const articles = data?.articles || [];

        // Determine if there *might* be a next page
        const hasNextPageGuess = articles.length === pageSize;
	const allCategories = data?.allCategories || [];

        return {
            category,
            articles,
            page: currentPage,
            pageSize,
            hasNextPageGuess,
	    allCategories
        };

    } catch (error: unknown) {
        console.error(`Failed to fetch data for category slug '${slug}':`, error);
        if (error instanceof ClientError) {
            console.error("GraphQL Error Details:", JSON.stringify(error, undefined, 2));
        }
        return null; // Return null on any fetch error
    }
}

// --- CategoryPage Component ---
type CategoryPageProps = {
  params: Promise<{ slug: string }>; // Keep Promise type for receiving prop
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
    // --- Hooks ---
    const resolvedParams = use(params); // Use hook to resolve promise
    const possibleSearchParams  = use(searchParams ?? Promise.resolve({})); // Resolve searchParams
    const { slug } = resolvedParams;

    // Local state for data, loading, error
    const [pageData, setPageData] = useState<FetchedCategoryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get actions from Zustand store
    const setAllCategories = useCategoryStore((state) => state.setAllCategories);
    const setSelectedCategorySlug = useCategoryStore((state) => state.setSelectedCategorySlug);

    let pageQueryParam: string | undefined = undefined;
    // Check if it's an object and has the 'page' property, AND if that property is a string
    if (
        possibleSearchParams &&
        typeof possibleSearchParams === 'object' &&
        'page' in possibleSearchParams &&
        typeof possibleSearchParams.page === 'string' // <-- Add check for string type
        // Add check for string[] if you need to handle array case:
        // || Array.isArray(possibleSearchParams.page)
    ) {
         // Now TypeScript knows possibleSearchParams.page is definitely a string (or string[])
         pageQueryParam = possibleSearchParams.page as string; // We only handle the string case here
         // If handling arrays: pageQueryParam = typeof possibleSearchParams.page === 'string' ? possibleSearchParams.page : possibleSearchParams.page[0];
    }

    // Extract current page from resolved search params
    const page = typeof pageQueryParam === 'string' ? parseInt(pageQueryParam, 10) : 1;
    const currentPage = isNaN(page) || page < 1 ? 1 : page;

    // --- Data Fetching Effect ---
    useEffect(() => {
        // console.log(`CategoryPage Effect: Fetching for slug: ${slug}, page: ${currentPage}`);
        setIsLoading(true);
        setError(null);

        getCategoryData(slug, currentPage, DEFAULT_PAGE_SIZE)
            .then(data => {
                if (data) {
                    setPageData(data);
                    // --- UPDATE ZUSTAND STORE ---
                    setAllCategories(data.allCategories || []);
                    setSelectedCategorySlug(data.category.slug); // Set active slug in store
                    // -----------------------------
                } else {
                    setError(`Category "${slug}" not found.`); // Set specific error
                }
            })
            .catch(err => {
                console.error("Client-side category fetch error:", err);
                setError("Failed to load category data.");
            })
            .finally(() => {
                setIsLoading(false);
            });

     // Depend on slug and currentPage (and store actions)
    }, [slug, currentPage, setAllCategories, setSelectedCategorySlug]);


    // --- Render Logic ---
    if (isLoading) {
        return <main className="py-8 md:py-12"><Container><div className="flex justify-center pt-10"><LoadingSpinner /></div></Container></main>;
    }

    if (error || !pageData) {
         return <main className="py-8 md:py-12"><Container><p className="text-red-500 text-center">{error || "Category data could not be loaded."}</p></Container></main>;
    }

    // Extract data for rendering AFTER loading/error checks
    const { category, articles, hasNextPageGuess } = pageData;

    return (
        // No outer <main> here if RootLayout provides structure
        <>
             {/* Category Tabs Section - Renders based on store state */}
            <div className='bg-white pt-2 pb-1 shadow-sm border-b'>
                <Container>
                    {/* NO props passed, reads directly from store */}
                    <CategoryTabs />
                </Container>
            </div>

            {/* Main Content Section */}
            <main className="pt-6 pb-8 md:pt-8 md:pb-12">
                <Container>
                     {/* Wrapper for category content */}
                    <div className="bg-gray-100 rounded-lg p-4 md:p-6 shadow">
                         {/* Header & Articles */}
                         <div className="space-y-8">
                             <div>
                                <SectionHeader title={category.name} />
                                {category.description && (
                                    <p className="mt-2 text-gray-600">{category.description}</p>
                                )}
                            </div>

                            <ArticleGrid articles={articles} />

                            {/* Pagination Controls */}
                            {(currentPage > 1 || hasNextPageGuess) && (
                                <PaginationControls
                                    currentPage={currentPage}
                                    hasNextPage={hasNextPageGuess}
                                    basePath={`/category/${slug}`}
                                />
                            )}
                             {articles.length === 0 && currentPage === 1 && (
                                 <p className='text-center text-gray-500'>No articles found in this category yet.</p>
                             )}
                        </div>
                    </div>
                </Container>
            </main>
        </>
    );
}
