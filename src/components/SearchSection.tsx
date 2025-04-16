'use client'; // Needed for useState and event handlers

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; // Use App Router's router
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

export default function SearchSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter(); // Get router instance

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    if (searchTerm.trim()) {
      // Redirect to Bing search results page (can change to Yahoo or others)
      const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(searchTerm.trim())}`;
       // Use router.push for client-side navigation (or window.location.href for full redirect)
       // window.location.href = searchUrl; // Option 1: Full page redirect
       router.push(searchUrl); // Option 2: Attempts client-side (might still redirect fully externally)
    }
  };

  return (
    <section className="py-4 bg-gray-50"> {/* Match body background or adjust */}
      <div className="flex justify-center">
        <form
          onSubmit={handleSearch}
          className="relative flex items-center w-full max-w-xl" // Max width for the search bar
        >
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Find more news"
            className="w-full rounded-full border border-gray-300 py-2 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            aria-label="Search News"
          />
          {/* Search Icon inside the input */}
          <div className="absolute left-0 inset-y-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          {/* Hidden submit button for accessibility/form submission */}
          <button type="submit" className="sr-only">
             Search
          </button>
        </form>
      </div>
    </section>
  );
}
