import Link from 'next/link';
import Image from 'next/image';
import { HomepageArticleV5 } from '@/app/page'; // Import the type from page.tsx (or a central types file)

interface HeroSectionProps {
  articles: HomepageArticleV5[];
}

// Utility function to safely construct Strapi image URLs
const getStrapiMediaUrl = (url?: string): string | null => {
  if (!url) return null;
  return `${process.env.NEXT_PUBLIC_STRAPI_API_URL || ''}${url}`;
};

export default function HeroSection({ articles }: HeroSectionProps) {
  if (!articles || articles.length === 0) {
    return <div className="bg-gray-200 h-64 flex items-center justify-center rounded">No hero articles available.</div>;
  }

  // Let's display the first article prominently and maybe 2-3 smaller ones
  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 3); // Take the next 2 articles

  const mainImageUrl = getStrapiMediaUrl(mainArticle.featured_image?.url);

  return (
    <section aria-labelledby="hero-heading">
      <h2 id="hero-heading" className="sr-only">Hero Section</h2> {/* Screen reader heading */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        {/* Main Hero Article (takes 2 columns on large screens) */}
        <div className="lg:col-span-2 relative rounded-lg overflow-hidden shadow-lg group">
          {mainImageUrl && mainArticle.featured_image && (
            <Image
              src={mainImageUrl}
              alt={mainArticle.featured_image.alternativeText || mainArticle.title}
              fill
              style={{ objectFit: 'cover' }}
              priority // Prioritize hero image
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="transition-transform duration-300 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent"></div> {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 p-4 md:p-6">
            <Link href={`/article/${mainArticle.slug}`} className="block">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 line-clamp-3 hover:underline">
                {mainArticle.title}
              </h3>
              {mainArticle.excerpt && (
                <p className="text-sm md:text-base text-gray-200 line-clamp-2 hidden sm:block">
                  {mainArticle.excerpt}
                </p>
              )}
            </Link>
          </div>
           <Link href={`/article/${mainArticle.slug}`} className="absolute inset-0" aria-label={`Read article: ${mainArticle.title}`}></Link> {/* Overlay Link */}
        </div>

        {/* Side Articles (takes 1 column on large screens) */}
        <div className="space-y-4 lg:space-y-6">
          {sideArticles.map((article) => {
            const imageUrl = getStrapiMediaUrl(article.featured_image?.url);
            return (
              <Link key={article.documentId} href={`/article/${article.slug}`} className="block group bg-white rounded-lg shadow hover:shadow-md overflow-hidden transition-shadow duration-200">
                <div className="flex">
                   {imageUrl && article.featured_image && (
                      <div className="flex-shrink-0 w-24 h-20 md:w-28 md:h-24 relative">
                         <Image
                            src={imageUrl}
                            alt={article.featured_image.alternativeText || article.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="120px"
                            className="transition-transform duration-300 group-hover:scale-105"
                         />
                      </div>
                   )}
                   <div className={`p-3 ${!imageUrl ? 'w-full' : ''}`}> {/* Adjust padding if no image */}
                      <h4 className="text-sm md:text-base font-semibold text-gray-800 line-clamp-3 group-hover:text-blue-600">
                         {article.title}
                      </h4>
                   </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
