"use client"

import { useCallback, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import GearEnhancement from "@/components/gear-enhancement"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import Image from "@/components/next-image"
import { ArtifactData } from "@/model/Artifact"

interface ArtifactClientProps {
	artifactData: ArtifactData
	sortedArtifactSlugs: string[]
}

export default function ArtifactClient({ artifactData, sortedArtifactSlugs }: ArtifactClientProps) {
	const router = useRouter()
	const [isNavigating, startTransition] = useTransition()
	const enhancementValues = Object.fromEntries(
		Object.entries(artifactData.value ?? {}).map(([statKey, values]) => [
			statKey,
			Object.fromEntries(values.split(",").map((value, level) => [String(level), value.trim()])),
		]),
	)

	const handleNavigate = useCallback(
		(direction: "prev" | "next") => {
			let slugs = sortedArtifactSlugs
			if (typeof window !== "undefined") {
				const stored = sessionStorage.getItem("currentArtifactList")
				if (stored) {
					try {
						const parsed = JSON.parse(stored)
						if (Array.isArray(parsed) && parsed.length > 0) slugs = parsed
					} catch {
						// fallback to alphabetical order
					}
				}
			}

			if (!slugs || slugs.length === 0) return
			const currentSlug = artifactData.name.toLowerCase().replace(/\s+/g, "-")
			const currentIndex = slugs.indexOf(currentSlug)
			if (currentIndex === -1) return

			let targetIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1
			if (targetIndex < 0) targetIndex = slugs.length - 1
			if (targetIndex >= slugs.length) targetIndex = 0

			startTransition(() => {
				router.replace(`/artifacts/${slugs[targetIndex]}`)
			})
		},
		[sortedArtifactSlugs, artifactData.name, router],
	)

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
			if (e.key === "ArrowLeft") handleNavigate("prev")
			if (e.key === "ArrowRight") handleNavigate("next")
		}
		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [handleNavigate])

	return (
		<div className="relative">
			{/* Full-dialog navigation loading overlay */}
			{isNavigating && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
					<Spinner className="h-10 w-10" />
				</div>
			)}
			{/* Artifact Header */}
			<div className="mb-8">
				<div className="flex items-center gap-6 mb-6 relative">
					<div className="w-16 h-16 md:w-20 md:h-20">
						<Image
							src={`/kingsraid-data/assets/${artifactData.thumbnail
								.split("/")
								.map(encodeURIComponent)
								.join("/")}`}
							alt={artifactData.name}
							width="0"
							height="0"
							sizes="20vw md:5vw"
							className="w-full h-auto rounded"
						/>
					</div>
					<div className="flex flex-col justify-center flex-1">
						<div className="text-2xl md:text-3xl font-bold">{artifactData.name}</div>
					</div>
					{/* Navigation Buttons */}
					{sortedArtifactSlugs && sortedArtifactSlugs.length > 0 && (
						<div className="absolute top-0 right-0 flex gap-1">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => handleNavigate("prev")}
								title="Previous Artifact"
								className="h-8 w-8 text-muted-foreground hover:text-foreground"
								disabled={isNavigating}
							>
								<ChevronLeft className="h-5 w-5" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => handleNavigate("next")}
								title="Next Artifact"
								className="h-8 w-8 text-muted-foreground hover:text-foreground"
								disabled={isNavigating}
							>
								<ChevronRight className="h-5 w-5" />
							</Button>
						</div>
					)}
				</div>
			</div>

			{/* Effect Description */}
			<div className="mb-8">
				<Card className="gap-2">
					<CardHeader>
						<CardTitle>Effect</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg">
							<GearEnhancement
								key={artifactData.name}
								name={artifactData.name}
								description={artifactData.description}
								values={enhancementValues}
							/>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Story */}
			<div className="mb-8">
				<Card className="gap-2">
					<CardHeader>
						<CardTitle>Story</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="whitespace-pre-wrap">{artifactData.story}</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
