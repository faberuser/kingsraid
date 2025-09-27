"use client"

import { useState, useMemo } from "react"
import Fuse from "fuse.js"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { ArtifactData } from "@/model/Artifact"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface ArtifactsClientProps {
	artifacts: { name: string; data: ArtifactData }[]
}

export default function ArtifactsClient({ artifacts }: ArtifactsClientProps) {
	const [searchQuery, setSearchQuery] = useState("")

	// Configure Fuse.js for fuzzy search
	const fuse = useMemo(() => {
		return new Fuse(artifacts, {
			keys: ["name", "data.class", "data.type", "data.description", "data.aliases"],
			threshold: 0.3,
			includeScore: true,
		})
	}, [artifacts])

	// Filter artifacts by search query
	const filteredArtifacts = useMemo(() => {
		if (searchQuery.trim()) {
			const searchResults = fuse.search(searchQuery)
			return searchResults.map((item) => item.item)
		}
		return artifacts
	}, [artifacts, searchQuery, fuse])

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

				<div className="flex flex-row gap-4 items-baseline">
					<div className="text-xl font-bold">Artifacts</div>
					<div className="text-muted-foreground text-sm">Showing {filteredArtifacts.length} artifacts</div>
				</div>

				<Separator />

				{/* Search Input */}
				<div className="w-full max-w-sm">
					<Input
						type="text"
						placeholder="Search for artifacts..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full"
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
						<Card className="hover:shadow-lg transition-shadow cursor-pointer h-full gap-0">
							<CardHeader>
								<div className="flex items-center gap-4">
									{artifact.data.thumbnail && (
										<div className="w-16 h-16 flex items-center justify-center">
											<Image
												src={`/assets/${artifact.data.thumbnail
													.split("/")
													.map(encodeURIComponent)
													.join("/")}`}
												alt={artifact.name}
												width="0"
												height="0"
												sizes="10vw"
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
									<div className="flex flex-wrap gap-2"></div>
									{artifact.data.description && (
										<div className="text-sm text-muted-foreground line-clamp-3">
											{artifact.data.description}
										</div>
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
