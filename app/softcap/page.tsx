import fs from "fs"
import path from "path"
import SoftcapPageWrapper from "@/app/softcap/page-wrapper"
import { fetchAllVersions } from "@/lib/get-data"

interface SoftcapData {
	[statName: string]: {
		MaxK: number
		X1: number
		A1: number
		B1: number
		X2: number
		A2: number
		B2: number
		MinK: number
		X3: number
		A3: number
		B3: number
		X4: number
		A4: number
		B4: number
	}
}

async function getSoftcapData(version: string): Promise<SoftcapData> {
	const filePath = path.join(process.cwd(), "public", "kingsraid-data", "table-data", version, "softcap.json")
	if (!fs.existsSync(filePath)) {
		return {}
	}
	const jsonData = fs.readFileSync(filePath, "utf8")
	return JSON.parse(jsonData)
}

export default async function SoftcapPage() {
	const softcapMap = await fetchAllVersions<SoftcapData>(async (version) => await getSoftcapData(version))

	return <SoftcapPageWrapper softcapMap={softcapMap} />
}
