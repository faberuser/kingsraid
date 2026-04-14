import SlugPage, { generateStaticParams } from "@/app/heroes/[...slug]/page"
import { SlugPageProps } from "@/lib/get-data"

export { generateStaticParams }

export default async function ModalSlugPage(props: SlugPageProps) {
	return <SlugPage {...props} />
}
