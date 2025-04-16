export default function AdCardPlaceholder() {
    return (
        // Use similar outer structure and styling as the article card's inner div
        <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
            {/* Image Area Placeholder */}
            <div className="relative w-full aspect-[5/3] bg-gray-300"> {/* Match aspect ratio */}
                {/* "AD" Label */}
                <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] font-semibold px-1 rounded-sm leading-tight">
                    AD
                </span>
                {/* Optional: Add a generic placeholder icon/text */}
                 <div className="absolute inset-0 flex items-center justify-center">
                     <span className='text-gray-500 text-sm italic'>Advertisement</span>
                 </div>
            </div>

            {/* Text Area Placeholder (Mimic spacing but keep simple) */}
            <div className="p-3 flex flex-col flex-grow">
                 {/* Placeholder for Ad Title/Text */}
                 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                 {/* Add more placeholder lines if needed */}
            </div>
        </div>
    );
}
