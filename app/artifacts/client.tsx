"use client"

import { useState, useEffect, useMemo } from "react"
import Fuse from "fuse.js"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import Image from "@/components/next-image"
import { ArtifactData } from "@/model/Artifact"
import { Button } from "@/components/ui/button"
import { Search, ChevronDown, ChevronUp } from "lucide-react"

interface ArtifactsClientProps {
	artifacts: ArtifactData[]
	releaseOrder: Record<string, string>
}

export default function ArtifactsClient({ artifacts, releaseOrder }: ArtifactsClientProps) {
	const [searchQuery, setSearchQuery] = useState("")
	const [sortType, setSortType] = useState<"alphabetical" | "release">(
		typeof window !== "undefined"
			? (localStorage.getItem("artifactsSortType") as "alphabetical" | "release") || "release"
			: "release"
	)
	const [reverseSort, setReverseSort] = useState(
		typeof window !== "undefined"
			? localStorage.getItem("artifactsReverseSort") === null
				? true
				: localStorage.getItem("artifactsReverseSort") === "true"
			: true
	)

	// Save reverseSort to localStorage when changed
	useEffect(() => {
		localStorage.setItem("artifactsSortType", sortType)
		localStorage.setItem("artifactsReverseSort", reverseSort.toString())
	}, [sortType, reverseSort])

	// Configure Fuse.js for fuzzy search
	const fuse = useMemo(() => {
		return new Fuse(artifacts, {
			keys: ["name", "aliases"],
			threshold: 0.3,
			includeScore: true,
		})
	}, [artifacts])

	// Filter and sort artifacts
	const filteredArtifacts = useMemo(() => {
		let result = artifacts

		// Apply search filter
		if (searchQuery.trim()) {
			const searchResults = fuse.search(searchQuery)
			result = searchResults.map((item) => item.item)
		}

		// Sort by selected sort type
		if (sortType === "release") {
			result = [...result].sort((a, b) => {
				const aOrder = parseInt(releaseOrder[a.name] ?? "9999", 10)
				const bOrder = parseInt(releaseOrder[b.name] ?? "9999", 10)
				return aOrder - bOrder
			})
		} else {
			result = [...result].sort((a, b) => a.name.localeCompare(b.name))
		}

		// Reverse if needed
		if (reverseSort) {
			result = result.reverse()
		}
		return result
	}, [artifacts, searchQuery, fuse, sortType, reverseSort, releaseOrder])

	return (
		<div>
			<div className="space-y-4 mb-4">
				<div className="flex flex-row justify-between items-center">
					<div className="flex flex-row gap-2 items-baseline">
						<div className="text-xl font-bold">Artifacts</div>
						<div className="text-muted-foreground text-sm">
							Showing {filteredArtifacts.length} artifacts
						</div>
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

				{/* Search Input */}
				<div className="w-full max-w-sm relative">
					<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
						<Search className="h-4 w-4" />
					</span>
					<Input
						type="text"
						placeholder="Search for artifacts..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredArtifacts.map((artifact) => (
					<Link
						key={artifact.name}
						href={`/artifacts/${encodeURIComponent(artifact.name.toLowerCase().replace(/\s+/g, "-"))}`}
						className="hover:scale-105 transition-transform duration-300"
					>
						<Card className="hover:shadow-lg transition-shadow cursor-pointer h-full gap-2">
							<CardHeader>
								<div className="flex items-center gap-4">
									{artifact.thumbnail && (
										<div className="w-16 h-16 flex items-center justify-center">
											<Image
												src={`/kingsraid-data/assets/${artifact.thumbnail
													.split("/")
													.map(encodeURIComponent)
													.join("/")}`}
												alt={artifact.name}
												width="0"
												height="0"
												sizes="30vw md:10vw"
												className="w-full h-auto rounded"
											/>
										</div>
									)}
									<div className="flex-1">
										<CardTitle className="text-lg">{artifact.name}</CardTitle>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{artifact.description && (
										<p className="text-sm text-muted-foreground line-clamp-3">
											{artifact.description}
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	)
}
