import fs from "fs"
import path from "path"

interface Hero {
	name: string
}

export default async function Home() {
	// Move the data fetching logic directly into the component
	const heroesDir = path.join(process.cwd(), "kingsraid-data", "table-data", "heroes")

	let heroes: Hero[] = []

	if (fs.existsSync(heroesDir)) {
		const files = fs.readdirSync(heroesDir)
		heroes = files
			.filter((file) => file.endsWith(".json"))
			.map((file) => {
				const heroName = path.basename(file, ".json")
				const filePath = path.join(heroesDir, file)
				const heroData = JSON.parse(fs.readFileSync(filePath, "utf8"))
				return { name: heroName, ...heroData }
			})
	}

	return (
		<div className="p-4">
			<h1>Heroes ({heroes.length})</h1>
			<ul>
				{heroes.map((hero) => (
					<li key={hero.name}>{hero.name}</li>
				))}
			</ul>
		</div>
	)
}
