"use client"

import { useState, useEffect, useMemo } from "react"
import Fuse from "fuse.js"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import Image from "@/components/next-image"
import { BossData } from "@/model/Boss"
import { Button } from "@/components/ui/button"
import { Search, ChevronDown, ChevronUp } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"

interface BossesClientProps {
	bosses: BossData[]
	bossTypeMap: Record<string, string>
	releaseOrder: Record<string, string>
}

export default function BossesClient({ bosses, bossTypeMap, releaseOrder }: BossesClientProps) {
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedType, setSelectedType] = useState("all")
	const [loadingCard, setLoadingCard] = useState<string | null>(null)
	const [sortType, setSortType] = useState<"alphabetical" | "release">(
		typeof window !== "undefined"
			? (localStorage.getItem("bossesSortType") as "alphabetical" | "release") || "release"
			: "release"
	)
	const [reverseSort, setReverseSort] = useState(
		typeof window !== "undefined"
			? localStorage.getItem("bossesReverseSort") === null
				? true
				: localStorage.getItem("bossesReverseSort") === "true"
			: true
	)

	// Save sort state to localStorage when changed
	useEffect(() => {
		localStorage.setItem("bossesSortType", sortType)
		localStorage.setItem("bossesReverseSort", reverseSort.toString())
	}, [sortType, reverseSort])

	// Configure Fuse.js for fuzzy search
	const fuse = useMemo(() => {
		return new Fuse(bosses, {
			keys: ["profile.name", "profile.title", "aliases"],
			threshold: 0.3,
			includeScore: true,
		})
	}, [bosses])

	// Get all boss types from data
	const bossTypes = useMemo(() => {
		const types = new Set<string>()
		bosses.forEach((boss) => {
			boss.profile.type?.forEach((t) => types.add(t))
		})
		// Sort by the order in bossTypeMap
		const typeOrder = Object.keys(bossTypeMap)
		return Array.from(types).sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b))
	}, [bosses, bossTypeMap])

	// Filter and sort bosses
	const filteredBosses = useMemo(() => {
		let result = bosses

		// Apply search filter
		if (searchQuery.trim()) {
			const searchResults = fuse.search(searchQuery)
			result = searchResults.map((item) => item.item)
		}

		// Filter by type
		if (selectedType !== "all") {
			result = result.filter((boss) => boss.profile.type?.includes(selectedType))
		}

		// Sort by selected sort type
		if (sortType === "release") {
			result = [...result].sort((a, b) => {
				const aOrder = parseInt(releaseOrder[a.profile.name] ?? "9999", 10)
				const bOrder = parseInt(releaseOrder[b.profile.name] ?? "9999", 10)
				return aOrder - bOrder
			})
		} else {
			result = [...result].sort((a, b) => a.profile.name.localeCompare(b.profile.name))
		}

		// Reverse if needed
		if (reverseSort) {
			result = result.reverse()
		}
		return result
	}, [bosses, searchQuery, fuse, selectedType, sortType, reverseSort, releaseOrder])

	return (
		<div>
			<div className="space-y-4 mb-4">
				<div className="flex flex-row justify-between items-center">
					<div className="flex flex-row gap-2 items-baseline">
						<div className="text-xl font-bold">Bosses</div>
						<div className="text-muted-foreground text-sm">Showing {filteredBosses.length} bosses</div>
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

				<div className="flex flex-col items-start xl:flex-row xl:items-center gap-4">
					{/* Search Input */}
					<div className="w-full max-w-sm relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
							<Search className="h-4 w-4" />
						</span>
						<Input
							type="text"
							placeholder="Search for bosses..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10"
						/>
					</div>

					{/* Boss Type Filter */}
					<div>
						<RadioGroup
							value={selectedType}
							onValueChange={setSelectedType}
							className="flex flex-row flex-wrap justify-center space-x-1 md:space-x-2"
						>
							<label
								key="all"
								htmlFor="all"
								className="flex items-center space-x-1 md:space-x-2 cursor-pointer"
							>
								<RadioGroupItem value="all" id="all" />
								<span>All</span>
							</label>
							{bossTypes.map((type) => (
								<label
									key={type}
									htmlFor={type}
									className="flex items-center space-x-1 md:space-x-2 cursor-pointer"
								>
									<RadioGroupItem value={type} id={type} />
									<span>{bossTypeMap[type] ?? type}</span>
								</label>
							))}
						</RadioGroup>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredBosses.map((boss) => (
					<Link
						key={boss.profile.name}
						href={`/bosses/${encodeURIComponent(boss.profile.name.toLowerCase().replace(/\s+/g, "-"))}`}
						className="hover:scale-105 transition-transform duration-300"
						onClick={() => setLoadingCard(boss.profile.name)}
					>
						<Card className="hover:shadow-lg transition-shadow cursor-pointer h-full gap-4 relative">
							<CardHeader>
								<div className="flex items-center gap-4">
									<div className="w-16 h-16 flex items-center justify-center">
										<Image
											src={`/kingsraid-data/assets/${boss.profile.thumbnail}`}
											alt={boss.profile.name}
											width="0"
											height="0"
											sizes="30vw md:10vw"
											className="w-full h-auto rounded"
										/>
									</div>
									<div className="flex-1">
										<CardTitle className="text-lg">{boss.profile.name}</CardTitle>
										<CardDescription className="text-sm">{boss.profile.title}</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="flex flex-wrap gap-2">
										{boss.profile.type.map((type) => (
											<Badge key={type} variant="default">
												{type}
											</Badge>
										))}
										<Badge variant="secondary">{boss.profile.race}</Badge>
										<Badge
											variant="default"
											className={
												boss.profile.damage_type === "Physical"
													? "bg-red-300"
													: boss.profile.damage_type === "Magical"
													? "bg-blue-300"
													: "bg-yellow-400"
											}
										>
											{boss.profile.damage_type}
										</Badge>
									</div>
									<div className="text-sm text-muted-foreground line-clamp-3">
										{boss.profile.characteristics}
									</div>
								</div>
							</CardContent>
							{loadingCard === boss.profile.name && (
								<div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
									<Spinner className="size-8" />
								</div>
							)}
						</Card>
					</Link>
				))}
			</div>
		</div>
	)
}
