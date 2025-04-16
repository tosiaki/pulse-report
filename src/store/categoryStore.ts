import { create } from 'zustand';
import { GraphQLClient, gql, ClientError } from 'graphql-request';
import { ArticleCardDataV5 } from '@/types/Article'; // Import your central types
import { CategoryV5 } from '@/types/Category'; // Import your central types

// --- GraphQL Query (Specific for fetching articles by slug) ---
const ARTICLE_CARD_FIELDS_FRAGMENT_V5 = gql`
  fragment ArticleCardFieldsV5 on Article {
    documentId
    title
    slug
    excerpt
    publication_date
    featured_image {
      documentId
      url
      alternativeText
      width
      height
    }
    author { name }
  }
`;

// Query to fetch articles for a specific category slug (or all for home)
const GET_ARTICLES_BY_CATEGORY_SLUG_QUERY = gql`
  ${ARTICLE_CARD_FIELDS_FRAGMENT_V5}
  query GetArticlesByCategorySlug(
      $slug: String, # Slug is optional for "Home"
      $pageSize: Int = 12 # Adjust page size as needed
      # Add page variable if implementing client-side pagination later
  ) {
    articles(
      # Filter if slug is provided, otherwise fetch latest (for "Home")
      filters: { categories: { slug: { eq: $slug } } }
      sort: "publication_date:desc"
      pagination: { page: 1, pageSize: $pageSize } # Start with page 1
    ) {
      ...ArticleCardFieldsV5
    }
    # We don't need category details or count here
  }
`;

// Query to fetch the latest articles (for the "Home" tab)
const GET_LATEST_ARTICLES_QUERY = gql`
 ${ARTICLE_CARD_FIELDS_FRAGMENT_V5}
 query GetLatestArticles(
     $pageSize: Int = 12
 ) {
   articles(
     sort: "publication_date:desc"
     pagination: { page: 1, pageSize: $pageSize }
   ) {
     ...ArticleCardFieldsV5
   }
 }
`;


// --- Store State Interface ---
interface CategoryState {
    selectedCategorySlug: string | null;
    articles: ArticleCardDataV5[];
    isLoading: boolean;
    error: string | null;
    allCategories: CategoryV5[];
    hasFetchedInitially: boolean; // <-- ADD Flag

    // Actions
    setSelectedCategorySlug: (slug: string | null) => void;
    fetchArticlesForCategory: (slug: string | null) => Promise<void>;
    setAllCategories: (categories: CategoryV5[]) => void;
    setInitialArticles: (articles: ArticleCardDataV5[]) => void; // <-- ADD Action for hydration
}

// --- Store Implementation ---
export const useCategoryStore = create<CategoryState>((set, get) => ({
    // Initial State
    selectedCategorySlug: null,
    articles: [],
    isLoading: false,
    error: null,
    allCategories: [],
    hasFetchedInitially: false, // <-- Initialize flag

    // Action to set all categories
    setAllCategories: (categories) => {
	    console.log("setting all categories");
	    set({ allCategories: categories });
    },

    // Action to hydrate initial articles (called from client component)
    setInitialArticles: (articles) => {
        // Only set if articles are currently empty and initial fetch hasn't happened
        if (get().articles.length === 0 && !get().hasFetchedInitially) {
		console.log("setting initial articles");
             set({ articles: articles, hasFetchedInitially: true, isLoading: false, error: null });
        }
     },

    // Action to change the selected category
    setSelectedCategorySlug: (slug) => {
        const currentSlug = get().selectedCategorySlug;
        if (slug !== currentSlug) {
		console.log("setting selected category");
            set({ selectedCategorySlug: slug, hasFetchedInitially: false }); // Reset flag on selection change
            get().fetchArticlesForCategory(slug);
        }
    },

    // Action to fetch articles
    fetchArticlesForCategory: async (slug) => {
        // Prevent fetching if already loading
        if (get().isLoading) return;

	console.log("setting after fetch article");
        set({ isLoading: true, error: null, hasFetchedInitially: false });

    // Construct endpoint from base URL
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
    const endpoint = baseUrl ? `${baseUrl}/graphql` : null; // Build full URL
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN; // Use the public token

     if (!endpoint || !token) {
        const errorMessage = "Error: Strapi public URL or Token client-side environment variable not set.";
        console.error(errorMessage);
        set({ isLoading: false, error: errorMessage, articles: [] });
        return;
    }

    const client = new GraphQLClient(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
    });

    try {
        let query;
        const variables: { slug?: string | null, pageSize: number } = { pageSize: 16 }; // Example page size

        if (slug) {
            // Fetching for a specific category
            query = GET_ARTICLES_BY_CATEGORY_SLUG_QUERY;
            variables.slug = slug;
        } else {
            // Fetching for "Home" - use the latest articles query
            query = GET_LATEST_ARTICLES_QUERY;
        }

        const data = await client.request<{ articles: ArticleCardDataV5[] }>(query, variables);
	console.log("setting after getting data");
        set({
            articles: data?.articles || [],
            isLoading: false,
            error: null,
	    hasFetchedInitially: true,
        });

    } catch (error: unknown) {
        console.error(`Failed to fetch articles for slug '${slug}':`, error);
        let errorMessage = "Failed to load articles.";
        if (error instanceof ClientError) {
            // Try to get a more specific message
             errorMessage = error.response?.errors?.[0]?.message || errorMessage;
        } else if (error instanceof Error) {
             errorMessage = error.message;
        }
	console.log("setting after error");
	set({ isLoading: false, error: errorMessage, articles: [], hasFetchedInitially: true });
    }
  },
}));
