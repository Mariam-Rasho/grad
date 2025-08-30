import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'Mariam-Rasho'; // Your repository name

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  // images: {
  //   unoptimized: true, // Disable default image optimization
  // },

  // assetPrefix: isProd ? 'https://Mariam-Rasho' : '',
  // basePath: isProd ? '/Mariam-Rasho' : '',
  // output: 'export'

    images: {
    unoptimized: true,
  },
  // Remove or fix assetPrefix if it's causing issues
  assetPrefix: isProd ? `/${repoName}/` : '',
  basePath: isProd ? `/${repoName}` : '',
  output: 'export',
  // Add trailing slash for GitHub Pages compatibility
  trailingSlash: true,
};

export default nextConfig;
