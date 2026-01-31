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

	// Check if hero exists in CBT Phase 1 and CCBT data and fetch if it does
	const existsInCbtPhase1 = await heroExistsInVersion(heroName, "cbt-phase-1")
	const existsInCcbt = await heroExistsInVersion(heroName, "ccbt")

	const heroDataCbtPhase1 = existsInCbtPhase1
		? ((await findData(heroName, "heroes", { dataVersion: "cbt-phase-1" })) as HeroData | null)
		: null
	const heroDataCcbt = existsInCcbt
		? ((await findData(heroName, "heroes", { dataVersion: "ccbt" })) as HeroData | null)
		: null

	// Get costume data server-side for all versions
	const costumesLegacy = await getCostumeData(heroDataLegacy.costumes)
	const costumesCbtPhase1 = heroDataCbtPhase1 ? await getCostumeData(heroDataCbtPhase1.costumes) : []
	const costumesCcbt = heroDataCcbt ? await getCostumeData(heroDataCcbt.costumes) : []

	// Get model data server-side (only if enabled)
	const heroModelsLegacy = enableModelsVoices ? await getHeroModels(heroDataLegacy.profile.name) : {}
	const heroModelsCbtPhase1 =
		enableModelsVoices && heroDataCbtPhase1 ? await getHeroModels(heroDataCbtPhase1.profile.name) : {}
	const heroModelsCcbt = enableModelsVoices && heroDataCcbt ? await getHeroModels(heroDataCcbt.profile.name) : {}

	// Get voice files server-side (only if enabled)
	const voiceFilesLegacy = enableModelsVoices
		? await getVoiceFiles(heroDataLegacy.profile.name)
		: { en: [], jp: [], kr: [] }
	const voiceFilesCbtPhase1 =
		enableModelsVoices && heroDataCbtPhase1
			? await getVoiceFiles(heroDataCbtPhase1.profile.name)
			: { en: [], jp: [], kr: [] }
	const voiceFilesCcbt =
		enableModelsVoices && heroDataCcbt ? await getVoiceFiles(heroDataCcbt.profile.name) : { en: [], jp: [], kr: [] }

	// Get available scenes server-side (only if enabled)
	const availableScenes = enableModelsVoices ? await getAvailableScenes() : []

	return (
		<HeroPageWrapper
			heroDataCbtPhase1={heroDataCbtPhase1}
			heroDataCcbt={heroDataCcbt}
			heroDataLegacy={heroDataLegacy}
			costumesCbtPhase1={costumesCbtPhase1}
			costumesCcbt={costumesCcbt}
			costumesLegacy={costumesLegacy}
			heroModelsCbtPhase1={heroModelsCbtPhase1}
			heroModelsCcbt={heroModelsCcbt}
			heroModelsLegacy={heroModelsLegacy}
			voiceFilesCbtPhase1={voiceFilesCbtPhase1}
			voiceFilesCcbt={voiceFilesCcbt}
			voiceFilesLegacy={voiceFilesLegacy}
			availableScenes={availableScenes}
			enableModelsVoices={enableModelsVoices}
		/>
	)
}
