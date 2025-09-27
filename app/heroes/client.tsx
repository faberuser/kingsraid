"use client"

import Image from "next/image"
import { useState, useMemo } from "react"
import Fuse from "fuse.js"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Hero } from "@/model/Hero"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
// Add import for the reverse list
import saReverse from "@/kingsraid-data/sa_reverse.json"

interface HeroesClientProps {
	heroes: Hero[]
	heroClasses: Array<{
		value: string
		name: string
		icon: string
	}>
}

export default function HeroesClient({ heroes, heroClasses }: HeroesClientProps) {
	const [selectedClass, setSelectedClass] = useState("all")
	const [searchQuery, setSearchQuery] = useState("")

	// Configure Fuse.js for fuzzy search
	const fuse = useMemo(() => {
		return new Fuse(heroes, {
			keys: ["name", "aliases", "infos.class"],
			threshold: 0.3, // Adjust this value (0.0 = exact match, 1.0 = very loose)
			includeScore: true,
		})
	}, [heroes])

	// Filter heroes by search query and class
	const filteredHeroes = useMemo(() => {
		let result = heroes

		// Apply search filter
		if (searchQuery.trim()) {
			const searchResults = fuse.search(searchQuery)
			result = searchResults.map((item) => item.item)
		}

		// Apply class filter
		if (selectedClass !== "all") {
			result = result.filter((hero) => hero.infos?.class?.toLowerCase() === selectedClass.toLowerCase())
		}

		return result
	}, [heroes, searchQuery, selectedClass, fuse])

	return (
		<div className="p-0 pt-5 sm:p-10">
			<div className="flex flex-col text-start space-y-4 px-4 sm:px-10">
				{/* Back Button */}
				<div className="mb-2">
					<Link href="/">
						<Button variant="ghost" className="gap-2 has-[>svg]:px-0 p-0">
							<ArrowLeft className="h-4 w-4" />
							Back to Home
						</Button>
					</Link>
				</div>

				<div className="flex flex-row gap-4 items-baseline">
					<div className="text-xl font-bold">Heroes</div>
					<div className="text-muted-foreground text-sm">Showing {filteredHeroes.length} heroes</div>
				</div>

				<Separator />

				<div className="flex flex-col items-start xl:flex-row xl:items-center gap-4">
					{/* Search Input */}
					<div className="w-full max-w-sm">
						<Input
							type="text"
							placeholder="Search for heroes..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full"
						/>
					</div>

					{/* Class Filter */}
					<div>
						<RadioGroup
							value={selectedClass}
							onValueChange={setSelectedClass}
							className="flex flex-row space-x-1"
						>
							{heroClasses.map((heroClass) => (
								<label
									key={heroClass.value}
									htmlFor={heroClass.value}
									className="flex items-center space-x-2 cursor-pointer"
								>
									<RadioGroupItem value={heroClass.value} id={heroClass.value} />
									{heroClass.value !== "all" ? (
										<Image
											src={heroClass.icon}
											alt={heroClass.name}
											width={24}
											height={24}
											className="inline"
										/>
									) : (
										<div className="w-4 h-4 flex items-center justify-center text-xs font-bold">
											All
										</div>
									)}
								</label>
							))}
						</RadioGroup>
					</div>
				</div>
			</div>

			<div className="flex flex-row gap-4 flex-wrap w-full justify-center mt-4">
				{filteredHeroes.map((hero) => (
					<Link
						key={hero.name}
						className="border rounded w-48 h-64 flex flex-col relative cursor-pointer overflow-hidden"
						href={`/heroes/${encodeURIComponent(hero.name.toLowerCase().replace(/\s+/g, "-"))}`}
					>
						<Image
							src={"/assets/" + hero.splashart}
							alt={hero.name}
							width="0"
							height="0"
							sizes="40vw md:20vw"
							className={`w-full flex-1 object-cover ${
								saReverse.includes(hero.name) ? "object-left" : "object-right"
							} hover:scale-110 transition-transform duration-300`}
						/>
						<div className="text-xl font-bold w-full text-center absolute bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent text-white py-2">
							{hero.name}
						</div>
					</Link>
				))}
			</div>

			{/* No results message */}
			{filteredHeroes.length === 0 && (
				<div className="text-center text-muted-foreground mt-8">No heroes found matching your criteria.</div>
			)}
		</div>
	)
}
