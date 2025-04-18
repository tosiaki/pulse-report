import { ArticleCardDataV5 } from '@/types/Article';
import ArticleGrid from './ArticleGrid'; // Reuse the existing grid

interface RelatedArticlesProps {
    articles: ArticleCardDataV5[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
    if (!articles || articles.length === 0) {
        return null;
    }

    return (
        // Section wrapper with top margin/border
        <section className="mt-12 pt-8 border-t border-gray-200" aria-labelledby="related-articles-heading">
             <h2 id="related-articles-heading" className="text-2xl font-bold text-gray-800 mb-6">
                 Related Articles
             </h2>
             {/* Render ArticleGrid DIRECTLY - It will create its own grid */}
             <ArticleGrid articles={articles} />
             {/* REMOVE the extra wrapping <div> with grid classes */}
        </section>
    );
}
