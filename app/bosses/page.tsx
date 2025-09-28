import BossesClient from "@/app/bosses/client"
import { BossData } from "@/model/Boss"
import { getData } from "@/components/server/get-data"

export default async function BossesPage() {
	const bosses = (await getData("bosses")) as BossData[]

	return <BossesClient bosses={bosses} />
}
