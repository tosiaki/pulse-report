import React from 'react';
import { GraphQLClient, gql } from 'graphql-request';
import type { Metadata } from 'next';
import { ArticleV5 } from '@/types/Article'; // Adjust import path if needed
// Import other necessary types (SourceV5, StrapiImageDataV5 if used in fetcher)

// --- Metadata Fetching Function (Server-Side) ---
async function getArticleMetadataData(slug: string): Promise<ArticleV5 | null> {
   const endpoint = process.env.NEXT_PUBLIC_STRAPI_API_URL ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/graphql` : null;
   const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
   if (!endpoint || !token) return null;
   const client = new GraphQLClient(endpoint, { headers: { Authorization: `Bearer ${token}` } });
   // Use the specific query needed for metadata fields
   const query = gql`
       query GetArticleMeta($slug: String!) {
         articles(filters: { slug: { eq: $slug } }) {
           documentId title slug excerpt seo_title seo_description publication_date
           featured_image { url width height alternativeText }
           source { name }
         }
       }
   `;
   try {
       const data = await client.request<{ articles: ArticleV5[] }>(query, { slug });
       return data?.articles?.[0] || null;
   } catch {
       return null;
   }
}

// --- generateMetadata Function (Server-Side Export) ---
type MetadataPropsArticle = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: MetadataPropsArticle
): Promise<Metadata> {
  const resolvedParams = await params; // <-- Await here
  const slug = resolvedParams.slug;

  const article = await getArticleMetadataData(slug);

  if (!article) { return { title: 'Article Not Found | Pulse Report' }; }

  const pageTitle = article.seo_title || article.title;
  const pageDescription = article.seo_description || article.excerpt || `Read the article "${article.title}" on Pulse Report.`;
  const imageUrl = article.featured_image?.url ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL || ''}${article.featured_image.url}` : '/default-og-image.png';

  return {
    title: `${pageTitle} | Pulse Report`,
    description: pageDescription,
    openGraph: {
      title: pageTitle, description: pageDescription, url: `/article/${article.slug}`, siteName: 'Pulse Report',
      images: article.featured_image ? [{ url: imageUrl, width: article.featured_image.width || 1200, height: article.featured_image.height || 630, alt: article.featured_image.alternativeText || article.title, }] : [],
      locale: 'en_US', type: 'article', publishedTime: article.publication_date,
    },
    twitter: { card: 'summary_large_image', title: pageTitle, description: pageDescription, images: [imageUrl], },
    alternates: { canonical: `/article/${article.slug}`, },
  };
}

// --- Basic Layout Component ---
// This layout simply passes children through, but allows metadata generation
export default function ArticleLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>; // Can add article-specific layout elements here later if needed
}
