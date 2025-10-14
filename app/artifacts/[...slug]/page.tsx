import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import ArtifactClient from "@/app/artifacts/[...slug]/client"
import { ArtifactData } from "@/model/Artifact"
import { findData, SlugPageProps } from "@/lib/get-data"

export async function generateStaticParams() {
	const artifactsPath = path.join(process.cwd(), "public", "kingsraid-data", "table-data", "artifacts.json")
	const slugs: string[] = []

	if (fs.existsSync(artifactsPath)) {
		const fileContent = fs.readFileSync(artifactsPath, "utf-8")
		const data: ArtifactData[] = JSON.parse(fileContent)
		for (const artifact of data) {
			if (artifact.name) {
				slugs.push(artifact.name)
			}
			// If you want to support aliases:
			if (artifact.aliases && Array.isArray(artifact.aliases)) {
				slugs.push(...artifact.aliases)
			}
		}
	}

	return slugs.map((slug) => ({ slug: [slug] }))
}

export default async function SlugPage({ params }: SlugPageProps) {
	const { slug } = await params
	const artifactName = slug?.[0]

	if (!artifactName) {
		notFound()
	}

	const artifactData = (await findData(artifactName, "artifacts.json")) as ArtifactData | null

	if (!artifactData) {
		notFound()
	}

	return <ArtifactClient artifactData={artifactData} />
}
