import Image from "next/image"
import { useRouter } from "next/navigation"

export default function HeroCard({ name, splashart }: { name: string; splashart: string }) {
	const router = useRouter()

	const handleClick = () => {
		router.push(`/heroes/${encodeURIComponent(name.toLowerCase())}`)
	}

	return (
		<div
			className="border rounded w-48 h-64 flex flex-col relative cursor-pointer overflow-hidden"
			onClick={handleClick}
		>
			<Image
				src={"/assets/" + splashart}
				alt={name}
				width="0"
				height="0"
				sizes="100vw"
				className="w-full flex-1 object-cover object-right hover:scale-110 transition-transform duration-300"
			/>
			<div className="text-xl font-bold w-full text-center absolute bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent text-white py-2">
				{name}
			</div>
		</div>
	)
}
