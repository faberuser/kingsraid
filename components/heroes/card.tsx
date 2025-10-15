import Image from "@/components/next-image"
import Link from "next/link"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"

export default function HeroCard({
	name,
	splashart,
	reverseSA = false,
}: {
	name: string
	splashart: string
	reverseSA: boolean
}) {
	const [isLoading, setIsLoading] = useState(false)

	const handleClick = () => {
		if (isLoading) return // Prevent multiple clicks
		setIsLoading(true)
	}

	return (
		<Link
			key={name}
			className="border rounded w-40 h-56 sm:w-48 sm:h-64 flex flex-col relative cursor-pointer overflow-hidden"
			href={`/heroes/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"))}`}
			onClick={handleClick}
		>
			<Image
				src={"/kingsraid-data/assets/" + splashart}
				alt={name}
				width="0"
				height="0"
				sizes="40vw md:20vw"
				className={`w-full flex-1 object-cover ${
					reverseSA ? "object-left" : "object-right"
				} hover:scale-110 transition-transform duration-300`}
			/>
			<div className="text-xl font-bold w-full text-center absolute bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent text-white py-2">
				{name}
			</div>
			{isLoading && (
				<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
					<Spinner className="size-8" />
				</div>
			)}
		</Link>
	)
}
