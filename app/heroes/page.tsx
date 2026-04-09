import { HeroData } from "@/model/Hero"
import HeroesPageWrapper from "@/app/heroes/page-wrapper"
import { getData, getJsonDataList, getHeroReleaseOrder, fetchAllVersions } from "@/lib/get-data"

// Available hero classes
const heroClasses = [
	{ value: "all", name: "All", icon: "All" },
	{ value: "knight", name: "Knight", icon: "/kingsraid-data/assets/classes/knight.png" },
	{ value: "warrior", name: "Warrior", icon: "/kingsraid-data/assets/classes/warrior.png" },
	{ value: "archer", name: "Archer", icon: "/kingsraid-data/assets/classes/archer.png" },
	{ value: "mechanic", name: "Mechanic", icon: "/kingsraid-data/assets/classes/mechanic.png" },
	{ value: "wizard", name: "Wizard", icon: "/kingsraid-data/assets/classes/wizard.png" },
	{ value: "assassin", name: "Assassin", icon: "/kingsraid-data/assets/classes/assassin.png" },
	{ value: "priest", name: "Priest", icon: "/kingsraid-data/assets/classes/priest.png" },
]

export default async function HeroesPage() {
	// Fetch heroes data for all versions
	const heroesMap = await fetchAllVersions<HeroData[]>(
		async (version) => (await getData("heroes", { dataVersion: version })) as HeroData[],
	)

	// Fetch release order for all versions
	const releaseOrderMap = await fetchAllVersions<Record<string, string>>(
		async (version) => await getHeroReleaseOrder(version),
	)

	const saReverse = (await getJsonDataList("table-data/sa_reverse.json")) as string[]

	// Get hero names for each version
	// const heroNamesMap = await fetchAllVersions<string[]>(async (version) => await getHeroNamesForVersion(version))

	return (
		<HeroesPageWrapper
			heroesMap={heroesMap}
			heroClasses={heroClasses}
			releaseOrderMap={releaseOrderMap}
			saReverse={saReverse}
			// heroNamesMap={heroNamesMap}
		/>
	)
}
