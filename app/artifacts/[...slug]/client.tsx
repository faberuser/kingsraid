"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ArtifactData } from "@/model/Artifact"

interface ArtifactClientProps {
	artifactData: ArtifactData
}

export default function ArtifactClient({ artifactData }: ArtifactClientProps) {
	return (
		<div>
			{/* Artifact Header */}
			<div className="mb-8">
				<div className="flex items-center gap-6 mb-6">
					<div className="w-24 h-24">
						<Image
							src={`/kingsraid-data/assets/${artifactData.thumbnail
								.split("/")
								.map(encodeURIComponent)
								.join("/")}`}
							alt={artifactData.name}
							width="0"
							height="0"
							sizes="10vw"
							className="w-full h-auto rounded"
						/>
					</div>
					<div className="flex flex-col justify-center flex-1">
						<div className="text-3xl font-bold mb-4">{artifactData.name}</div>
					</div>
				</div>
			</div>

			{/* Effect Description */}
			<div className="mb-8">
				<Card className="gap-2">
					<CardHeader>
						<CardTitle>Effect</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg">{artifactData.description}</div>
					</CardContent>
				</Card>
			</div>

			{/* Values */}
			<div className="mb-8">
				<div className="text-2xl font-bold mb-6">Enhancement Values</div>
				<div className="grid gap-4">
					{Object.entries(artifactData.value).map(([key, values]) => (
						<Card key={key} className="gap-2">
							<CardHeader>
								<CardTitle className="flex items-center justify-between">Stat ({key})</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-3 md:grid-cols-6 gap-2">
									{values.split(", ").map((value, index) => (
										<div key={index} className="text-center">
											<Badge variant="secondary" className="p-2 w-full justify-center">
												★{index}: {value.trim()}
											</Badge>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
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
