import BossesPageWrapper from "@/app/bosses/page-wrapper"
import { BossData } from "@/model/Boss"
import { getData, getJsonData } from "@/lib/get-data"

export default async function BossesPage() {
	const [bossesLegacy, bossesCcbt, bossesCbtPhase1] = await Promise.all([
		getData("bosses", { dataVersion: "legacy" }) as Promise<BossData[]>,
		getData("bosses", { dataVersion: "ccbt" }) as Promise<BossData[]>,
		getData("bosses", { dataVersion: "cbt-phase-1" }) as Promise<BossData[]>,
	])
	const bossTypeMap = await getJsonData("table-data/legacy/boss_type.json")
	const releaseOrder = await getJsonData("table-data/legacy/boss_release_order.json")

	return (
		<BossesPageWrapper
			bossesLegacy={bossesLegacy}
			bossesCcbt={bossesCcbt}
			bossesCbtPhase1={bossesCbtPhase1}
			bossTypeMap={bossTypeMap}
			releaseOrder={releaseOrder}
		/>
	)
}
