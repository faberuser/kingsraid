import { HeroData } from "@/model/Hero"
import HeroesClient from "@/app/heroes/client"
import { getData } from "@/components/server/get-data"

const heroClasses = [
	{ value: "all", name: "All", icon: "All" },
	{ value: "knight", name: "Knight", icon: "/assets/classes/knight.png" },
	{ value: "warrior", name: "Warrior", icon: "/assets/classes/warrior.png" },
	{ value: "archer", name: "Archer", icon: "/assets/classes/archer.png" },
	{ value: "mechanic", name: "Mechanic", icon: "/assets/classes/mechanic.png" },
	{ value: "wizard", name: "Wizard", icon: "/assets/classes/wizard.png" },
	{ value: "assassin", name: "Assassin", icon: "/assets/classes/assassin.png" },
	{ value: "priest", name: "Priest", icon: "/assets/classes/priest.png" },
]

export default async function HeroesPage() {
	const heroes = (await getData("heroes")) as HeroData[]

	return <HeroesClient heroes={heroes} heroClasses={heroClasses} />
}
