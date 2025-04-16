import React from 'react';
import { GraphQLClient, gql } from 'graphql-request';
import type { Metadata } from 'next';
import { CategoryV5 } from '@/types/Category'; // Adjust import path if needed
// We need a dedicated fetcher for category metadata

async function getCategoryMetadataData(slug: string): Promise<Pick<CategoryV5, 'name' | 'description' | 'slug'> | null> {
   const endpoint = process.env.NEXT_PUBLIC_STRAPI_API_URL ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/graphql` : null;
   const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
   if (!endpoint || !token) return null;
   const client = new GraphQLClient(endpoint, { headers: { Authorization: `Bearer ${token}` } });
   const query = gql`
       query GetCategoryMeta($slug: String!) {
         categories(filters: { slug: { eq: $slug } }) {
            name description slug
         }
       }
   `;
   try {
       const data = await client.request<{ categories: Pick<CategoryV5, 'name' | 'description' | 'slug'>[] }>(query, { slug });
       return data?.categories?.[0] || null;
   } catch {
       return null;
   }
}

type MetadataPropsCategory = { params: Promise<{ slug: string }> };

export async function generateMetadata(
  { params }: MetadataPropsCategory
): Promise<Metadata> {
  const resolvedParams = await params; // <-- Await here
  const slug = resolvedParams.slug;
  const category = await getCategoryMetadataData(slug);

  if (!category) {
    return { title: 'Category Not Found | Pulse Report' };
  }

  const pageTitle = `${category.name} News`; // e.g., "Politics News"
  const pageDescription = category.description || `Latest news articles in the ${category.name} category on Pulse Report.`;

  return {
    title: `${pageTitle} | Pulse Report`,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `/category/${category.slug}`,
      siteName: 'Pulse Report',
      locale: 'en_US',
      type: 'website', // Or 'object' for a category section
    },
    twitter: {
      card: 'summary',
      title: pageTitle,
      description: pageDescription,
    },
     alternates: {
        canonical: `/category/${category.slug}`,
     },
  };
}

// --- Basic Layout Component ---
// This layout simply passes children through, but allows metadata generation
export default function CategoryLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>; // Can add category-specific layout elements here later if needed
}
