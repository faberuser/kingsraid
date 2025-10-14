import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import ArtifactClient from "@/app/artifacts/[...slug]/client"
import { ArtifactData } from "@/model/Artifact"
import { SlugPageProps, findData } from "@/lib/get-data"

export async function generateStaticParams() {
	const artifactsPath = path.join(process.cwd(), "public", "kingsraid-data", "table-data", "artifacts.json")
	const slugs: string[] = []

	if (fs.existsSync(artifactsPath)) {
		const fileContent = fs.readFileSync(artifactsPath, "utf-8")
		const data: ArtifactData[] = JSON.parse(fileContent)
		for (const artifact of data) {
			if (artifact.name) {
				// Convert to slug format (lowercase with hyphens)
				const slug = artifact.name.toLowerCase().replace(/\s+/g, "-")
				slugs.push(slug)
			}
			// Also generate slugs for aliases
			if (artifact.aliases && Array.isArray(artifact.aliases)) {
				for (const alias of artifact.aliases) {
					const slug = alias.toLowerCase().replace(/\s+/g, "-")
					slugs.push(slug)
				}
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
