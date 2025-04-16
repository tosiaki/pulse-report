'use client'; // Needs client-side interaction for window.location

import {
    FacebookShareButton, FacebookIcon,
    TwitterShareButton, XIcon, // Using XIcon for Twitter
    LinkedinShareButton, LinkedinIcon,
    EmailShareButton, EmailIcon,
    RedditShareButton, RedditIcon,
    WhatsappShareButton, WhatsappIcon,
} from 'react-share';

interface SocialShareButtonsProps {
    url: string; // The canonical URL of the article to share
    title: string; // The title of the article
    // Optional: Add summary/via/hashtags if needed by specific platforms
    // summary?: string;
    // via?: string; // e.g., Twitter handle
    // hashtags?: string[];
}

export default function SocialShareButtons({ url, title }: SocialShareButtonsProps) {
    const iconSize = 32; // Size for the icons
    const iconProps = {
        size: iconSize,
        round: true, // Use round icons
    };

    return (
        <div className="flex items-center space-x-2 my-4"> {/* Add margin and spacing */}
            <span className="text-sm font-medium text-gray-600 mr-2">Share:</span>

            <FacebookShareButton url={url} title={title} /* hashtag="#example" */ >
                <FacebookIcon {...iconProps} />
            </FacebookShareButton>

            <TwitterShareButton url={url} title={title} /* via="YourTwitterHandle" hashtags={['news', 'article']} */ >
                <XIcon {...iconProps} />
            </TwitterShareButton>

            <LinkedinShareButton url={url} title={title} /* summary={summary} source="Pulse Report" */ >
                <LinkedinIcon {...iconProps} />
            </LinkedinShareButton>

             <RedditShareButton url={url} title={title} >
                 <RedditIcon {...iconProps} />
             </RedditShareButton>

            <WhatsappShareButton url={url} title={title} separator=":: ">
                <WhatsappIcon {...iconProps} />
            </WhatsappShareButton>

            <EmailShareButton url={url} subject={title} body={`Check out this article: ${url}`}>
                <EmailIcon {...iconProps} />
            </EmailShareButton>

            {/* Add more buttons as needed (Pinterest, Telegram, etc.) */}
        </div>
    );
}
