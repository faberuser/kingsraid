import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import ArtifactPageWrapper from "@/app/artifacts/[...slug]/page-wrapper"
import { ArtifactData } from "@/model/Artifact"
import { SlugPageProps, findData, artifactExistsInVersion } from "@/lib/get-data"

const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true"

export async function generateStaticParams() {
	// Only generate static params when building for static export (GitHub Pages)
	if (!isStaticExport) {
		return []
	}

	const artifactsPath = path.join(process.cwd(), "public", "kingsraid-data", "table-data", "legacy", "artifacts.json")
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

	// Fetch legacy data (always exists as base)
	const artifactDataLegacy = (await findData(artifactName, "artifacts", {
		heroDataVersion: "legacy",
	})) as ArtifactData | null

	if (!artifactDataLegacy) {
		notFound()
	}

	// Check if artifact exists in CBT and CCBT data and fetch if it does
	const existsInCbt = await artifactExistsInVersion(artifactName, "cbt")
	const existsInCcbt = await artifactExistsInVersion(artifactName, "ccbt")

	const artifactDataCbt = existsInCbt
		? ((await findData(artifactName, "artifacts", { heroDataVersion: "cbt" })) as ArtifactData | null)
		: null
	const artifactDataCcbt = existsInCcbt
		? ((await findData(artifactName, "artifacts", { heroDataVersion: "ccbt" })) as ArtifactData | null)
		: null

	return (
		<ArtifactPageWrapper
			artifactDataCbt={artifactDataCbt}
			artifactDataCcbt={artifactDataCcbt}
			artifactDataLegacy={artifactDataLegacy}
		/>
	)
}
