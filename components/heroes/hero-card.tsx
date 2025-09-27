import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function HeroCard({ name, splashart }: { name: string; splashart: string }) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	const handleClick = () => {
		if (isLoading) return // Prevent multiple clicks
		setIsLoading(true)
		router.push(`/heroes/${encodeURIComponent(name.toLowerCase())}`)
	}

	return (
		<Link
			key={name}
			className="border rounded w-48 h-64 flex flex-col relative cursor-pointer overflow-hidden"
			href={`/heroes/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"))}`}
		>
			<Image
				src={"/assets/" + splashart}
				alt={name}
				width="0"
				height="0"
				sizes="20vw"
				className="w-full flex-1 object-cover object-right hover:scale-110 transition-transform duration-300"
			/>
			<div className="text-xl font-bold w-full text-center absolute bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent text-white py-2">
				{name}
			</div>
			{isLoading && (
				<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
					<div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
				</div>
			)}
		</Link>
	)
}
