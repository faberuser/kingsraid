"use client"

import { useState, useEffect, useMemo } from "react"
import Fuse from "fuse.js"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { BossData } from "@/model/Boss"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search, ChevronDown, ChevronUp } from "lucide-react"

interface BossesClientProps {
	bosses: BossData[]
}

export default function BossesClient({ bosses }: BossesClientProps) {
	const [searchQuery, setSearchQuery] = useState("")
	const [reverseSort, setReverseSort] = useState(false)

	// Load sort state from localStorage on mount
	useEffect(() => {
		const savedReverseSort = localStorage.getItem("bossesReverseSort")
		if (savedReverseSort === "true" || savedReverseSort === "false") {
			setReverseSort(savedReverseSort === "true")
		}
	}, [])

	// Save sort state to localStorage when changed
	useEffect(() => {
		localStorage.setItem("bossesReverseSort", reverseSort.toString())
	}, [reverseSort])

	// Configure Fuse.js for fuzzy search
	const fuse = useMemo(() => {
		return new Fuse(bosses, {
			keys: ["infos.name", "infos.title", "aliases"],
			threshold: 0.3,
			includeScore: true,
		})
	}, [bosses])

	// Filter and sort bosses
	const filteredBosses = useMemo(() => {
		let result = bosses
		if (searchQuery.trim()) {
			const searchResults = fuse.search(searchQuery)
			result = searchResults.map((item) => item.item)
		}
		// Sort alphabetically
		result = [...result].sort((a, b) => a.infos.name.localeCompare(b.infos.name))
		// Reverse if needed
		if (reverseSort) {
			result = result.reverse()
		}
		return result
	}, [bosses, searchQuery, fuse, reverseSort])

	return (
		<div className="container mx-auto p-4 sm:p-8">
			<div className="space-y-4 mb-4">
				{/* Back Button */}
				<div className="mb-2">
					<Link href="/">
						<Button variant="ghost" className="gap-2 has-[>svg]:px-0 p-0">
							<ArrowLeft className="h-4 w-4" />
							Back to Home
						</Button>
					</Link>
				</div>

				<div className="flex flex-row justify-between">
					<div className="flex flex-row gap-4 items-baseline">
						<div className="text-xl font-bold">Bosses</div>
						<div className="text-muted-foreground text-sm">Showing {filteredBosses.length} bosses</div>
					</div>
					<div className="flex flex-row">
						<Button variant="outline" onClick={() => setReverseSort(!reverseSort)}>
							{reverseSort ? <ChevronDown /> : <ChevronUp />}
							{reverseSort ? "Z → A" : "A → Z"}
						</Button>
					</div>
				</div>

				<Separator />

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
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredBosses.map((boss) => (
					<Link
						key={boss.infos.name}
						href={`/bosses/${encodeURIComponent(boss.infos.name.toLowerCase().replace(/\s+/g, "-"))}`}
						className="hover:scale-105 transition-transform duration-300"
					>
						<Card className="hover:shadow-lg transition-shadow cursor-pointer h-full gap-4">
							<CardHeader>
								<div className="flex items-center gap-4">
									<div className="w-16 h-16 flex items-center justify-center">
										<Image
											src={`/kingsraid-data/assets/${boss.infos.thumbnail}`}
											alt={boss.infos.name}
											width="0"
											height="0"
											sizes="30vw md:10vw"
											className="w-full h-auto rounded"
										/>
									</div>
									<div className="flex-1">
										<CardTitle className="text-lg">{boss.infos.name}</CardTitle>
										<CardDescription className="text-sm">{boss.infos.title}</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="flex flex-wrap gap-2">
										<Badge variant="secondary">{boss.infos.race}</Badge>
										<Badge
											variant="default"
											className={
												boss.infos["damage type"] === "Physical"
													? "bg-red-300"
													: boss.infos["damage type"] === "Magical"
													? "bg-blue-300"
													: "bg-yellow-400"
											}
										>
											{boss.infos["damage type"]}
										</Badge>
									</div>
									<div className="text-sm text-muted-foreground line-clamp-3">
										{boss.infos.characteristics}
									</div>
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	)
}
