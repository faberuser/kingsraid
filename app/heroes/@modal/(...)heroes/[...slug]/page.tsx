import SlugPage from "@/app/heroes/[...slug]/page"
import { SlugPageProps } from "@/lib/get-data"

export default async function ModalSlugPage(props: SlugPageProps) {
	return <SlugPage {...props} />
}
