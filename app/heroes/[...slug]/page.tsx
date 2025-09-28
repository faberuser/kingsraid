import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import SlugClient from "@/app/heroes/[...slug]/client"
import { capitalize } from "@/lib/utils"
import { SlugPageProps, getDirData } from "@/components/server/get-data"
import { HeroData } from "@/model/Hero"

interface Costume {
	name: string
	path: string
	displayName: string
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
				path: `${costumePath}/${encodeURIComponent(filename)}`,
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

export default async function SlugPage({ params }: SlugPageProps) {
	const { slug } = await params
	const heroName = slug?.[0]

	if (!heroName) {
		notFound()
	}

	const heroData = (await getDirData(heroName, "heroes")) as HeroData | null

	if (!heroData) {
		notFound()
	}

	// Get costume data server-side
	const costumes = await getCostumeData(heroData.costumes)

	return <SlugClient heroData={heroData} costumes={costumes} />
}
