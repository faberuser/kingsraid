import fs from "fs"
import path from "path"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { ArtifactData } from "@/model/Artifact"

interface ArtifactsData {
	[artifactName: string]: ArtifactData
}

async function getArtifactsData(): Promise<{ name: string; data: ArtifactData }[]> {
	try {
		const artifactsFile = path.join(process.cwd(), "kingsraid-data", "table-data", "artifacts.json")
		const fileContent = fs.readFileSync(artifactsFile, "utf-8")
		const artifactsData: ArtifactsData = JSON.parse(fileContent)

		// Convert to array and sort alphabetically
		const artifacts = Object.entries(artifactsData).map(([name, data]) => ({
			name,
			data,
		}))

		return artifacts.sort((a, b) => a.name.localeCompare(b.name))
	} catch (error) {
		console.error("Error reading artifacts file:", error)
		return []
	}
}

export default async function ArtifactsPage() {
	const artifacts = await getArtifactsData()

	return (
		<div className="container mx-auto py-8">
			<div className="mb-8">
				<h1 className="text-4xl font-bold mb-4">Artifacts</h1>
				<p className="text-muted-foreground">
					Browse through artifacts' effects and synergies to optimize your team builds.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{artifacts.map(({ name, data }) => (
					<Link key={name} href={`/artifacts/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"))}`}>
						<Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
							<CardHeader className="pb-4">
								<div className="flex items-center gap-4">
									<div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
										<Image
											src={`/assets/${data.thumbnail}`}
											alt={name}
											fill
											className="object-cover"
										/>
									</div>
									<div className="flex-1">
										<CardTitle className="text-lg">{name}</CardTitle>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<p className="text-sm text-muted-foreground line-clamp-3">{data.description}</p>
									<div className="flex flex-wrap gap-1"></div>
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	)
}
