/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            new URL('https://github.com/**'),
        ]
    }
};

export default nextConfig;
