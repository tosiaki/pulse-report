'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';
import { ArticleCardDataV5 } from '@/types/Article'; // Adjust import path if needed

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

// Utility function (can be moved to a shared utils file)
const getStrapiMediaUrl = (url?: string): string | null => {
    if (!url) return null;
    return `${process.env.NEXT_PUBLIC_STRAPI_API_URL || ''}${url}`;
};


interface ArticleCarouselProps {
    articles: ArticleCardDataV5[];
}

export default function ArticleCarousel({ articles }: ArticleCarouselProps) {
    if (!articles || articles.length === 0) {
        return null; // Don't render if no articles
    }

    return (
        // Add relative positioning for custom navigation/pagination if needed
        <div className="relative group md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <Swiper
                modules={[Navigation, Pagination, Autoplay, A11y]}
                spaceBetween={0} // No space between slides
                slidesPerView={1} // Show one slide at a time
                loop={true}
                autoplay={{
                    delay: 4000, // Autoplay every 4 seconds
                    disableOnInteraction: true, // Stop autoplay on user interaction
                }}
                pagination={{
                     clickable: true,
                     // Custom styling for dots (optional)
                     // el: '.swiper-pagination-custom', // If using custom element container
                     bulletClass: 'swiper-pagination-bullet',
                     bulletActiveClass: '!bg-blue-600 !opacity-100', // Active dot style override
                     }}
                navigation={true} // Enable default navigation arrows
                // Customize navigation arrows appearance (optional)
                // navigation={{ nextEl: '.swiper-button-next-custom', prevEl: '.swiper-button-prev-custom' }}
                 className="h-full" // Ensure swiper takes full height if needed
            >
                {articles.map((article) => {
                    const imageUrl = getStrapiMediaUrl(article.featured_image?.url);
                    return (
                        <SwiperSlide key={article.documentId} className="relative">
                            {/* Link covers the entire slide */}
                            <Link href={`/article/${article.slug}`} className="absolute inset-0 z-10" aria-label={`Read article: ${article.title}`}></Link>

                            {/* Image Wrapper */}
                             <div className="relative w-full aspect-[5/3] overflow-hidden"> {/* Use same aspect ratio */}
                                {imageUrl && article.featured_image ? (
                                    <Image
                                        src={imageUrl}
                                        alt={article.featured_image.alternativeText || article.title}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 1024px) 100vw, 66vw" // Carousel takes up more space
                                        priority={true} // Prioritize first few images
                                    />
                                ) : (
                                     <div className="h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                                )}
                             </div>
                            {/* Text Content Overlayed */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/50 to-transparent z-20 pointer-events-none">
                                <h3 className="text-lg md:text-xl font-bold text-white line-clamp-2">
                                    {article.title}
                                </h3>
                                {/* Maybe source/time overlayed too? Keeping it simple for now */}
                            </div>
                        </SwiperSlide>
                    );
                })}
                {/* Optional: Custom elements for pagination/navigation if needed */}
                {/* <div className="swiper-pagination-custom absolute bottom-2 left-1/2 -translate-x-1/2 z-30 space-x-2"></div> */}
            </Swiper>
            {/* Add custom styles for Swiper elements if default isn't sufficient */}
             <style jsx global>{`
                .swiper-pagination-bullet {
                    background-color: #fff;
                    opacity: 0.7;
                    transition: background-color 0.2s, opacity 0.2s;
                }
                .swiper-button-next, .swiper-button-prev {
                    color: #fff; /* White arrows */
                    background-color: rgba(0, 0, 0, 0.3); /* Semi-transparent background */
                    border-radius: 50%;
                    width: 32px; /* Adjust size */
                    height: 32px;
                    transition: background-color 0.2s;
                }
                .swiper-button-next:hover, .swiper-button-prev:hover {
                     background-color: rgba(0, 0, 0, 0.5);
                }
                .swiper-button-next:after, .swiper-button-prev:after {
                    font-size: 16px; /* Adjust arrow size */
                    font-weight: bold;
                }

             `}</style>
        </div>
    );
}
