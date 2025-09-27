"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ArtifactData } from "@/model/Artifact"

interface ArtifactClientProps {
	artifactData: { name: string; data: ArtifactData }
}

function formatDescription(description: string, values: { [key: string]: string }): string {
	let formatted = description

	// Replace (0), (1), etc. with actual values
	Object.entries(values).forEach(([key, value]) => {
		const regex = new RegExp(`\\(${key}\\)`, "g")
		formatted = formatted.replace(regex, `**${value}**`)
	})

	return formatted
}

function parseFormattedText(text: string) {
	// Split by ** to find bold sections
	const parts = text.split("**")
	return parts.map((part, index) => {
		if (index % 2 === 1) {
			// Odd indices are bold
			return (
				<strong key={index} className="text-primary font-semibold">
					{part}
				</strong>
			)
		}
		return part
	})
}

export default function ArtifactClient({ artifactData }: ArtifactClientProps) {
	const { name, data } = artifactData

	return (
		<div className="container mx-auto p-4 sm:p-8">
			{/* Back Button */}
			<div className="mb-6">
				<Link href="/artifacts">
					<Button variant="ghost" className="gap-2 p-0 has-[>svg]:px-0">
						<ArrowLeft className="h-4 w-4" />
						Back to Artifacts
					</Button>
				</Link>
			</div>

			{/* Artifact Header */}
			<div className="mb-8">
				<div className="flex items-center gap-6 mb-6">
					<div className="w-24 h-24">
						<Image
							src={`/assets/${data.thumbnail}`}
							alt={name}
							width="0"
							height="0"
							sizes="10vw"
							className="w-full h-auto rounded"
						/>
					</div>
					<div className="flex flex-col justify-center flex-1">
						<div className="text-3xl font-bold mb-4">{name}</div>
					</div>
				</div>
			</div>

			{/* Effect Description */}
			<div className="mb-8">
				<Card className="gap-2">
					<CardHeader>
						<CardTitle>Effect Description</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg">
							{parseFormattedText(formatDescription(data.description, data.value))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Values */}
			<div className="mb-8">
				<div className="text-2xl font-bold mb-6">Values by Enhancement Level</div>
				<div className="grid gap-4">
					{Object.entries(data.value).map(([key, values]) => (
						<Card key={key} className="gap-2">
							<CardHeader>
								<CardTitle className="flex items-center justify-between">Value {key}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-3 md:grid-cols-6 gap-2">
									{values.split(", ").map((value, index) => (
										<div key={index} className="text-center">
											<div className="text-xs text-muted-foreground mb-1">★{index}</div>
											<Badge variant="outline" className="w-full justify-center">
												{value.trim()}
											</Badge>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	)
}
