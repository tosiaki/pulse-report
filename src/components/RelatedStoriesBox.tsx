import Link from 'next/link';
import Image from 'next/image';
import { ArticleCardDataV5 } from '@/types/Article'; // Adjust import path if needed
// Optional: Import an icon for "Related Stories"
import { ListBulletIcon } from '@heroicons/react/24/outline'; // Example icon
import { formatDistanceToNow } from 'date-fns';

// Utility function (can be moved to a shared utils file)
const getStrapiMediaUrl = (url?: string): string | null => {
    if (!url) return null;
    return `${process.env.NEXT_PUBLIC_STRAPI_API_URL || ''}${url}`;
};

interface RelatedStoriesBoxProps {
    articles: (ArticleCardDataV5 | undefined)[]; // Array potentially holding up to 3 articles (might be undefined if list ends)
}

export default function RelatedStoriesBox({ articles = [] }: RelatedStoriesBoxProps) {
    // Filter out any undefined entries if the main list was shorter than expected
    const validArticles = articles.filter((a): a is ArticleCardDataV5 => !!a);

    if (validArticles.length === 0) {
        return null; // Don't render if no articles passed
    }

    return (
        // Container similar to article cards but potentially different padding/bg
        <div className="bg-gray-50 rounded-lg shadow p-3 h-full flex flex-col"> {/* Lighter bg? */}
             {/* Header */}
            <div className="flex items-center text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                <ListBulletIcon className="w-5 h-5 mr-2 text-blue-600" />
                Related Stories
            </div>

            {/* List of text-only article links */}
            <div className="space-y-3 flex-grow">
                {validArticles.map((article) => {
                     // Calculate time ago
                     let timeAgo = '';
                     try {
                         timeAgo = formatDistanceToNow(new Date(article.publication_date), { addSuffix: true });
                         timeAgo = timeAgo.replace(/^about\s/, '');
                         timeAgo = timeAgo.replace('less than a minute ago', '1m ago');
                     } catch (e) { console.error("Error formatting related date:", article.publication_date, e); }

                     // Get source details
                     const source = article?.source;
                     const sourceName = source?.name || "Pulse Report"; // Default source
                     const sourceIconUrl = getStrapiMediaUrl(source?.icon?.url);

		     return (
                    <Link
                        key={article.documentId}
                        href={`/article/${article.slug}`}
                        className="block group"
                    >

                        {/* Row 1: Source Icon/Name/Time */}
                        <div className="flex items-center text-xs text-gray-500 mb-1 gap-1.5">
                            {/* Source Icon */}
                            {sourceIconUrl && source?.icon && (
                                <Image
                                    src={sourceIconUrl}
                                    alt={source.icon.alternativeText || `${sourceName} Logo`}
                                    width={12}
                                    height={12}
                                    className="flex-shrink-0"
                                />
                            )}
                            {/* Source Name */}
                            <span className="font-medium truncate flex-shrink min-w-0">{sourceName}</span>
                            {/* Time Ago */}
                            <span className="ml-auto flex-shrink-0">{timeAgo}</span>
                        </div>

                        {/* Row 2: Title */}
                        <h4 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600 group-hover:underline">
                            {article.title}
                        </h4>
                    </Link>
                )
		}
				  )}
            </div>
        </div>
    );
}
