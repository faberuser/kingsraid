import { HeroData } from "@/model/Hero"
import HeroesPageWrapper from "@/app/heroes/page-wrapper"
import { getData, getJsonDataList, getHeroReleaseOrder, fetchAllVersions } from "@/lib/get-data"
import { HERO_CLASSES } from "@/lib/constants"

export default async function HeroesPage() {
	// Fetch all independent data in parallel (Rule 1.5: Promise.all for independent operations)
	const [heroesMap, releaseOrderMap, saReverse] = await Promise.all([
		fetchAllVersions<HeroData[]>((version) => getData("heroes", { dataVersion: version }) as Promise<HeroData[]>),
		fetchAllVersions<Record<string, string>>((version) => getHeroReleaseOrder(version)),
		getJsonDataList("table-data/sa_reverse.json") as Promise<string[]>,
	])

	// Get hero names for each version
	// const heroNamesMap = await fetchAllVersions<string[]>(async (version) => await getHeroNamesForVersion(version))

	return (
		<HeroesPageWrapper
			heroesMap={heroesMap}
			heroClasses={HERO_CLASSES}
			releaseOrderMap={releaseOrderMap}
			saReverse={saReverse}
			// heroNamesMap={heroNamesMap}
		/>
	)
}
