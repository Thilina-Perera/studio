import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: 'www.ecu.edu.lk',
        port: '',
        pathname: '/**'
      },
       {
        protocol: 'https',
        hostname: 'happay.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'sdmntpraustraliaeast.oaiusercontent.com',
        port: '',
        pathname: '/**'
      }
    ],
  },
};

export default nextConfig;
