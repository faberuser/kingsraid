"use client"

import Image from "next/image"
import { useState, useMemo } from "react"
import Fuse from "fuse.js"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { HeroData } from "@/model/Hero"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import saReverse from "@/kingsraid-data/sa_reverse.json"
import HeroCard from "@/components/heroes/card"

interface HeroesClientProps {
	heroes: HeroData[]
	heroClasses: Array<{
		value: string
		name: string
		icon: string
	}>
}

export default function HeroesClient({ heroes, heroClasses }: HeroesClientProps) {
	const [selectedClass, setSelectedClass] = useState("all")
	const [searchQuery, setSearchQuery] = useState("")
	const [isLoading, setIsLoading] = useState(false)

	// Configure Fuse.js for fuzzy search
	const fuse = useMemo(() => {
		return new Fuse(heroes, {
			keys: ["infos.name", "infos.title", "aliases"],
			threshold: 0.3,
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
					<HeroCard key={hero.infos.name} name={hero.infos.name} splashart={hero.splashart} />
				))}
			</div>

			{/* No results message */}
			{filteredHeroes.length === 0 && (
				<div className="text-center text-muted-foreground mt-8">No heroes found matching your criteria.</div>
			)}
		</div>
	)
}
