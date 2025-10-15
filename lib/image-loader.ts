export default function imageLoader({ src }: { src: string }) {
	// Check if we're building for static export (GitHub Pages)
	const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true"
	const basePath = isStaticExport ? "/kingsraid" : ""

	// If it's an external URL, return as-is
	if (src.startsWith("http://") || src.startsWith("https://")) {
		return src
	}

	// Prepend basePath for local images (only if basePath is set)
	if (basePath) {
		return `${basePath}${src.startsWith("/") ? src : "/" + src}`
	}

	return src
}
