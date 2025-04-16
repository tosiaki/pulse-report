export interface CategoryV5 {
    documentId: string;
    name: string;
    slug: string;
    description?: string | null; // Optional field
    // Add relation to articles if you ever fetch categories *with* their articles
    // articles?: ArticleV5[];
}
