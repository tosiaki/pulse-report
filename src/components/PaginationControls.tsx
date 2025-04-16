import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'; // Using Heroicons for arrows

interface PaginationControlsProps {
  currentPage: number;
  hasNextPage: boolean;
  basePath?: string;
}

export default function PaginationControls({
  currentPage,
  hasNextPage,
  basePath = '',
}: PaginationControlsProps) {

  const hasPreviousPage = currentPage > 1;
  // hasNextPage logic now uses the prop directly

  const getPageHref = (pageNumber: number): string => {
    const targetPage = Math.max(1, pageNumber);
    if (targetPage <= 1) {
      return basePath || '/';
    }
    return `${basePath}?page=${targetPage}`;
  };

   if (currentPage <= 1 && !hasNextPage) {
      return null;
   }

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-8 pt-4">
      {/* Previous Button */}
      <div className="-mt-px flex w-0 flex-1">
        {hasPreviousPage ? (
          <Link href={getPageHref(currentPage - 1)} className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
            <ChevronLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" /> Previous
          </Link>
        ) : (
          <span className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-400 cursor-not-allowed" aria-disabled="true">
            <ChevronLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" /> Previous
          </span>
        )}
      </div>

      {/* Next Button */}
      <div className="-mt-px flex w-0 flex-1 justify-end">
        {hasNextPage ? ( // Use the hasNextPage prop
          <Link href={getPageHref(currentPage + 1)} className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
            Next <ChevronRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
          </Link>
        ) : (
          <span className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-400 cursor-not-allowed" aria-disabled="true">
            Next <ChevronRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
