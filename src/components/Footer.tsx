import Link from 'next/link';
import Container from './Container';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-12 py-8"> {/* Basic styling */}
      <Container>
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-6 text-center md:text-left">
	<div className="text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Pulse Report. All rights reserved.</p>
          <div className="mt-2 space-x-4">
     <Link href="/pages/about-us" className="hover:underline">About Us</Link>
     <Link href="/pages/privacy-policy" className="hover:underline">Privacy Policy</Link>
+    <Link href="/pages/terms-of-service" className="hover:underline">Terms of Service</Link>
     <Link href="/pages/contact-us" className="hover:underline">Contact Us</Link>
            {/* Add Contact Us later if needed */}
            {/* <Link href="/pages/contact-us" className="hover:underline">Contact Us</Link> */}
          </div>
        </div>

            <div className="w-full max-w-sm"> {/* Constrain width of form */}
                 <NewsletterForm />
            </div>
    </div>
      </Container>
    </footer>
  );
}
