"use client"

import Image from "@/components/next-image"
import { useState, useEffect, useMemo } from "react"
import Fuse from "fuse.js"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { HeroData } from "@/model/Hero"
import { Button } from "@/components/ui/button"
import { Search, ChevronDown, ChevronUp } from "lucide-react"
import HeroCard from "@/components/heroes/card"

interface HeroesClientProps {
	heroes: HeroData[]
	heroClasses: Array<{
		value: string
		name: string
		icon: string
	}>
	releaseOrder: Record<string, string>
	saReverse: string[]
}

export default function HeroesClient({ heroes, heroClasses, releaseOrder, saReverse }: HeroesClientProps) {
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedClass, setSelectedClass] = useState("all")
	const [selectedDamageType, setSelectedDamageType] = useState("all")
	const [sortType, setSortType] = useState<"alphabetical" | "release">(
		typeof window !== "undefined"
			? (localStorage.getItem("heroesSortType") as "alphabetical" | "release") || "release"
			: "release"
	)
	const [reverseSort, setReverseSort] = useState(
		typeof window !== "undefined"
			? localStorage.getItem("heroesReverseSort") === null
				? true
				: localStorage.getItem("heroesReverseSort") === "true"
			: true
	)

	// Save sort state to localStorage when changed
	useEffect(() => {
		localStorage.setItem("heroesSortType", sortType)
		localStorage.setItem("heroesReverseSort", reverseSort.toString())
	}, [sortType, reverseSort])

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

		// Apply damage type filter
		if (selectedDamageType !== "all") {
			result = result.filter(
				(hero) => hero.infos?.["damage type"]?.toLowerCase() === selectedDamageType.toLowerCase()
			)
		}

		// Sort by selected sort type
		if (sortType === "release") {
			result = [...result].sort((a, b) => {
				const aOrder = parseInt(releaseOrder[a.infos.name] ?? "9999", 10)
				const bOrder = parseInt(releaseOrder[b.infos.name] ?? "9999", 10)
				return aOrder - bOrder
			})
		} else {
			result = [...result].sort((a, b) => a.infos.name.localeCompare(b.infos.name))
		}

		// Reverse if needed
		if (reverseSort) {
			result = result.reverse()
		}

		return result
	}, [heroes, searchQuery, fuse, selectedClass, selectedDamageType, sortType, reverseSort, releaseOrder])

	const damageTypes = [
		{ value: "all", name: "All" },
		{ value: "magical", name: "Magical" },
		{ value: "physical", name: "Physical" },
	]

	return (
		<div>
			<div className="space-y-4 mb-4">
				<div className="flex flex-row justify-between items-center">
					<div className="flex flex-row gap-2 items-baseline">
						<div className="text-xl font-bold">Heroes</div>
						<div className="text-muted-foreground text-sm">Showing {filteredHeroes.length} heroes</div>
					</div>
					<div className="flex flex-row">
						{/* Alphabetical Sort */}
						<Button
							variant={`${sortType === "alphabetical" ? "outline" : "ghost"}`}
							onClick={() => {
								if (sortType === "alphabetical") {
									setReverseSort(!reverseSort)
								} else {
									setSortType("alphabetical")
									setReverseSort(false)
								}
							}}
						>
							{sortType === "alphabetical" && reverseSort && <ChevronDown />}
							{sortType === "alphabetical" && !reverseSort && <ChevronUp />}
							{sortType === "alphabetical" && reverseSort ? "Z → A" : "A → Z"}
						</Button>

						{/* Release Sort */}
						<Button
							variant={`${sortType === "release" ? "outline" : "ghost"}`}
							onClick={() => {
								if (sortType === "release") {
									setReverseSort(!reverseSort)
								} else {
									setSortType("release")
									setReverseSort(true)
								}
							}}
						>
							{sortType === "release" && reverseSort && <ChevronUp />}
							{sortType === "release" && !reverseSort && <ChevronDown />}
							Release
						</Button>
					</div>
				</div>

				<Separator />

				<div className="flex flex-col items-center xl:flex-row gap-4">
					{/* Search Input */}
					<div className="w-full max-w-sm relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
							<Search className="h-4 w-4" />
						</span>
						<Input
							type="text"
							placeholder="Search for heroes..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10"
						/>
					</div>

					{/* Class Filter */}
					<div>
						<RadioGroup
							value={selectedClass}
							onValueChange={setSelectedClass}
							className="flex flex-row space-x-1 md:space-x-2"
						>
							{heroClasses.map((heroClass) => (
								<label
									key={heroClass.value}
									htmlFor={heroClass.value}
									className="flex items-center space-x-1 md:space-x-2 cursor-pointer"
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

					{/* Damage Type Filter */}
					<div>
						<RadioGroup
							value={selectedDamageType}
							onValueChange={setSelectedDamageType}
							className="flex flex-row space-x-1 md:space-x-2"
						>
							{damageTypes.map((damageType) => (
								<label
									key={damageType.value}
									htmlFor={`dmg-${damageType.value}`}
									className="flex items-center space-x-1 md:space-x-2 cursor-pointer"
								>
									<RadioGroupItem value={damageType.value} id={`dmg-${damageType.value}`} />
									<span className="text-sm">{damageType.name}</span>
								</label>
							))}
						</RadioGroup>
					</div>
				</div>
			</div>

			<div className="flex flex-row gap-2 sm:gap-4 flex-wrap w-full justify-center mt-4">
				{filteredHeroes.map((hero) => (
					<HeroCard
						key={hero.infos.name}
						name={hero.infos.name}
						splashart={hero.splashart}
						reverseSA={saReverse.includes(hero.infos.name)}
					/>
				))}
			</div>

			{/* No results message */}
			{filteredHeroes.length === 0 && (
				<div className="text-center text-muted-foreground mt-8">No heroes found matching your criteria.</div>
			)}
		</div>
	)
}
