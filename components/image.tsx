import React from "react"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
	src: string
}

export default function Image({ src, ...props }: ImageProps) {
	// Only prepend basePath for local images (not external URLs or data URLs)
	if (!src.startsWith("http") && !src.startsWith("data:")) {
		src = `${basePath}${src.startsWith("/") ? src : "/" + src}`
	}

	return <img src={src} {...props} />
}
