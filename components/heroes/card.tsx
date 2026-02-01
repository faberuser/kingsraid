import Image from "@/components/next-image"
import Link from "next/link"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"

export type ViewMode = "splashart" | "icon"

export default function HeroCard({
	name,
	splashart,
	reverseSA = false,
	viewMode = "splashart",
}: {
	name: string
	splashart: string
	reverseSA: boolean
	viewMode?: ViewMode
}) {
	const [isLoading, setIsLoading] = useState(false)

	const handleClick = () => {
		if (isLoading) return // Prevent multiple clicks
		setIsLoading(true)
	}

	// Derive icon path from splashart path (replace sa.png with ico.png)
	const iconPath = splashart.replace(/sa\.png$/, "ico.png")
	const imagePath = viewMode === "icon" ? iconPath : splashart

	const isIconView = viewMode === "icon"

	return (
		<Link
			key={name}
			className={`border rounded flex flex-col relative cursor-pointer overflow-hidden ${
				isIconView ? "w-24 h-24 sm:w-28 sm:h-28" : "w-40 h-56 sm:w-48 sm:h-64"
			}`}
			href={`/heroes/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"))}`}
			onClick={handleClick}
		>
			<Image
				src={"/kingsraid-data/assets/" + imagePath}
				alt={name}
				width="0"
				height="0"
				sizes="40vw md:20vw"
				className={`w-full flex-1 object-cover ${
					isIconView ? "object-center" : reverseSA ? "object-left" : "object-right"
				} hover:scale-110 transition-transform duration-300`}
			/>
			<div
				className={`font-bold w-full text-center absolute bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white ${
					isIconView ? "text-xs h-6 py-1" : "text-xl h-12 py-2"
				}`}
			>
				{name}
			</div>
			{isLoading && (
				<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
					<Spinner className={isIconView ? "size-4" : "size-8"} />
				</div>
			)}
		</Link>
	)
}
