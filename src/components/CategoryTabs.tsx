'use client';
import React from 'react';
import { useRouter } from 'next/navigation'; // Import router

import { useCategoryStore } from '@/store/categoryStore';
import { CategoryV5 } from '@/types/Category';
import { Menu, Transition } from '@headlessui/react'; // Import Menu and Transition
import { ChevronDownIcon } from '@heroicons/react/20/solid'; // Dropdown icon
import useMediaQuery from '@/hooks/useMediaQuery';

// Define breakpoints and corresponding visible tab counts
const VISIBLE_TABS_CONFIG = {
    sm: 3, // Small screens
    md: 6, // Medium screens
    xl: 10, // Large screens (adjust breakpoint/count as needed)
    xxl: 13,
};

export default function CategoryTabs() {
    // Get state and actions from the store
    const allCategories = useCategoryStore((state) => state.allCategories);
    const selectedCategorySlug = useCategoryStore((state) => state.selectedCategorySlug);
    const setSelectedCategorySlug = useCategoryStore((state) => state.setSelectedCategorySlug); // Get the action
    const router = useRouter(); 

    // --- Media Query Detection ---
    const isMdScreen = useMediaQuery('(min-width: 768px)'); // Corresponds to md:
    const isXlScreen = useMediaQuery('(min-width: 1280px)'); // Corresponds to xl: (adjust if needed)
    const is2xlScreen = useMediaQuery('(min-width: 1536px)'); // 2xl

    // --- Determine Visible Tab Count ---
    const visibleCount = is2xlScreen ? VISIBLE_TABS_CONFIG.xxl :
	                 isXlScreen ? VISIBLE_TABS_CONFIG.xl :
                         isMdScreen ? VISIBLE_TABS_CONFIG.md :
                         VISIBLE_TABS_CONFIG.sm;

    // --- Prepare Tabs ---
    const homeTab: CategoryV5 = { documentId: 'home', name: 'Home', slug: '' };
    const allTabs = [homeTab, ...(Array.isArray(allCategories) ? allCategories : [])];

    if (allTabs.length <= 1) { return null; } // Don't render if only "Home"

    // Split tabs into visible and dropdown based on count
    const visibleTabs = allTabs.slice(0, visibleCount);
    const dropdownTabs = allTabs.slice(visibleCount);

    // --- Check if Active Tab is in Dropdown ---
    const isActiveTabInDropdown = dropdownTabs.some(tab => tab.slug === selectedCategorySlug);

    const handleTabClick = (slug: string | null) => {
        const currentPath = window.location.pathname; // Check current path
        setSelectedCategorySlug(slug);
        if (currentPath !== '/') {
            router.push('/');
        }
    }

    // --- Button/Link Rendering Logic ---
    const renderTab = (tab: CategoryV5, isDropdownItem = false) => {
        const isActive = tab.slug === selectedCategorySlug;
        const commonClasses = `text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none rounded-sm`;
        const activeClasses = `border-blue-600 text-blue-600 ${!isDropdownItem ? 'border-b-2' : 'bg-blue-100'}`;
        const inactiveClasses = `text-gray-500 hover:text-gray-700 ${!isDropdownItem ? 'border-b-2 border-transparent hover:border-gray-300' : 'hover:bg-gray-100'}`;
        const focusClasses = 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-1';

        if (isDropdownItem) {
             return (
                <Menu.Item key={tab.documentId}>
                    {({ active }) => ( // Headless UI provides hover state
                        <button
                            type="button"
                            onClick={() => handleTabClick(tab.slug)}
                             className={`${commonClasses} ${focusClasses} block w-full px-4 py-2 text-left
                                ${isActive ? 'bg-blue-100 text-blue-700 font-semibold' : active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}
                            `}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {tab.name}
                        </button>
                    )}
                </Menu.Item>
             );
        } else {
            // Render as visible tab button
            return (
                <button
                    key={tab.documentId}
                    type="button"
                    onClick={() => handleTabClick(tab.slug)}
                    className={`${commonClasses} ${focusClasses} inline-block py-3 px-1
                        ${isActive ? activeClasses : inactiveClasses}
                    `}
                    aria-current={isActive ? 'page' : undefined}
                >
                    {tab.name}
                </button>
            );
        }
    };

    // Handle the initial fetch for the default category ("Home") if needed
    // This might be better handled in the page component on initial load
    // useEffect(() => {
    //    if (articles.length === 0 && !isLoading && !error && selectedCategorySlug === null) {
    //       fetchArticlesForCategory(null);
    //    }
    // }, [articles.length, isLoading, error, selectedCategorySlug, fetchArticlesForCategory]);


    // const selectedTabName = tabsToRender.find(tab => tab.slug === selectedCategorySlug)?.name || 'Home';

    return (
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 items-center"> {/* Use items-center */}
                {/* Visible Tabs */}
                {visibleTabs.map(tab => renderTab(tab, false))}

                {/* "More" Dropdown */}
                {dropdownTabs.length > 0 && (
                    <Menu as="div" className="relative inline-block text-left py-3"> {/* Add padding to align */}
                        <div>
                            <Menu.Button className={`inline-flex items-center justify-center rounded-sm px-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                                ${isActiveTabInDropdown ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}
                             `}>
                                <span>More</span>
                                <ChevronDownIcon className={`ml-1 h-4 w-4 ${isActiveTabInDropdown ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} aria-hidden="true" />
                            </Menu.Button>
                        </div>

                        <Transition
                            as={React.Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto">
                                <div className="py-1">
                                    {dropdownTabs.map(tab => renderTab(tab, true))}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                )}
            </nav>
        </div>
    );
}
