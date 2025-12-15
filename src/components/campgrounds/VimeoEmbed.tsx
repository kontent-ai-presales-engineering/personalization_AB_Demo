import React from 'react';

type VimeoEmbedProps = {
  videoId: string;
  title?: string;
};

/**
 * Vimeo Embed Component
 * 
 * Embeds a Vimeo video using the video ID.
 * The video ID can come from:
 * - Custom element value (just the ID: "183941852")
 * - URL format (extracted from URL: "https://vimeo.com/183941852")
 * 
 * Maintenance: Low maintenance - Standard Vimeo iframe embed
 */
const VimeoEmbed: React.FC<VimeoEmbedProps> = ({ videoId, title }) => {
  // Extract video ID from various formats
  const extractVideoId = (input: string): string | null => {
    if (!input) return null;
    
    // If it's already just a number/ID, return it
    if (/^\d+$/.test(input.trim())) {
      return input.trim();
    }
    
    // Extract from URL patterns:
    // https://vimeo.com/183941852
    // https://player.vimeo.com/video/183941852
    // https://vimeo.com/channels/staffpicks/183941852
    const urlPatterns = [
      /vimeo\.com\/(?:channels\/[^\/]+\/|groups\/[^\/]+\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/i,
      /player\.vimeo\.com\/video\/(\d+)/i,
    ];
    
    for (const pattern of urlPatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  const cleanVideoId = extractVideoId(videoId);
  
  if (!cleanVideoId) {
    console.warn('Invalid Vimeo video ID:', videoId);
    return null;
  }

  const embedUrl = `https://player.vimeo.com/video/${cleanVideoId}`;

  return (
    <div className="w-full my-8">
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={embedUrl}
          title={title || 'Vimeo video'}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          style={{ border: 0 }}
        />
      </div>
    </div>
  );
};

export default VimeoEmbed;

