import { HeroData } from "@/model/Hero"
import { ArtifactData } from "@/model/Artifact"
import { getData, getJsonDataList, getHeroReleaseOrder, getArtifactReleaseOrder } from "@/lib/get-data"
import fs from "fs"
import path from "path"
import TeamBuilderClient from "./client"

const heroClasses = [
	{ value: "all", name: "All", icon: "All" },
	{ value: "knight", name: "Knight", icon: "/kingsraid-data/assets/classes/knight.png" },
	{ value: "warrior", name: "Warrior", icon: "/kingsraid-data/assets/classes/warrior.png" },
	{ value: "archer", name: "Archer", icon: "/kingsraid-data/assets/classes/archer.png" },
	{ value: "mechanic", name: "Mechanic", icon: "/kingsraid-data/assets/classes/mechanic.png" },
	{ value: "wizard", name: "Wizard", icon: "/kingsraid-data/assets/classes/wizard.png" },
	{ value: "assassin", name: "Assassin", icon: "/kingsraid-data/assets/classes/assassin.png" },
	{ value: "priest", name: "Priest", icon: "/kingsraid-data/assets/classes/priest.png" },
]

interface ClassPerksData {
	perks: {
		t1?: Record<string, string>
		t2?: Record<string, string>
	}
}

async function getClassPerks(): Promise<{
	general: ClassPerksData
	classes: Record<string, ClassPerksData>
}> {
	const classesDir = path.join(process.cwd(), "public", "kingsraid-data", "table-data", "legacy", "classes")
	const result: {
		general: ClassPerksData
		classes: Record<string, ClassPerksData>
	} = {
		general: { perks: {} },
		classes: {},
	}

	try {
		// Read General.json for T1 perks
		const generalPath = path.join(classesDir, "General.json")
		if (fs.existsSync(generalPath)) {
			const content = fs.readFileSync(generalPath, "utf-8")
			result.general = JSON.parse(content)
		}

		// Read class-specific files for T2 perks
		const classNames = ["Knight", "Warrior", "Archer", "Mechanic", "Wizard", "Assassin", "Priest"]
		for (const className of classNames) {
			const classPath = path.join(classesDir, `${className}.json`)
			if (fs.existsSync(classPath)) {
				const content = fs.readFileSync(classPath, "utf-8")
				result.classes[className.toLowerCase()] = JSON.parse(content)
			}
		}
	} catch (error) {
		console.error("Error loading class perks:", error)
	}

	return result
}

export default async function TeamBuilderPage() {
	// Fetch all data versions
	const heroesLegacy = (await getData("heroes", { dataVersion: "legacy" })) as HeroData[]
	const heroesCcbt = (await getData("heroes", { dataVersion: "ccbt" })) as HeroData[]
	const heroesCbtPhase1 = (await getData("heroes", { dataVersion: "cbt-phase-1" })) as HeroData[]

	const artifactsLegacy = (await getData("artifacts", { dataVersion: "legacy" })) as ArtifactData[]

	const saReverse = (await getJsonDataList("table-data/sa_reverse.json")) as string[]

	// Fetch release orders
	const releaseOrderLegacy = await getHeroReleaseOrder("legacy")
	const releaseOrderCcbt = await getHeroReleaseOrder("ccbt")
	const releaseOrderCbtPhase1 = await getHeroReleaseOrder("cbt-phase-1")

	// Fetch artifact release order (artifacts only exist in legacy)
	const artifactReleaseOrder = await getArtifactReleaseOrder("legacy")

	const classPerks = await getClassPerks()

	return (
		<TeamBuilderClient
			heroesLegacy={heroesLegacy}
			heroesCcbt={heroesCcbt}
			heroesCbtPhase1={heroesCbtPhase1}
			artifacts={artifactsLegacy}
			artifactReleaseOrder={artifactReleaseOrder}
			saReverse={saReverse}
			classPerks={classPerks}
			heroClasses={heroClasses}
			releaseOrderLegacy={releaseOrderLegacy}
			releaseOrderCcbt={releaseOrderCcbt}
			releaseOrderCbtPhase1={releaseOrderCbtPhase1}
		/>
	)
}
