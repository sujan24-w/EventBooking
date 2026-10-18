/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://eventbooking-pq7r.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;