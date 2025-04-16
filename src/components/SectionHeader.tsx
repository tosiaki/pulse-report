import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  slug?: string; // Make slug optional
}

export default function SectionHeader({ title, slug }: SectionHeaderProps) {
  const headerContent = (
    <h2 className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200 inline-block">
      {title}
    </h2>
  );

  if (slug) {
    return (
      <div className="mb-4 pb-2 border-b-2 border-blue-500 inline-block"> {/* Add underline style */}
        <Link href={`/category/${slug}`}>
          {headerContent}
          {/* Optional: Add a 'See More ->' link */}
          <span className="text-sm text-blue-600 font-semibold ml-3 hover:underline">See More →</span>
        </Link>
      </div>
    );
  } else {
    // Render without link if no slug provided
    return (
       <div className="mb-4 pb-2 border-b-2 border-blue-500 inline-block">
          {headerContent}
       </div>
    );
  }
}
