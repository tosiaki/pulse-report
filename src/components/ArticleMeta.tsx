import Link from 'next/link';
import Image from 'next/image';
import { SourceV5 } from '@/types/Source';
import { CategoryV5 } from '@/types/Category';

interface ArticleMetaProps {
  source?: SourceV5 | null;
  date: string;
  categories?: CategoryV5[] | null | undefined;
}

// Utility function
const getStrapiMediaUrl = (url?: string): string | null => {
  if (!url) return null;
  return `${process.env.NEXT_PUBLIC_STRAPI_API_URL || ''}${url}`;
};

export default function ArticleMeta({ source, date, categories }: ArticleMetaProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sourceIconUrl = getStrapiMediaUrl(source?.icon?.url);

  return (
    <div className="flex flex-wrap items-center text-sm text-gray-600 space-x-4">
             {/* Source Info */}
             {source && (
                <div className="flex items-center space-x-2">
                   {sourceIconUrl && source.icon && (
                     <Image
                       src={sourceIconUrl}
                       alt={source.icon.alternativeText || `${source.name} Logo`}
                       width={12} // Slightly larger icon here?
                       height={12}
                       className="flex-shrink-0 rounded-full"
                     />
                   )}
                  {/* Optionally make source name a link if website URL exists */}
                  {source.website ? (
                     <a href={source.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {source.name}
                     </a>
                   ) : (
                      <span>{source.name}</span>
                   )}
                </div>
             )}

      {/* Publication Date */}
      <time dateTime={date}>{formattedDate}</time>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="flex items-center space-x-2 pt-2 sm:pt-0">
          <span>In:</span>
          {categories.map((category) => (
            <Link
              key={category.documentId}
              href={`/category/${category.slug}`}
              className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors duration-200"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
