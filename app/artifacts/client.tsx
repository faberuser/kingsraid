"use client"

import { useState, useEffect, useMemo } from "react"
import Fuse from "fuse.js"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { ArtifactData } from "@/model/Artifact"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search, ChevronDown, ChevronUp } from "lucide-react"

interface ArtifactsClientProps {
	artifacts: ArtifactData[]
}

export default function ArtifactsClient({ artifacts }: ArtifactsClientProps) {
	const [searchQuery, setSearchQuery] = useState("")
	const [reverseSort, setReverseSort] = useState(false)

	// Load reverseSort from localStorage on mount
	useEffect(() => {
		const savedReverseSort = localStorage.getItem("artifactsReverseSort")
		if (savedReverseSort === "true" || savedReverseSort === "false") {
			setReverseSort(savedReverseSort === "true")
		}
	}, [])

	// Save reverseSort to localStorage when changed
	useEffect(() => {
		localStorage.setItem("artifactsReverseSort", reverseSort.toString())
	}, [reverseSort])

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
		if (searchQuery.trim()) {
			const searchResults = fuse.search(searchQuery)
			result = searchResults.map((item) => item.item)
		}
		// Sort alphabetically
		result = [...result].sort((a, b) => a.name.localeCompare(b.name))
		// Reverse if needed
		if (reverseSort) {
			result = result.reverse()
		}
		return result
	}, [artifacts, searchQuery, fuse, reverseSort])

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

				<div className="flex flex-row justify-between items-center">
					<div className="flex flex-row gap-2 items-baseline">
						<div className="text-xl font-bold">Artifacts</div>
						<div className="text-muted-foreground text-sm">
							Showing {filteredArtifacts.length} artifacts
						</div>
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
