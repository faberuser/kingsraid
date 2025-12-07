import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import HeroClient from "@/app/heroes/[...slug]/client"
import { SlugPageProps, findData } from "@/lib/get-data"
import { HeroData } from "@/model/Hero"
import { getCostumeData } from "@/app/heroes/[...slug]/models/getCostumes"
import { getHeroModels } from "@/app/heroes/[...slug]/models/getHeroModels"
import { getVoiceFiles } from "@/app/heroes/[...slug]/models/getVoices"
import { getAvailableScenes } from "@/app/heroes/[...slug]/models/getScenes"

const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true"
const enableModelsVoices = process.env.NEXT_PUBLIC_ENABLE_MODELS_VOICES === "true"

export async function generateStaticParams() {
	// Only generate static params when building for static export (GitHub Pages)
	if (!isStaticExport) {
		return []
	}

	const heroesDir = path.join(process.cwd(), "public", "kingsraid-data", "table-data", "heroes")
	const slugs: string[] = []

	if (fs.existsSync(heroesDir)) {
		const files = fs.readdirSync(heroesDir).filter((file) => file.endsWith(".json"))
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
	const heroName = slug?.[0]

	if (!heroName) {
		notFound()
	}

	const heroData = (await findData(heroName, "heroes")) as HeroData | null

	if (!heroData) {
		notFound()
	}

	// Get costume data server-side
	const costumes = await getCostumeData(heroData.costumes)

	// Get model data server-side (only if enabled)
	const heroModels = enableModelsVoices ? await getHeroModels(heroData.profile.name) : {}

	// Get voice files server-side (only if enabled)
	const voiceFiles = enableModelsVoices ? await getVoiceFiles(heroData.profile.name) : { en: [], jp: [], kr: [] }

	// Get available scenes server-side (only if enabled)
	const availableScenes = enableModelsVoices ? await getAvailableScenes() : []

	return (
		<HeroClient
			heroData={heroData}
			costumes={costumes}
			heroModels={heroModels}
			voiceFiles={voiceFiles}
			availableScenes={availableScenes}
			enableModelsVoices={enableModelsVoices}
		/>
	)
}
