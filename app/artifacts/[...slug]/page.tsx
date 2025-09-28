import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import ArtifactClient from "@/app/artifacts/[...slug]/client"
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

interface SlugPageProps {
	params: Promise<{
		slug: string[]
	}>
}

export default async function SlugPage({ params }: SlugPageProps) {
	const { slug } = await params
	const artifactName = slug?.[0]

	if (!artifactName) {
		notFound()
	}

	const decodedArtifactName = decodeURIComponent(artifactName)
	const artifactData = await getArtifactData(decodedArtifactName)

	if (!artifactData) {
		notFound()
	}

	return <ArtifactClient artifactData={artifactData} />
}
