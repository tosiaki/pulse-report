// Represents the structure of image data from Strapi v5 GraphQL
export interface StrapiImageDataV5 {
    documentId: string; // Or potentially just 'id' - check playground if unsure
    url: string;
    alternativeText?: string | null; // Make null possible too
    width?: number | null;
    height?: number | null;
    caption?: string | null;
    formats?: unknown; // Add specific formats (thumbnail, small, etc.) if needed
    name: string; // Usually includes the filename
    mime: string; // e.g., 'image/jpeg'
}
