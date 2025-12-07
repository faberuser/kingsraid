import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import HeroPageWrapper from "@/app/heroes/[...slug]/page-wrapper"
import { SlugPageProps, findData, heroExistsInNewData } from "@/lib/get-data"
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

	// Fetch legacy data
	const heroDataLegacy = (await findData(heroName, "heroes", { useNewData: false })) as HeroData | null

	if (!heroDataLegacy) {
		notFound()
	}

	// Check if hero exists in new data and fetch if it does
	const existsInNewData = await heroExistsInNewData(heroName)
	const heroDataNew = existsInNewData
		? ((await findData(heroName, "heroes", { useNewData: true })) as HeroData | null)
		: null

	// Get costume data server-side for both versions
	const costumesLegacy = await getCostumeData(heroDataLegacy.costumes)
	const costumesNew = heroDataNew ? await getCostumeData(heroDataNew.costumes) : []

	// Get model data server-side (only if enabled)
	const heroModelsLegacy = enableModelsVoices ? await getHeroModels(heroDataLegacy.profile.name) : {}
	const heroModelsNew = enableModelsVoices && heroDataNew ? await getHeroModels(heroDataNew.profile.name) : {}

	// Get voice files server-side (only if enabled)
	const voiceFilesLegacy = enableModelsVoices
		? await getVoiceFiles(heroDataLegacy.profile.name)
		: { en: [], jp: [], kr: [] }
	const voiceFilesNew =
		enableModelsVoices && heroDataNew ? await getVoiceFiles(heroDataNew.profile.name) : { en: [], jp: [], kr: [] }

	// Get available scenes server-side (only if enabled)
	const availableScenes = enableModelsVoices ? await getAvailableScenes() : []

	return (
		<HeroPageWrapper
			heroDataLegacy={heroDataLegacy}
			heroDataNew={heroDataNew}
			costumesLegacy={costumesLegacy}
			costumesNew={costumesNew}
			heroModelsLegacy={heroModelsLegacy}
			heroModelsNew={heroModelsNew}
			voiceFilesLegacy={voiceFilesLegacy}
			voiceFilesNew={voiceFilesNew}
			availableScenes={availableScenes}
			enableModelsVoices={enableModelsVoices}
		/>
	)
}
