/* eslint-disable jsx-a11y/alt-text */

import Image from "next/image"
import { useReducer } from "react"

/**
 * This component is a drop-in replacement for next/image that shows a placeholder image while the image is loading.
 *
 * *GitHub Issue: Placeholder of next/image is still visible after the image is loaded*\
 * https://github.com/vercel/next.js/issues/53329
 */

export const LoadingImage: React.FC<LoadingImageProps> = ({ blurDataURL, ...props }) => {
	const [isLoading, stopLoading] = useReducer((_, ev) => (props.onLoad?.(ev), false), true)

	const blurProps = blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {}

	return (
		<>
			{isLoading && blurDataURL && <Image {...props} {...blurProps} />}
			<Image
				{...props}
				{...blurProps}
				className={`${props.className} ${isLoading && "absolute invisible"}`}
				onLoad={stopLoading}
			/>
		</>
	)
}

export type NextImageProps = Parameters<typeof Image>[0]

export interface LoadingImageProps extends NextImageProps {
	blurDataURL?: string
}
