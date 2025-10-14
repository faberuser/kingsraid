import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	output: "export",
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
