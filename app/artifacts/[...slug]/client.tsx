"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
		<div className="container mx-auto py-8">
			{/* Back Button */}
			<div className="mb-6">
				<Link href="/artifacts">
					<Button variant="ghost" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Back to Artifacts
					</Button>
				</Link>
			</div>

			{/* Artifact Header */}
			<div className="mb-8">
				<div className="flex items-start gap-6 mb-6">
					<div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
						<Image src={`/assets/${data.thumbnail}`} alt={name} fill className="object-cover" />
					</div>
					<div className="flex-1">
						<h1 className="text-4xl font-bold mb-4">{name}</h1>
						{data.aliases && data.aliases.length > 0 && (
							<div className="flex flex-wrap gap-2 mb-4">
								<span className="text-sm text-muted-foreground">Aliases:</span>
								{data.aliases.map((alias) => (
									<Badge key={alias} variant="secondary">
										{alias}
									</Badge>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			<Separator className="mb-8" />

			{/* Effect Description */}
			<div className="mb-8">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">Effect Description</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-lg leading-relaxed">
							{parseFormattedText(formatDescription(data.description, data.value))}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Values */}
			<div className="mb-8">
				<h2 className="text-2xl font-bold mb-6">Values by Enhancement Level</h2>
				<div className="grid gap-4">
					{Object.entries(data.value).map(([key, values]) => (
						<Card key={key}>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">Value {key}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-6 gap-2">
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
