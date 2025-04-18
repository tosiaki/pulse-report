'use client'; // Mark as Client Component

import React, { useEffect } from 'react'; 
import { useCategoryStore } from '@/store/categoryStore';
import { ArticleCardDataV5 } from '@/types/Article';
import { CategoryV5 } from '@/types/Category';

import CategoryTabs from './CategoryTabs';
import ArticleGrid from './ArticleGrid';
import LoadingSpinner from './LoadingSpinner'; // Assume you have a loading spinner component

interface HomepageClientContentProps {
    initialArticles: ArticleCardDataV5[];
    allCategories: CategoryV5[];
}

export default function HomepageClientContent({
    initialArticles,
    allCategories,
}: HomepageClientContentProps) {
    const articles = useCategoryStore((state) => state.articles);
    const isLoading = useCategoryStore((state) => state.isLoading);
    const error = useCategoryStore((state) => state.error);
    const setAllCategories = useCategoryStore((state) => state.setAllCategories);
    const setInitialArticles = useCategoryStore((state) => state.setInitialArticles);
    const hasFetchedInitially = useCategoryStore((state) => state.hasFetchedInitially);

    // --- Hydration Effect ---
    useEffect(() => {
        // Set categories in the store once when the component mounts
        setAllCategories(allCategories);
	setInitialArticles(initialArticles);
    }, [allCategories, setAllCategories, setInitialArticles, initialArticles]); // Adjusted dependencies


    const showLoading = isLoading;

    return (
        <div className="bg-gray-100 rounded-lg p-4 md:p-6 mt-2 shadow">
            {/* CategoryTabs now only reads allCategories from store and uses actions */}
            <CategoryTabs />

            <div className="mt-6">
                {showLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <LoadingSpinner />
                        <span className="ml-3 text-gray-600">Loading articles...</span>
                    </div>
                 ) : error ? (
                    <div className="text-center text-red-600 bg-red-100 p-4 rounded border border-red-300">
                        Error: {error}
                    </div>
                 ) : (
                    // Pass the articles directly from the store state
                    <ArticleGrid articles={articles} />
                 )}

                 {/* Show 'No articles' only if not loading, no error, fetch has happened, and articles is empty */}
                 {!showLoading && !error && articles.length === 0 && hasFetchedInitially && (
                     <p className='text-center text-gray-500 py-6'>No articles found for this category.</p>
                 )}
            </div>
        </div>
    );
}
