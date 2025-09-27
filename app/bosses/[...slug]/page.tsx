import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import BossClient from "@/app/bosses/[...slug]/client"
import { BossData } from "@/model/Boss"

async function getBossData(bossName: string): Promise<BossData | null> {
	try {
		const bossesDir = path.join(process.cwd(), "kingsraid-data", "table-data", "bosses")
		const files = fs.readdirSync(bossesDir)

		// Try to find boss by exact name match (case insensitive)
		let targetFile = files.find((file) => file.toLowerCase().replace(".json", "") === bossName.toLowerCase())

		// If not found by filename, search by class name or aliases in the JSON files
		if (!targetFile) {
			for (const file of files.filter((f) => f.endsWith(".json"))) {
				try {
					const filePath = path.join(bossesDir, file)
					const fileContent = fs.readFileSync(filePath, "utf-8")
					const bossData = JSON.parse(fileContent)

					// Check class name match
					if (bossData.infos?.class?.toLowerCase() === bossName.toLowerCase()) {
						targetFile = file
						break
					}

					// Check aliases match
					if (bossData.aliases && Array.isArray(bossData.aliases)) {
						if (bossData.aliases.some((alias: string) => alias.toLowerCase() === bossName.toLowerCase())) {
							targetFile = file
							break
						}
					}
				} catch (error) {
					console.error(`Error reading file ${file}:`, error)
					continue
				}
			}
		}

		if (!targetFile) {
			return null
		}

		const filePath = path.join(bossesDir, targetFile)
		const fileContent = fs.readFileSync(filePath, "utf-8")
		const bossData = JSON.parse(fileContent)

		return bossData
	} catch (error) {
		console.error("Error reading boss data:", error)
		return null
	}
}

interface SlugPageProps {
	params: Promise<{
		slug: string[]
	}>
}

export default async function SlugPage({ params }: SlugPageProps) {
	const { slug } = await params
	const bossName = slug?.[0]

	if (!bossName) {
		notFound()
	}

	const decodedBossName = decodeURIComponent(bossName)
	const bossData = await getBossData(decodedBossName)

	if (!bossData) {
		notFound()
	}

	return <BossClient bossData={bossData} />
}
