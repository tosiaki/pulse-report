import { StrapiImageDataV5 } from './Strapi';
import { CategoryV5 } from './Category';
import { AuthorV5 } from './Author';
import { SourceV5 } from './Source';

// Main Article Type for Strapi v5 GraphQL responses
export interface ArticleV5 {
    documentId: string;
    title: string;
    slug: string;
    publication_date: string; // ISO date string
    featured_image?: StrapiImageDataV5 | null; // Optional
    body: string; // Markdown content
    excerpt?: string | null; // Optional

    // Relations (adjust based on whether they are fetched)
    author?: AuthorV5 | null; // Optional relation
    source?: SourceV5 | null;
    categories?: CategoryV5[] | null; // Optional relation, could be empty array or null

    is_advertisement?: boolean | null;
    external_url?: string | null; 

    // Add SEO fields if defined in Strapi
    seo_title?: string | null;
    seo_description?: string | null;
}

// You might create subtypes if different pages need different fields
// e.g., Homepage Article might only need title, slug, image, excerpt
export interface ArticleCardDataV5 extends Pick<ArticleV5,
    'documentId' | 'title' | 'slug' | 'excerpt' | 'publication_date'
    > {
    featured_image?: Pick<StrapiImageDataV5, 'url' | 'alternativeText' | 'width' | 'height'> | null;
    // Optionally include minimal category info if needed on cards
     categories?: Pick<CategoryV5, 'documentId' | 'name' | 'slug'>[] | null;
     author?: Pick<AuthorV5, 'name'> | null; 
     source?: Pick<SourceV5, 'documentId' | 'name' | 'icon'> | null;

    is_advertisement?: boolean | null;
    external_url?: string | null;
}
