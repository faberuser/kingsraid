import type { Metadata } from "next"
import fs from "fs"
import path from "path"
import { Hero } from "@/model/Hero"

async function getHeroData(heroName: string): Promise<Hero | null> {
	try {
		const heroesDir = path.join(process.cwd(), "kingsraid-data", "table-data", "heroes")

		// Convert slug back to hero name format
		const normalizedSlug = heroName.toLowerCase().replace(/-/g, " ")

		if (!fs.existsSync(heroesDir)) {
			return null
		}

		const files = fs.readdirSync(heroesDir)
		const jsonFiles = files.filter((file) => file.endsWith(".json"))

		for (const file of jsonFiles) {
			const heroFileName = path.basename(file, ".json")

			// Check if file name matches (case insensitive)
			if (
				heroFileName.toLowerCase() === normalizedSlug ||
				heroFileName.toLowerCase().replace(/[-_]/g, " ") === normalizedSlug
			) {
				const filePath = path.join(heroesDir, file)
				const heroData = JSON.parse(fs.readFileSync(filePath, "utf8"))
				return { name: heroFileName, ...heroData }
			}
		}

		// Try partial matching
		for (const file of jsonFiles) {
			const heroFileName = path.basename(file, ".json")
			if (
				heroFileName.toLowerCase().includes(normalizedSlug) ||
				normalizedSlug.includes(heroFileName.toLowerCase())
			) {
				const filePath = path.join(heroesDir, file)
				const heroData = JSON.parse(fs.readFileSync(filePath, "utf8"))
				return { name: heroFileName, ...heroData }
			}
		}

		return null
	} catch (error) {
		console.error("Error reading hero data:", error)
		return null
	}
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
	const { slug } = await params

	if (!slug || slug.length === 0) {
		return {
			title: "All Heroes - King's Raid",
			description: "Discover heroes, skills, gears, and more.",
			openGraph: {
				title: "All Heroes - King's Raid",
				description: "Discover heroes, skills, gears, and more.",
			},
		}
	}

	const heroName = decodeURIComponent(slug[0])
	const heroData = await getHeroData(heroName)

	if (!heroData) {
		return {
			title: "Hero Not Found - King's Raid",
			description: "The requested hero could not be found.",
			openGraph: {
				title: "Hero Not Found - King's Raid",
				description: "The requested hero could not be found.",
			},
		}
	}

	const displayName = heroData.name

	return {
		title: `${displayName} - Heroes - King's Raid`,
		description: `View hero ${displayName} details.`,
		openGraph: {
			title: `${displayName} - Heroes - King's Raid`,
			description: `View hero ${displayName} details.`,
		},
	}
}

export default function HeroesLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
