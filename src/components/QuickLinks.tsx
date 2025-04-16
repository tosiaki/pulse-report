// Placeholder Icon Component (Replace with actual icons later)
const PlaceholderIcon = ({ label }: { label: string }) => (
    <div className="w-10 h-10 mb-1 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xl font-bold">
        {label.charAt(0)} {/* Display first letter as placeholder */}
    </div>
);

// Data for the quick links
const links = [
    { label: 'Amazon', href: 'https://www.amazon.com', iconLabel: 'A' },
    { label: 'TurboTax', href: 'https://turbotax.intuit.com', iconLabel: 'T' },
    { label: 'Credit Karma', href: 'https://www.creditkarma.com', iconLabel: 'C' },
    { label: 'QuickBooks', href: 'https://quickbooks.intuit.com', iconLabel: 'Q' },
    { label: 'Walmart', href: 'https://www.walmart.com', iconLabel: 'W' },
];

export default function QuickLinks() {
    return (
        <section className="py-4 bg-gray-50"> {/* Match surrounding background */}
            <div className="flex flex-wrap justify-center items-start gap-x-6 gap-y-4 md:gap-x-10 px-4">
                {links.map((link) => (
                    // Using <a> tag directly as these are external links
                    <a
                        key={link.label}
                        href={link.href}
                        target="_blank" // Open external links in a new tab
                        rel="noopener noreferrer" // Security best practice for target="_blank"
                        className="flex flex-col items-center text-center w-16 group" // Fixed width for alignment
                    >
                        {/* Icon Placeholder */}
                        <PlaceholderIcon label={link.iconLabel} />

                        {/* Label */}
                        <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 group-hover:underline mt-1">
                            {link.label}
                        </span>
                    </a>
                ))}
            </div>
        </section>
    );
}
