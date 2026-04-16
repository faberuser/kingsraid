import NextImage, { ImageProps as NextImageProps } from "next/image"
import { forwardRef } from "react"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

interface CustomImageProps extends Omit<NextImageProps, "src"> {
	src: string
}

const Image = forwardRef<HTMLImageElement, CustomImageProps>(function Image({ src, ...props }, ref) {
	// Only prepend basePath for local images (not external URLs)
	if (!src.startsWith("http")) {
		src = `${basePath}${src.startsWith("/") ? src : "/" + src}`
	}

	return <NextImage ref={ref} src={src} {...props} />
})

export default Image
