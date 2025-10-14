import type { NextConfig } from "next"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true"

const nextConfig: NextConfig = {
	output: isStaticExport ? "export" : undefined,
	basePath,
	images: {
		unoptimized: isStaticExport,
		loader: basePath ? "custom" : undefined,
		loaderFile: basePath ? "./lib/image-loader.ts" : undefined,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "clan.fastly.steamstatic.com",
				pathname: "/images/**",
			},
		],
	},
}

export default nextConfig
