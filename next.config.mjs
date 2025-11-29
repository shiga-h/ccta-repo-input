/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages用の設定
  output: 'export',
  basePath: '/ccta-repo-input',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

