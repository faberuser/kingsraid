import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import HeroPageWrapper from "@/app/heroes/[...slug]/page-wrapper"
import { SlugPageProps, findData, fetchAllVersions, getHeroNamesForVersion } from "@/lib/get-data"
import { HeroData } from "@/model/Hero"
import { getCostumeData } from "@/app/heroes/[...slug]/models/getCostumes"
import { getHeroModels } from "@/app/heroes/[...slug]/models/getHeroModels"
import { getVoiceFiles } from "@/app/heroes/[...slug]/models/getVoices"
import { getAvailableScenes } from "@/app/heroes/[...slug]/models/getScenes"
import { ClassPerksData } from "@/components/heroes/perks"

const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true"
const enableModelsVoices = process.env.NEXT_PUBLIC_ENABLE_MODELS_VOICES === "true"

async function getClassPerks(dataVersion: string = "legacy"): Promise<ClassPerksData> {
	const classesDir = path.join(process.cwd(), "public", "kingsraid-data", "table-data", dataVersion, "classes")
	const result: ClassPerksData = {
		t1Perks: {},
		t2Perks: {},
	}

	try {
		// Read General.json for T1 perks
		const generalPath = path.join(classesDir, "General.json")
		if (fs.existsSync(generalPath)) {
			const content = fs.readFileSync(generalPath, "utf-8")
			const data = JSON.parse(content)
			result.t1Perks = data.perks?.t1 || {}
		}

		// Read class-specific files for T2 perks
		const classNames = ["Knight", "Warrior", "Archer", "Mechanic", "Wizard", "Assassin", "Priest"]
		for (const className of classNames) {
			const classPath = path.join(classesDir, `${className}.json`)
			if (fs.existsSync(classPath)) {
				const content = fs.readFileSync(classPath, "utf-8")
				const data = JSON.parse(content)
				result.t2Perks[className.toLowerCase()] = data.perks?.t2 || {}
			}
		}
	} catch (error) {
		console.error("Error loading class perks:", error)
	}

	return result
}

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

	// Fetch data for all versions
	const heroDataMap = await fetchAllVersions<HeroData | null>(async (version) => {
		if (version === "legacy") return heroDataLegacy
		return (await findData(heroName, "heroes", { dataVersion: version })) as HeroData | null
	})

	// Kick off independent data fetches in parallel (Rule 1.2: defer await, Rule 1.5: Promise.all)
	const costumesMapPromise = fetchAllVersions(async (version) => {
		const data = heroDataMap[version]
		return data ? await getCostumeData(data.costumes) : []
	})

	const heroModelsMapPromise = fetchAllVersions(async (version) => {
		const data = heroDataMap[version]
		return enableModelsVoices && data ? await getHeroModels(data.profile.name) : {}
	})

	const voiceFilesMapPromise = fetchAllVersions(async (version) => {
		const data = heroDataMap[version]
		return enableModelsVoices && data ? await getVoiceFiles(data.profile.name) : { en: [], jp: [], kr: [] }
	})

	const classPerksLegacy = await getClassPerks("legacy")
	const classPerksMapPromise = fetchAllVersions(async (version) => {
		if (version === "legacy") return classPerksLegacy
		return heroDataMap[version] ? await getClassPerks(version) : classPerksLegacy
	})

	const availableScenesPromise = enableModelsVoices ? getAvailableScenes() : Promise.resolve([])
	const allLegacyHeroesPromise = getHeroNamesForVersion("legacy")

	// Await all independent promises in parallel
	const [costumesMap, heroModelsMap, voiceFilesMap, classPerksMap, availableScenes, allLegacyHeroes] =
		await Promise.all([
			costumesMapPromise,
			heroModelsMapPromise,
			voiceFilesMapPromise,
			classPerksMapPromise,
			availableScenesPromise,
			allLegacyHeroesPromise,
		])

	// Get ordered list of all hero slugs for navigation
	const sortedHeroSlugs = allLegacyHeroes
		.sort((a, b) => a.localeCompare(b))
		.map((name) => name.toLowerCase().replace(/\s+/g, "-"))

	return (
		<HeroPageWrapper
			heroDataMap={heroDataMap}
			costumesMap={costumesMap}
			heroModelsMap={heroModelsMap}
			voiceFilesMap={voiceFilesMap}
			classPerksMap={classPerksMap}
			availableScenes={availableScenes}
			enableModelsVoices={enableModelsVoices}
			sortedHeroSlugs={sortedHeroSlugs}
		/>
	)
}
