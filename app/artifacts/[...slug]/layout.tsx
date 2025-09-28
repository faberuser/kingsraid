import type { Metadata } from "next"
import fs from "fs"
import path from "path"
import { ArtifactData } from "@/model/Artifact"

async function getArtifactData(artifactName: string): Promise<ArtifactData | null> {
	try {
		const artifactsFile = path.join(process.cwd(), "kingsraid-data", "table-data", "artifacts.json")
		const fileContent = fs.readFileSync(artifactsFile, "utf-8")
		const artifactsData: ArtifactData[] = JSON.parse(fileContent)

		// Convert slug back to artifact name format
		const normalizedSlug = artifactName.toLowerCase().replace(/-/g, " ")

		// Try to find artifact by exact name match (case insensitive)
		let foundArtifact = artifactsData.find((artifact) => artifact.name.toLowerCase() === normalizedSlug)

		// If not found by name, search by aliases
		if (!foundArtifact) {
			foundArtifact = artifactsData.find((artifact) =>
				artifact.aliases?.some((alias) => alias.toLowerCase() === normalizedSlug)
			)
		}

		if (!foundArtifact) {
			return null
		}

		return foundArtifact
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
	const { slug } = await params

	if (!slug || slug.length === 0) {
		return {
			title: "All Artifacts - King's Raid",
			description: "Browse through all artifact effects and synergies in King's Raid.",
			openGraph: {
				title: "All Artifacts - King's Raid",
				description: "Browse through all artifact effects and synergies in King's Raid.",
			},
		}
	}

	const artifactName = decodeURIComponent(slug[0])
	const artifactData = await getArtifactData(artifactName)

	if (!artifactData) {
		return {
			title: "Artifact Not Found - King's Raid",
			description: "The requested artifact could not be found.",
			openGraph: {
				title: "Artifact Not Found - King's Raid",
				description: "The requested artifact could not be found.",
			},
		}
	}

	const displayName = artifactData.name

	return {
		title: `${displayName} - Artifacts - King's Raid`,
		description: `View artifact ${displayName} details.`,
		openGraph: {
			title: `${displayName} - Artifacts - King's Raid`,
			description: `View artifact ${displayName} details.`,
		},
	}
}

export default function ArtifactsLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
