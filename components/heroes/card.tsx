"use client"

import Image from "@/components/next-image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useCallback, startTransition } from "react"
import { Spinner } from "@/components/ui/spinner"

export type ViewMode = "splashart" | "icon"

export default function HeroCard({
	name,
	splashart,
	reverseSA = false,
	viewMode = "splashart",
	blurDataURLMap = {},
}: {
	name: string
	splashart: string
	reverseSA: boolean
	viewMode?: ViewMode
	blurDataURLMap?: Record<string, string>
}) {
	const [loading, setLoading] = useState(false)
	const [imageLoaded, setImageLoaded] = useState(false)
	const pathname = usePathname()

	// Reset spinner if navigation is cancelled or we return to the same page
	useEffect(() => {
		startTransition(() => setLoading(false))
	}, [pathname])

	// Callback ref — fires the instant the <img> DOM node is attached.
	// If the image already loaded from cache before React hydrated,
	// onLoad won't fire, so we catch it here immediately.
	const imgRefCallback = useCallback((node: HTMLImageElement | null) => {
		if (node?.complete && node.naturalWidth > 0) {
			setImageLoaded(true)
		}
	}, [])

	// Derive icon path from splashart path (replace sa.png with ico.png)
	const iconPath = splashart.replace(/sa\.png$/, "ico.png")
	const imagePath = viewMode === "icon" ? iconPath : splashart
	const imageKey = `/kingsraid-data/assets/${imagePath}`
	const blurDataURL = blurDataURLMap[imageKey]

	const isIconView = viewMode === "icon"

	return (
		<Link
			key={name}
			className={`border rounded flex flex-col relative cursor-pointer overflow-hidden ${
				isIconView ? "w-24 h-24 sm:w-28 sm:h-28" : "w-40 h-56 sm:w-48 sm:h-64"
			}`}
			href={`/heroes/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"))}`}
			onClick={() => setLoading(true)}
		>
			{/* Blur placeholder layer — sits behind the real image and is naturally
			    covered as the real image fades in */}
			{blurDataURL && !imageLoaded && (
				<div className="absolute inset-0 overflow-hidden">
					<div
						className="absolute inset-0 scale-110"
						style={{
							backgroundImage: `url(${blurDataURL})`,
							backgroundSize: "cover",
							backgroundPosition: isIconView ? "center" : reverseSA ? "left" : "right",
							filter: "blur(24px)",
						}}
					/>
				</div>
			)}
			<Image
				ref={imgRefCallback}
				src={"/kingsraid-data/assets/" + imagePath}
				alt={name}
				width="0"
				height="0"
				sizes={isIconView ? "(min-width: 640px) 112px, 96px" : "(min-width: 640px) 512px, 160px"}
				className={`w-full flex-1 object-cover ${
					isIconView ? "object-center" : reverseSA ? "object-left" : "object-right"
				} hover:scale-110 transition-all duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
				onLoad={() => setImageLoaded(true)}
			/>
			<div
				className={`font-bold w-full text-center absolute bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white ${
					isIconView ? "text-xs h-6 py-1" : "text-xl h-12 py-2"
				}`}
			>
				{name}
			</div>
			{loading && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
					<Spinner className="h-6 w-6 text-white" />
				</div>
			)}
		</Link>
	)
}
