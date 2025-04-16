import Link from 'next/link';
import Container from './Container'; // Assuming you have this

export default function Header() {
  return (
    // Keeping minimal style: white background, small shadow, sticky
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <Container>
        {/* Use flex to align items, justify-start ensures it stays left */}
        <div className="flex items-center justify-start h-16">

          {/* Logo and Site Name Link */}
          <Link href="/" className="flex items-center space-x-2 group" aria-label="Pulse Report Homepage">
              {/* Simple SVG Pulse Icon Placeholder */}
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  // Use accent color (adjust if your theme color changes)
                  className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors"
                  aria-hidden="true" // Hide decorative icon from screen readers
              >
                  <path
                      fillRule="evenodd"
                      // Simple _/\_ pulse shape path data
                      d="M3 12H5.379L6.939 9.879C7.525 9.045 8.775 9.045 9.361 9.879L11 12.138L13.121 7.879C13.707 7.045 14.957 7.045 15.543 7.879L17 10H21V12H17.621L16.061 14.121C15.475 14.955 14.225 14.955 13.639 14.121L12 11.862L9.879 16.121C9.293 16.955 8.043 16.955 7.457 16.121L6 14H3V12Z"
                      clipRule="evenodd"
                   />
               </svg>

              {/* Site Name Text */}
              <span className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                  Pulse<span className="font-semibold text-blue-600">Report</span> {/* Example: Accent on Report */}
                  {/* Or just: Pulse Report */}
              </span>
          </Link>

          {/* Removed Navigation and Search placeholders from here */}

        </div>
      </Container>
    </header>
  );
}
