import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import HeroPageWrapper from "@/app/heroes/[...slug]/page-wrapper"
import { SlugPageProps, findData, heroExistsInVersion } from "@/lib/get-data"
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

	const heroesDir = path.join(process.cwd(), "public", "kingsraid-data", "table-data", "legacy", "heroes")
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

	// Fetch legacy data (always exists as base)
	const heroDataLegacy = (await findData(heroName, "heroes", { dataVersion: "legacy" })) as HeroData | null

	if (!heroDataLegacy) {
		notFound()
	}

	// Check if hero exists in CBT and CCBT data and fetch if it does
	const existsInCbt = await heroExistsInVersion(heroName, "cbt")
	const existsInCcbt = await heroExistsInVersion(heroName, "ccbt")

	const heroDataCbt = existsInCbt
		? ((await findData(heroName, "heroes", { dataVersion: "cbt" })) as HeroData | null)
		: null
	const heroDataCcbt = existsInCcbt
		? ((await findData(heroName, "heroes", { dataVersion: "ccbt" })) as HeroData | null)
		: null

	// Get costume data server-side for all versions
	const costumesLegacy = await getCostumeData(heroDataLegacy.costumes)
	const costumesCbt = heroDataCbt ? await getCostumeData(heroDataCbt.costumes) : []
	const costumesCcbt = heroDataCcbt ? await getCostumeData(heroDataCcbt.costumes) : []

	// Get model data server-side (only if enabled)
	const heroModelsLegacy = enableModelsVoices ? await getHeroModels(heroDataLegacy.profile.name) : {}
	const heroModelsCbt = enableModelsVoices && heroDataCbt ? await getHeroModels(heroDataCbt.profile.name) : {}
	const heroModelsCcbt = enableModelsVoices && heroDataCcbt ? await getHeroModels(heroDataCcbt.profile.name) : {}

	// Get voice files server-side (only if enabled)
	const voiceFilesLegacy = enableModelsVoices
		? await getVoiceFiles(heroDataLegacy.profile.name)
		: { en: [], jp: [], kr: [] }
	const voiceFilesCbt =
		enableModelsVoices && heroDataCbt ? await getVoiceFiles(heroDataCbt.profile.name) : { en: [], jp: [], kr: [] }
	const voiceFilesCcbt =
		enableModelsVoices && heroDataCcbt ? await getVoiceFiles(heroDataCcbt.profile.name) : { en: [], jp: [], kr: [] }

	// Get available scenes server-side (only if enabled)
	const availableScenes = enableModelsVoices ? await getAvailableScenes() : []

	return (
		<HeroPageWrapper
			heroDataCbt={heroDataCbt}
			heroDataCcbt={heroDataCcbt}
			heroDataLegacy={heroDataLegacy}
			costumesCbt={costumesCbt}
			costumesCcbt={costumesCcbt}
			costumesLegacy={costumesLegacy}
			heroModelsCbt={heroModelsCbt}
			heroModelsCcbt={heroModelsCcbt}
			heroModelsLegacy={heroModelsLegacy}
			voiceFilesCbt={voiceFilesCbt}
			voiceFilesCcbt={voiceFilesCcbt}
			voiceFilesLegacy={voiceFilesLegacy}
			availableScenes={availableScenes}
			enableModelsVoices={enableModelsVoices}
		/>
	)
}
