import React from "react"

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
	src: string
}

export default function Image({ src, ...props }: ImageProps) {
	const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

	// Only prepend basePath for local images (not external URLs)
	if (!src.startsWith("http")) {
		src = `${basePath}${src.startsWith("/") ? src : "/" + src}`
	}

	return <img src={src} {...props} />
}
