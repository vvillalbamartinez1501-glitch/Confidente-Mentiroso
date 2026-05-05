/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'pixabay.com' },
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'media.giphy.com' },
      { protocol: 'https', hostname: 'media0.giphy.com' },
      { protocol: 'https', hostname: 'media1.giphy.com' },
      { protocol: 'https', hostname: 'media2.giphy.com' },
      { protocol: 'https', hostname: 'media3.giphy.com' },
      { protocol: 'https', hostname: 'media4.giphy.com' },
    ],
  },
};

export default nextConfig;
