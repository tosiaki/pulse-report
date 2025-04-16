import ReactMarkdown from 'react-markdown';
// Optional: Add plugins for enhanced markdown (e.g., remark-gfm for tables, etc.)
// import remarkGfm from 'remark-gfm';

export default function ArticleBody({ content }: { content: string }) {
  if (!content) {
    return <p>Article content is not available.</p>;
  }

  return (
    // Apply Tailwind typography styles for nice default markdown rendering
    // Adjust modifiers like prose-lg, prose-invert (for dark mode) as needed
    <div className="prose prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown
        // components={{ // Optional: Override default rendering for specific tags
        //   // Example: Render images using Next/Image
        //   // img: ({node, ...props}) => {
        //   //   const imageUrl = getStrapiMediaUrl(props.src); // Assuming relative URLs from CMS
        //   //   return imageUrl ? <Image src={imageUrl} alt={props.alt || ''} width={700} height={400} className="rounded-md" /> : null;
        //   // },
        // }}
        // remarkPlugins={[remarkGfm]} // Add plugins here if needed
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
