import SlugPage from "@/app/artifacts/[...slug]/page"
import { SlugPageProps } from "@/lib/get-data"

export default async function ModalSlugPage(props: SlugPageProps) {
	return <SlugPage {...props} />
}
