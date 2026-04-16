import { HeroData } from "@/model/Hero"
import HeroesPageWrapper from "@/app/heroes/page-wrapper"
import { getData, getJsonDataList, getHeroReleaseOrder, fetchAllVersions, getBlurDataURLMap } from "@/lib/get-data"
import { HERO_CLASSES } from "@/lib/constants"

export default async function HeroesPage() {
	// Fetch all independent data in parallel
	const [heroesMap, releaseOrderMap, saReverse] = await Promise.all([
		fetchAllVersions<HeroData[]>((version) => getData("heroes", { dataVersion: version }) as Promise<HeroData[]>),
		fetchAllVersions<Record<string, string>>((version) => getHeroReleaseOrder(version)),
		getJsonDataList("table-data/sa_reverse.json") as Promise<string[]>,
	])

	// Collect all unique image paths (splashart + icon) across all versions and generate blur placeholders
	const allSplasharts = new Set<string>()
	for (const heroes of Object.values(heroesMap)) {
		for (const hero of heroes) {
			if (hero.splashart) {
				const saPath = `/kingsraid-data/assets/${hero.splashart}`
				const icoPath = `/kingsraid-data/assets/${hero.splashart.replace(/sa\.png$/, "ico.png")}`
				allSplasharts.add(saPath)
				allSplasharts.add(icoPath)
			}
		}
	}
	const blurDataURLMap = await getBlurDataURLMap(Array.from(allSplasharts))

	return (
		<HeroesPageWrapper
			heroesMap={heroesMap}
			heroClasses={HERO_CLASSES}
			releaseOrderMap={releaseOrderMap}
			saReverse={saReverse}
			blurDataURLMap={blurDataURLMap}
		/>
	)
}
