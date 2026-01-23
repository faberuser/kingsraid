import type { NextConfig } from "next"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true"

const nextConfig: NextConfig = {
	output: isStaticExport ? "export" : undefined,
	basePath: basePath || undefined,
	images: {
		unoptimized: isStaticExport,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*.steamstatic.com",
				pathname: "/images/**",
			},
		],
	},
	...(isStaticExport && {
		// Exclude API routes from static export
		exportPathMap: async function (defaultPathMap) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { "/api/list-model-files": _, ...pathMap } = defaultPathMap
			return pathMap
		},
	}),
}

export default nextConfig
