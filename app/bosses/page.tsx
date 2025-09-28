import BossesClient from "@/app/bosses/client"
import { BossData } from "@/model/Boss"
import { getDirData } from "@/components/server/get-data"

export default async function BossesPage() {
	const bosses = (await getDirData("bosses")) as BossData[]

	return <BossesClient bosses={bosses} />
}
