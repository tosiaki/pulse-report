'use client';

import React from 'react'; 
import Link from 'next/link';
import Image from 'next/image';
import { ArticleCardDataV5 } from '@/types/Article'; // Use the card-specific type
import { formatDistanceToNow } from 'date-fns'; // Import date-fns function
import AdCardPlaceholder from './AdCardPlaceholder';
import ArticleCarousel from './ArticleCarousel';
import useMediaQuery from '@/hooks/useMediaQuery';
import RelatedStoriesBox from './RelatedStoriesBox';

interface ArticleGridProps {
  articles: ArticleCardDataV5[];
  adFrequency?: number;
}

// Utility function (can be moved to a shared utils file)
const getStrapiMediaUrl = (url?: string): string | null => {
  if (!url) return null;
  return `${process.env.NEXT_PUBLIC_STRAPI_API_URL || ''}${url}`;
};

const CAROUSEL_ITEM_COUNT = 6; // Number of items for the carousel

export default function ArticleGrid({
    articles,
    adFrequency = 5 // Inject ad every 5 items by default
}: ArticleGridProps) {
const isSmScreen = useMediaQuery('(min-width: 640px)');
    // Detect if the 'md' breakpoint (min-width: 768px) is active
    // This breakpoint should correspond to when md:grid-cols-3 is applied
    const isMdScreen = useMediaQuery('(min-width: 768px)');
    // Also detect if larger breakpoints (where it might be 4 cols) are active
    const isLgScreen = useMediaQuery('(min-width: 1024px)');

    // Determine if the 3-column layout is specifically active
    const isExactlyThreeColumns = isMdScreen && !isLgScreen;

    // Determine number of columns based on breakpoints
    const numColumns = isLgScreen ? 4 : isMdScreen ? 3 : isSmScreen ? 2 : 1; // Assuming sm:grid-cols-2 exists

  if (!articles || articles.length === 0) {
     return null; // Render nothing if no articles
  }

    // Ensure adFrequency is a positive integer
    const safeAdFrequency = Math.max(1, Math.floor(adFrequency));

    // Split articles if the carousel should be shown
    const showCarousel = isExactlyThreeColumns && articles.length >= CAROUSEL_ITEM_COUNT;

    // If carousel is shown, grid starts after those items, otherwise from the beginning
    const gridStartIndex = showCarousel ? CAROUSEL_ITEM_COUNT : 0;

    // --- Logic for Related Stories Box ---
    // Show if 3 or 4 columns are active
    const showRelatedBoxCondition = numColumns === 3 || numColumns === 4;
    // Index where the box should appear (first item of second row)
    // Note: This index is relative to the START of the grid items (after potential carousel)
    const relatedBoxGridIndex = numColumns; // 3 for 3-col, 4 for 4-col
    // Check if there are enough articles *after* the target index to fill the box
    const canShowRelatedBox = showRelatedBoxCondition && (articles.length > gridStartIndex + relatedBoxGridIndex + 2); // Need index + 3 more articles

    // --- Render Logic ---
    const itemsToRender = []; // Build an array of JSX elements
    let articleIndex = gridStartIndex; // Track position in the main 'articles' array
    let gridItemCount = 0; // Track items added to the grid (excluding carousel)

    // Add carousel if needed (spans 2 columns in 3-col layout)
    if (showCarousel) {
        itemsToRender.push(<ArticleCarousel key="carousel" articles={articles.slice(0, CAROUSEL_ITEM_COUNT)} />);
        // Account for carousel taking grid slots (assumes it pushes things correctly, might need CSS grid adjustments)
         gridItemCount += isExactlyThreeColumns ? 2 : 0; // Rough estimate
    }


    // Loop through articles that should appear in the grid
    while (articleIndex < articles.length) {
         const currentArticle = articles[articleIndex];
         const currentGridPosition = gridItemCount; // Position within the visual grid render
         const originalIndexForAd = articleIndex; // Index for ad frequency check

         // Check if this is the position for the Related Stories Box
         if (canShowRelatedBox && currentGridPosition === relatedBoxGridIndex) {
             // Render Related Stories Box
             const relatedArticles = [
                 articles[articleIndex + 1], // Article that would have been here
                 articles[articleIndex + 2], // Next article
                 articles[articleIndex + 3], // Article after that
             ];
             itemsToRender.push(<RelatedStoriesBox key={`related-${articleIndex}`} articles={relatedArticles} />);
             gridItemCount++; // The box takes one grid slot

             // --- IMPORTANT: Skip the next 3 articles in the main loop ---
             articleIndex += 4; // Move index past the 3 articles included in the box + the current slot
             continue; // Skip to next iteration
         }

         // --- Render Regular Article Card ---
         const imageUrl = getStrapiMediaUrl(currentArticle?.featured_image?.url);

	 let timeAgo = '';

        try {
	timeAgo = formatDistanceToNow(new Date(currentArticle.publication_date), { addSuffix: true }).replace(/^about\s/, '').replace('less than a minute ago', '1m ago');
        } catch (e) {
            console.error("Error formatting date:", currentArticle.publication_date, e);
            // Handle invalid date string if needed
        }


         const source = currentArticle?.source;
         const sourceName = source?.name || "Pulse Report"; // Default if no source linked
         const sourceIconUrl = getStrapiMediaUrl(source?.icon?.url);

         itemsToRender.push(
          <Link
	    key={currentArticle.documentId}
            href={`/article/${currentArticle.slug}`}
            className="block group"
          >
            {/* Card container */}
            <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-200">
               {/* Image Wrapper */}
               {imageUrl && currentArticle.featured_image ? (
                 <div className="relative w-full aspect-[5/3] overflow-hidden"> {/* Aspect ratio ~60% */}
                    <Image
                      src={imageUrl}
                      alt={currentArticle.featured_image.alternativeText || currentArticle.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" // Adjust sizes based on grid columns
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                 </div>
               ) : ( // Placeholder if no image
                  <div className="relative w-full aspect-[5/3] bg-gray-200 flex items-center justify-center">
                     <span className="text-gray-400 text-sm italic">No Image</span>
                  </div>
               )}

               {/* Text Content Wrapper */}
               <div className="p-3 flex flex-col flex-grow"> {/* Use flex-grow to push title down if needed */}
                  {/* Row 1: Source/Time */}
                  <div className="flex items-center text-xs text-gray-500 mb-1 gap-1.5">
                             {/* Source Icon */}
                             {sourceIconUrl && source?.icon && (
                                 <Image
                                     src={sourceIconUrl}
                                     alt={source.icon.alternativeText || `${sourceName} Logo`}
                                     width={12} // Small icon size
                                     height={12}
                                     className="flex-shrink-0" // Prevent shrinking
                                 />
                             )}
                             {/* Source Name */}
                             <span className="font-medium truncate flex-shrink min-w-0">{sourceName}</span> {/* Allow shrinking/truncating */}
                             {/* Time Ago */}
                             <span className="ml-auto flex-shrink-0">{timeAgo}</span>
                  </div>

                  {/* Row 2: Title */}
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-3 flex-grow group-hover:text-blue-600">
                     {currentArticle.title}
                  </h3>
                  {/* Removed Excerpt */}
               </div>
            </div>
          </Link>
	 );

         gridItemCount++;
         articleIndex++; // Move to the next article

         // --- Ad Insertion Logic (after rendering the article) ---
         const shouldInsertAd = (originalIndexForAd + 1) % safeAdFrequency === 0 && originalIndexForAd > 0;
         if (shouldInsertAd) {
             itemsToRender.push(<AdCardPlaceholder key={`ad-${originalIndexForAd}`} />);
             gridItemCount++; // Ad takes a grid slot
         }
    } // End While loop
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {itemsToRender}
        </div>
    );
}
