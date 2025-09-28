import fs from "fs"
import path from "path"
import { HeroData } from "@/model/Hero"
import HeroesClient from "@/app/heroes/client"

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

async function getHeroes(): Promise<HeroData[]> {
	const heroesDir = path.join(process.cwd(), "kingsraid-data", "table-data", "heroes")
	if (!fs.existsSync(heroesDir)) {
		return []
	}

	const files = fs.readdirSync(heroesDir)
	return files
		.filter((file) => file.endsWith(".json"))
		.map((file) => {
			const heroName = path.basename(file, ".json")
			const filePath = path.join(heroesDir, file)
			const heroData = JSON.parse(fs.readFileSync(filePath, "utf8"))
			return { name: heroName, ...heroData }
		})
		.sort((a, b) => a.name.localeCompare(b.name))
}

export default async function HeroesPage() {
	const heroes = await getHeroes()

	return <HeroesClient heroes={heroes} heroClasses={heroClasses} />
}
