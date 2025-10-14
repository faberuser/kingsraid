import type { NextConfig } from "next"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || ""

const nextConfig: NextConfig = {
	output: "export",
	basePath,
	assetPrefix,
	images: {
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
