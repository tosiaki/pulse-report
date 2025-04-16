import { type MetadataRoute } from 'next';

// Use a default export
export default function robots(): MetadataRoute.Robots {
    // Rely on environment variable for site URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; // Provide a fallback
    const baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;

    // Define rules (using single object or array as needed)
    const rules: MetadataRoute.Robots['rules'] = {
            userAgent: '*',
            allow: '/',
            // disallow: ['/admin/', '/private/'],
    };

    // Return the object directly
    return {
        rules: rules,
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
