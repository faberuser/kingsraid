import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import BossClient from "@/app/bosses/[...slug]/client"
import { BossData } from "@/model/Boss"
import { SlugPageProps, findData } from "@/lib/get-data"
import { getBossModels } from "@/app/bosses/[...slug]/models/getBossModels"
import { getBossScenes } from "@/app/bosses/[...slug]/models/getBossScenes"

const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true"
const enableModelsVoices = process.env.NEXT_PUBLIC_ENABLE_MODELS_VOICES === "true"

export async function generateStaticParams() {
	// Only generate static params when building for static export (GitHub Pages)
	if (!isStaticExport) {
		return []
	}

	const bossesDir = path.join(process.cwd(), "public", "kingsraid-data", "table-data", "bosses")
	const slugs: string[] = []

	if (fs.existsSync(bossesDir)) {
		const files = fs.readdirSync(bossesDir).filter((file) => file.endsWith(".json"))
		for (const file of files) {
			// Remove .json extension
			const name = file.replace(".json", "")
			// Convert to slug format (lowercase with hyphens)
			const slug = name.toLowerCase().replace(/\s+/g, "-")
			slugs.push(slug)
		}
	}

	return slugs.map((slug) => ({ slug: [slug] }))
}

export default async function SlugPage({ params }: SlugPageProps) {
	const { slug } = await params
	const bossName = slug?.[0]

	if (!bossName) {
		notFound()
	}

	const bossData = (await findData(bossName, "bosses")) as BossData | null

	if (!bossData) {
		notFound()
	}

	// Get boss model data server-side (only if enabled)
	const bossModels = enableModelsVoices ? await getBossModels(bossData.infos.name) : { mesh: null }

	// Get boss scenes server-side (only if enabled)
	const bossScenes = enableModelsVoices ? await getBossScenes(bossData.infos.name) : []

	return (
		<BossClient
			bossData={bossData}
			bossModels={bossModels}
			bossScenes={bossScenes}
			enableModelsVoices={enableModelsVoices}
		/>
	)
}
