import NextImage, { ImageProps as NextImageProps } from "next/image"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

interface CustomImageProps extends Omit<NextImageProps, "src"> {
	src: string
}

export default function Image({ src, ...props }: CustomImageProps) {
	// Only prepend basePath for local images (not external URLs)
	if (!src.startsWith("http")) {
		src = `${basePath}${src.startsWith("/") ? src : "/" + src}`
	}

	return <NextImage src={src} {...props} />
}
