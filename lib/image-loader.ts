export default function imageLoader({ src }: { src: string }) {
	const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

	// Only prepend basePath for local images (not external URLs)
	if (!src.startsWith("http")) {
		src = `${basePath}${src.startsWith("/") ? src : "/" + src}`
	}

	return src
}
