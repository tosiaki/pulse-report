'use client';

import { GraphQLClient, gql, ClientError } from 'graphql-request';
import Image from 'next/image';
import Container from '@/components/Container';
import ArticleMeta from '@/components/ArticleMeta';
import ArticleBody from '@/components/ArticleBody';
import CategoryTabs from '@/components/CategoryTabs'; // Import CategoryTabs
import LoadingSpinner from '@/components/LoadingSpinner'; // Import CategoryTabs
import { ArticleV5, ArticleCardDataV5 } from '@/types/Article';
import { CategoryV5 } from '@/types/Category'; // Import types
import { useCategoryStore } from '@/store/categoryStore'; // Import store hook
import React, { useEffect, useState, use } from 'react'; // Import React/useEffect
import SocialShareButtons from '@/components/SocialShareButtons';
import RelatedArticles from '@/components/RelatedArticles';

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

// Updated query to fetch related articles based on primary category
const GET_ARTICLE_DATA_WITH_RELATED_V5 = gql`
  ${ARTICLE_CARD_FIELDS_FRAGMENT_V5}

  query GetArticleDataWithRelatedV5(
      $slug: String!,
      $primaryCategorySlug: String!,
      $relatedLimit: Int = 4
      ) {
    articles(filters: { slug: { eq: $slug } }, pagination: { limit: 1 }) {
      documentId
      title slug publication_date body seo_title seo_description
      featured_image { documentId url alternativeText width height }
      source { documentId name icon { documentId url alternativeText } website }
      categories(pagination: { limit: 10 }) { documentId name slug }
    }

    allCategories: categories(pagination: { limit: 50 }, sort: "name:asc") {
      documentId name slug
    }

    relatedArticles: articles(
      filters: {
        and: [
          { categories: { slug: { eq: $primaryCategorySlug } } }, 
          { slug: { ne: $slug } }
        ]
      },
      sort: "publication_date:desc",
      pagination: { limit: $relatedLimit }
    ) {
      ...ArticleCardFieldsV5
    }
  }
`;

/*
// --- generateStaticParams Function ---
export async function generateStaticParams(): Promise<{ slug: string }[]> {
    console.log("Attempting to generate static params for articles...");

    const endpoint = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/graphql`;
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

    if (!endpoint || !token) {
        console.error("Error: Strapi URL or Token environment variable not set for generateStaticParams.");
        // Return empty array to prevent build failure, but pages won't be pre-rendered
        return [];
    }

    const client = new GraphQLClient(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
    });

    try {
        const data = await client.request<AllArticleSlugsResponseV5>(
            GET_ALL_ARTICLE_SLUGS_QUERY_V5
        );

        // --- Data Structure Check ---
        // console.log("Fetched Slugs Raw:", JSON.stringify(data, null, 2));

        if (data && data.articles) {
             console.log(`Found ${data.articles.length} article slugs for pre-rendering.`);
             // Map the results to the required format: [{ slug: '...' }, ...]
             const params = data.articles.map((article) => ({
                slug: article.slug,
             }));
             // console.log("Generated Params:", params);
             return params;
        } else {
             console.warn("No article slugs found for pre-rendering.");
             return [];
        }

    } catch (error: unknown) {
        console.error("Failed to fetch article slugs for generateStaticParams:", JSON.stringify(error, undefined, 2));

        // Check if it's a ClientError from graphql-request
        if (error instanceof ClientError) {
            console.error("GraphQL Request/Response Error Details:", JSON.stringify(error, undefined, 2));
            // ClientError often has response.errors for GraphQL errors
            if (error.response && error.response.errors) {
                console.error("Detailed GraphQL Errors:", JSON.stringify(error.response.errors, undefined, 2));
            }
        } else if (error instanceof Error) {
            // Handle generic JavaScript errors
            console.error("Generic Error:", error.message);
        } else {
            // Handle other types of throwables if necessary
            console.error("Caught non-Error throwable:", error);
        }

        // Return empty array on error to allow the build to potentially continue
        // but indicates an issue with pre-rendering paths.
        return [];
    }
}
*/

