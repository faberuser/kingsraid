import fs from "fs"
import path from "path"
import { Hero } from "@/model/Hero"
import { notFound } from "next/navigation"
import SlugClient from "./client"
import { capitalize } from "@/lib/utils"

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

	const heroData = await getHeroData(capitalize(heroName))

	if (!heroData) {
		notFound()
	}

	return <SlugClient heroData={heroData} />
}
