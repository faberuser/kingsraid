import type { Metadata } from "next"
import fs from "fs"
import path from "path"
import { BossData } from "@/model/Boss"

async function getBossData(bossName: string): Promise<BossData | null> {
	try {
		const bossesDir = path.join(process.cwd(), "kingsraid-data", "table-data", "bosses")
		const files = fs.readdirSync(bossesDir)
		const jsonFiles = files.filter((file) => file.endsWith(".json"))

		// Convert slug back to boss name format
		const normalizedSlug = bossName.toLowerCase().replace(/-/g, " ")

		for (const file of jsonFiles) {
			const filePath = path.join(bossesDir, file)
			const fileContent = fs.readFileSync(filePath, "utf-8")
			const bossData: BossData = JSON.parse(fileContent)

			// Check if boss class matches (case insensitive)
			if (bossData.infos?.class?.toLowerCase() === normalizedSlug) {
				return bossData
			}

			// Check if file name matches (case insensitive)
			const fileName = path.basename(file, ".json")
			if (fileName.toLowerCase().replace(/-/g, " ") === normalizedSlug) {
				return bossData
			}
		}

		return null
	} catch (error) {
		console.error("Error reading boss data:", error)
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
	const displayName = bossData.infos?.class || bossName

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
