import { notFound } from "next/navigation"
import ArtifactClient from "@/app/artifacts/[...slug]/client"
import { ArtifactData } from "@/model/Artifact"
import { SlugPageProps, findData } from "@/components/server/get-data"

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
