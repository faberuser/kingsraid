import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import BossClient from "@/app/bosses/[...slug]/client"
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
