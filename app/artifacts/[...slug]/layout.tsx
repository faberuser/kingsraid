import type { Metadata } from "next"
import { ArtifactData } from "@/model/Artifact"
import { SlugPageProps, findData } from "@/lib/get-data"

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
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

	// Use legacy version for metadata (contains all artifacts)
	const artifactData = (await findData(slug[0], "artifacts", { heroDataVersion: "legacy" })) as ArtifactData | null

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
	const assetPath = "/kingsraid-data/assets/" + artifactData.thumbnail
	const thumbnail = `/_next/image?url=${encodeURIComponent(assetPath)}&w=1080&q=75`

	return {
		title: `${displayName} - Artifacts - King's Raid`,
		description: `View artifact ${displayName} details.`,
		openGraph: {
			title: `${displayName} - Artifacts - King's Raid`,
			description: `View artifact ${displayName} details.`,
			type: "website",
			images: thumbnail,
		},
	}
}

export default function ArtifactsLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
