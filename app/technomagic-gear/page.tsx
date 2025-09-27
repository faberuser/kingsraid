import fs from "fs"
import path from "path"
import TechnomagicGearClient from "./client"

interface TechnomagicGearData {
	[gearName: string]: {
		colour: [number, number, number]
		classes: {
			[className: string]: string
		}
	}
}

async function getTechnomagicGearData(): Promise<TechnomagicGearData> {
	const filePath = path.join(process.cwd(), "kingsraid-data/table-data/technomagic_gear.json")
	const jsonData = fs.readFileSync(filePath, "utf8")
	return JSON.parse(jsonData)
}

export default async function TechnomagicGearPage() {
	const gearData = await getTechnomagicGearData()

	// Convert to array format for easier handling
	const gears = Object.entries(gearData).map(([name, data]) => ({
		name,
		...data,
	}))

	return <TechnomagicGearClient gears={gears} />
}
