import { HeroData } from "@/model/Hero"
import HeroesPageWrapper from "@/app/heroes/page-wrapper"
import { getData, getJsonData, getJsonDataList, getNewDataHeroNames } from "@/lib/get-data"

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
	const heroesLegacy = (await getData("heroes", { useNewData: false })) as HeroData[]
	const heroesNew = (await getData("heroes", { useNewData: true })) as HeroData[]
	const releaseOrderLegacy = await getJsonData("table-data/hero_release_order.json")
	const releaseOrderNew = await getJsonData("table-data/hero_release_order_new.json")
	const saReverse = (await getJsonDataList("table-data/sa_reverse.json")) as string[]
	const newDataHeroNames = await getNewDataHeroNames()

	return (
		<HeroesPageWrapper
			heroesLegacy={heroesLegacy}
			heroesNew={heroesNew}
			heroClasses={heroClasses}
			releaseOrderLegacy={releaseOrderLegacy}
			releaseOrderNew={releaseOrderNew}
			saReverse={saReverse}
			newDataHeroNames={newDataHeroNames}
		/>
	)
}
