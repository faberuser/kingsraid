import BossesPageWrapper from "@/app/bosses/page-wrapper"
import { BossData } from "@/model/Boss"
import { getData, getJsonData, fetchAllVersions } from "@/lib/get-data"

export default async function BossesPage() {
	const bossesMap = await fetchAllVersions<BossData[]>(
		(version) => getData("bosses", { dataVersion: version }) as Promise<BossData[]>,
	)

	const bossTypeMap = await getJsonData("table-data/legacy/boss_type.json")
	const releaseOrderMap = await fetchAllVersions<Record<string, string>>((version) =>
		getJsonData(`table-data/${version}/boss_release_order.json`),
	)

	return <BossesPageWrapper bossesMap={bossesMap} bossTypeMap={bossTypeMap} releaseOrderMap={releaseOrderMap} />
}
