import type { Metadata } from "next"
import fs from "fs"
import path from "path"
import { BossData } from "@/model/Boss"
import { capitalize } from "@/lib/utils"

async function getBossData(bossName: string): Promise<BossData | null> {
	const bossesDir = path.join(process.cwd(), "kingsraid-data", "table-data", "bosses")
	const normalizedSlug = capitalize(bossName.toLowerCase().replace(/-/g, " "))
	const filePath = path.join(bossesDir, `${normalizedSlug}.json`)

	if (!fs.existsSync(filePath)) {
		return null
	}

	try {
		const bossData = JSON.parse(fs.readFileSync(filePath, "utf-8"))
		return bossData
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
	const { slug } = await params

	if (!slug || slug.length === 0) {
		return {
			title: "All Bosses - King's Raid",
			description: "Study boss skills, mechanics and strategies.",
			openGraph: {
				title: "All Bosses - King's Raid",
				description: "Study boss skills, mechanics and strategies.",
			},
		}
	}

	const bossName = decodeURIComponent(slug[0])
	const bossData = await getBossData(bossName)

	if (!bossData) {
		return {
			title: "Boss Not Found - King's Raid",
			description: "The requested boss could not be found.",
			openGraph: {
				title: "Boss Not Found - King's Raid",
				description: "The requested boss could not be found.",
			},
		}
	}

	// Use only available properties from BossInfo
	const displayName = bossData.infos?.name || bossName

	return {
		title: `${displayName} - Bosses - King's Raid`,
		description: `View boss ${displayName} details.`,
		openGraph: {
			title: `${displayName} - Bosses - King's Raid`,
			description: `View boss ${displayName} details.`,
		},
	}
}

export default function BossesLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
