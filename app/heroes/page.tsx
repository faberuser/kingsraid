import { HeroData } from "@/model/Hero"
import HeroesClient from "@/app/heroes/client"
import { getDirData, getJsonData, getJsonDataList } from "@/components/server/get-data"

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
	const heroes = (await getDirData("heroes")) as HeroData[]
	const releaseOrder = await getJsonData("release_order.json")
	const saReverse = (await getJsonDataList("sa_reverse.json")) as string[]

	return <HeroesClient heroes={heroes} heroClasses={heroClasses} releaseOrder={releaseOrder} saReverse={saReverse} />
}