// --- Type Definitions (Adjusted for Strapi v5 Article Query) ---

interface StrapiImageDataV5 {
  documentId: string;
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
}

interface AuthorDataV5 {
    documentId: string;
    name: string;
    picture?: StrapiImageDataV5; // Author picture is optional
}

interface CategoryDataV5 {
   documentId: string;
   name: string;
   slug: string;
}

// Type for the actual Article object returned
export interface FullArticleV5 {
  documentId: string;
  title: string;
  slug: string;
  publication_date: string;
  featured_image?: StrapiImageDataV5; // Image is optional
  body: string; // Markdown content
  author?: AuthorDataV5; // Author is optional
  categories?: CategoryDataV5[]; // Categories might be empty
  // Add SEO fields if needed
  // seo_title?: string;
  // seo_description?: string;
}

interface FetchedArticleData {
    article: ArticleV5;
    allCategories: CategoryV5[];
    relatedArticles: ArticleCardDataV5[];
}

async function getArticleData(slug: string): Promise<FetchedArticleData | null> {
    const endpoint = process.env.NEXT_PUBLIC_STRAPI_API_URL ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/graphql` : null;
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    if (!endpoint || !token) return null;
    const client = new GraphQLClient(endpoint, { headers: { Authorization: `Bearer ${token}` } });

    try {
        // Initial fetch just to get the primary category slug
        // Note: This adds an extra request. Alternative is one complex query if possible,
        // but this is often clearer.
        const initialQuery = gql` query GetPrimaryCat($slug: String!) { articles(filters:{slug:{eq:$slug}}, pagination:{limit:1}){ categories(pagination:{limit:1}){ slug } } } `;
        const initialData = await client.request<{ articles: { categories: { slug: string }[] }[] }>(initialQuery, { slug });
        const primaryCategorySlug = initialData?.articles?.[0]?.categories?.[0]?.slug;

        // If no primary category found, we can't fetch related easily
        if (!primaryCategorySlug) {
             console.warn(`No primary category found for article ${slug} to fetch related articles.`);
             // Fetch article and allCategories without related articles (requires another query or adjusting main one)
             // For simplicity now, let's return null, or fetch without related
              const fallbackQuery = gql`
                 query GetArticleAndCatsV5($slug: String!) {
                     articles(filters: { slug: { eq: $slug } }, pagination:{limit:1}) { documentId title slug publication_date body seo_title seo_description featured_image { documentId url alternativeText width height } source { documentId name icon { documentId url alternativeText } website } categories(pagination: { limit: 10 }) { documentId name slug } }
                     allCategories: categories(pagination: { limit: 50 }, sort: "name:asc") { documentId name slug }
                 }`;
              const fallbackData = await client.request<{ articles: ArticleV5[]; allCategories?: CategoryV5[] }>(fallbackQuery, { slug });
              const article = fallbackData?.articles?.[0];
              if (!article) return null;
              return { article, allCategories: fallbackData.allCategories || [], relatedArticles: [] }; // Return empty related
        }

        // Now fetch everything including related articles using the primary category slug
        const data = await client.request<{
            articles: ArticleV5[];
            allCategories?: CategoryV5[] | null;
            relatedArticles?: ArticleCardDataV5[] | null; // Use alias from query
        }>(
            GET_ARTICLE_DATA_WITH_RELATED_V5,
            { slug, primaryCategorySlug, relatedLimit: 4 } // Pass slug and category slug
        );

        const article = data?.articles?.[0];
        const allCategories = data?.allCategories || [];
        const relatedArticles = data?.relatedArticles || [];

        if (!article) return null; // Article still not found

        return { article, allCategories, relatedArticles };

    } catch (error: unknown) {

        console.error(`Failed to fetch article with slug '${slug}':`, error); // Log the raw error

        // Check if it's a ClientError from graphql-request
        if (error instanceof ClientError) {
            console.error("GraphQL Request/Response Error Details:", JSON.stringify(error, undefined, 2));
            // ClientError often has response.errors for GraphQL errors
            if (error.response && error.response.errors) {
                console.error("Detailed GraphQL Errors:", JSON.stringify(error.response.errors, undefined, 2));
            }
        } else if (error instanceof Error) {
            // Handle generic JavaScript errors
            console.error("Generic Error:", error.message);
        } else {
            // Handle other types of throwables if necessary
            console.error("Caught non-Error throwable:", error);
        }

     return null;
}
}

type ArticlePageProps = {
  // Type 'params' as a Promise resolving to the object with the slug
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function ArticlePage({ params }: ArticlePageProps) {
	const resolvedParams = use(params); 
	const { slug } = resolvedParams;

    // State to hold server-fetched data
    const [pageData, setPageData] = useState<FetchedArticleData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get actions/state from Zustand store
    const setAllCategories = useCategoryStore((state) => state.setAllCategories);

    // Fetch data client-side in this example
    // Alternatively, keep server fetch and pass data down, but client interaction needs client component
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        getArticleData(slug)
            .then(data => {
                if (data) {
                    setPageData(data);
		    setAllCategories(data.allCategories || []);
                } else {
                    // Handle not found on client if fetch returns null
                    // router.replace('/404'); // Or show message
                     setError("Article not found."); // Set error state
                     // Note: next/navigation notFound() only works in Server Components
                }
            })
            .catch(err => {
                console.error("Client-side fetch error:", err);
                setError("Failed to load article data.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [slug, setAllCategories]); // Re-fetch if slug changes

    if (isLoading) {
        return <main className="py-8 md:py-12"><Container><LoadingSpinner /></Container></main>; // Show loading state
    }

    if (error || !pageData) {
        // Optionally use notFound() if this component *remained* a Server Component
        // But since we need client interaction for tabs, we handle error/null state here
        return <main className="py-8 md:py-12"><Container><p className="text-red-500 text-center">{error || "Article data could not be loaded."}</p></Container></main>;
    }

    const { article, relatedArticles } = pageData;

    const siteBaseUrl = typeof window !== 'undefined' ? window.location.origin : ''; // Get base URL client-side
    const canonicalUrl = `${siteBaseUrl}/article/${article.slug}`;

  const imageUrl = article.featured_image?.url
        ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL || ''}${article.featured_image.url}`
        : null;

  return (
    <>
            <div className='bg-white py-2 pb-1 shadow-sm border-b'> {/* Style container */}
                <Container>
		    <CategoryTabs />
                </Container>
            </div>

      <main className="pt-6 pb-8 md:pt-8 md:pb-12">
      <Container>
      <div className="bg-white rounded-lg p-4 md:p-6 shadow">
        <article className="space-y-6">
          {/* Optional: Featured Image */}
           {imageUrl && article.featured_image && (
            <div className="relative h-64 md:h-96 w-full mb-8 overflow-hidden rounded-lg">
              <Image
                src={imageUrl}
                alt={article.featured_image.alternativeText || article.title}
                fill // Use fill to cover the container div
                style={{ objectFit: 'cover' }} // Cover the area
                priority // Prioritize loading the main article image
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px" // Example sizes
		className="rounded-lg"
              />
            </div>
          )}

           {/* Article Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>

          {/* Article Metadata - Pass fetched data */}
          <ArticleMeta
             source={article.source}
             date={article.publication_date}
             categories={article.categories}
          />
          <SocialShareButtons url={canonicalUrl} title={article.title} />

          {/* Separator */}
          <hr className="my-2 border-gray-200" />

          {/* Article Body - Pass fetched markdown body */}
          <ArticleBody content={article.body} />
        </article>
	</div>
                    {/* --- Render Related Articles Section --- */}
                    {relatedArticles && relatedArticles.length > 0 && (
                        <RelatedArticles articles={relatedArticles} />
                    )}
      </Container>
      </main>
    </>
  );
}
