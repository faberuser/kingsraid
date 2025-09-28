import type { Metadata } from "next"
import fs from "fs"
import path from "path"
import { HeroData } from "@/model/Hero"
import { capitalize } from "@/lib/utils"

async function getHeroData(heroName: string): Promise<HeroData | null> {
	const heroesDir = path.join(process.cwd(), "kingsraid-data", "table-data", "heroes")
	const normalizedSlug = capitalize(heroName.toLowerCase().replace(/-/g, " "))
	const filePath = path.join(heroesDir, `${normalizedSlug}.json`)

	if (!fs.existsSync(filePath)) {
		return null
	}

	try {
		const heroData = JSON.parse(fs.readFileSync(filePath, "utf8"))
		return { name: normalizedSlug, ...heroData }
	} catch (error) {
		console.error(error)
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
