import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Post images are served from Supabase's public Storage bucket
    // (docs/admin/api-contract.md fileUrl examples:
    // https://<project>.supabase.co/storage/v1/object/public/...).
    // Scoped to the storage object path rather than the whole domain.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
