import { HeroData } from "@/model/Hero"
import HeroesPageWrapper from "@/app/heroes/page-wrapper"
import { getData, getJsonDataList, getHeroNamesForVersion, getHeroReleaseOrder } from "@/lib/get-data"

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
	// Fetch heroes data for all three versions
	const heroesCbt = (await getData("heroes", { heroDataVersion: "cbt" })) as HeroData[]
	const heroesCcbt = (await getData("heroes", { heroDataVersion: "ccbt" })) as HeroData[]
	const heroesLegacy = (await getData("heroes", { heroDataVersion: "legacy" })) as HeroData[]

	// Fetch release order for all three versions
	const releaseOrderCbt = await getHeroReleaseOrder("cbt")
	const releaseOrderCcbt = await getHeroReleaseOrder("ccbt")
	const releaseOrderLegacy = await getHeroReleaseOrder("legacy")

	const saReverse = (await getJsonDataList("table-data/sa_reverse.json")) as string[]

	// Get hero names for each version
	const cbtHeroNames = await getHeroNamesForVersion("cbt")
	const ccbtHeroNames = await getHeroNamesForVersion("ccbt")

	return (
		<HeroesPageWrapper
			heroesCbt={heroesCbt}
			heroesCcbt={heroesCcbt}
			heroesLegacy={heroesLegacy}
			heroClasses={heroClasses}
			releaseOrderCbt={releaseOrderCbt}
			releaseOrderCcbt={releaseOrderCcbt}
			releaseOrderLegacy={releaseOrderLegacy}
			saReverse={saReverse}
			cbtHeroNames={cbtHeroNames}
			ccbtHeroNames={ccbtHeroNames}
		/>
	)
}
