import { StrapiImageDataV5 } from './Strapi';

export interface SourceV5 {
    documentId: string;
    name: string;
    icon?: StrapiImageDataV5 | null;
    website?: string | null;
}
