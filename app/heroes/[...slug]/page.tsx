import fs from "fs"
import path from "path"
import { Hero } from "@/model/Hero"
import { notFound } from "next/navigation"
import SlugClient from "./client"
import { capitalize } from "@/lib/utils"

interface Costume {
	name: string
	path: string
	displayName: string
}

async function getHeroData(heroName: string): Promise<Hero | null> {
	const heroesDir = path.join(process.cwd(), "kingsraid-data", "table-data", "heroes")
	const filePath = path.join(heroesDir, `${heroName}.json`)

	if (!fs.existsSync(filePath)) {
		return null
	}

	try {
		const heroData = JSON.parse(fs.readFileSync(filePath, "utf8"))
		return { name: heroName, ...heroData }
	} catch (error) {
		console.error(`Error loading hero data for ${heroName}:`, error)
		return null
	}
}

async function getCostumeData(costumePath: string): Promise<Costume[]> {
	if (!costumePath) return []

	try {
		const fullPath = path.join(process.cwd(), "public", "assets", costumePath)

		if (!fs.existsSync(fullPath)) {
			return []
		}

		const files = fs.readdirSync(fullPath)
		const imageFiles = files.filter((file) => file.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp)$/))

		const costumes: Costume[] = imageFiles.map((filename) => {
			// Remove file extension for display name
			const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg|gif|webp)$/i, "")

			// Create a more readable display name
			let displayName = nameWithoutExt

			// Handle numbered costumes (cos_01, cos_02, etc.)
			if (nameWithoutExt.match(/^cos_\d+$/)) {
				const number = nameWithoutExt.replace("cos_", "")
				displayName = `Costume ${parseInt(number)}`
			} else {
				// Capitalize and format other costume names
				displayName = capitalize(nameWithoutExt.replace(/_/g, " "))
			}

			return {
				name: nameWithoutExt,
				path: `${costumePath}/${filename}`,
				displayName,
			}
		})

		// Sort costumes: numbered ones first, then alphabetically
		costumes.sort((a, b) => {
			const aIsNumbered = a.name.match(/^cos_\d+$/)
			const bIsNumbered = b.name.match(/^cos_\d+$/)

			if (aIsNumbered && bIsNumbered) {
				// Both are numbered, sort by number
				const aNum = parseInt(a.name.replace("cos_", ""))
				const bNum = parseInt(b.name.replace("cos_", ""))
				return aNum - bNum
			} else if (aIsNumbered) {
				// Only a is numbered, it comes first
				return -1
			} else if (bIsNumbered) {
				// Only b is numbered, it comes first
				return 1
			} else {
				// Neither is numbered, sort alphabetically
				return a.displayName.localeCompare(b.displayName)
			}
		})

		return costumes
	} catch (error) {
		console.error("Error reading costume directory:", error)
		return []
	}
}

interface SlugPageProps {
	params: Promise<{
		slug: string[]
	}>
}

export default async function SlugPage({ params }: SlugPageProps) {
	const { slug } = await params
	const heroName = slug?.[0]

	if (!heroName) {
		notFound()
	}

	const decodedHeroName = decodeURIComponent(heroName)
	const heroData = await getHeroData(capitalize(decodedHeroName))

	if (!heroData) {
		notFound()
	}

	// Get costume data server-side
	const costumes = await getCostumeData(heroData.costumes)

	return <SlugClient heroData={heroData} costumes={costumes} />
}
