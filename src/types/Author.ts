import { StrapiImageDataV5 } from './Strapi'; // Import image type

export interface AuthorV5 {
    documentId: string;
    name: string;
    picture?: StrapiImageDataV5 | null; // Author picture is optional
    bio?: string | null; // Optional rich text/markdown field
    // Add relation to articles if fetching authors *with* their articles
    // articles?: ArticleV5[];
}
