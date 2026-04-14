import SlugPage, { generateStaticParams } from "@/app/bosses/[...slug]/page"
import { SlugPageProps } from "@/lib/get-data"

export { generateStaticParams }

export default async function ModalSlugPage(props: SlugPageProps) {
	return <SlugPage {...props} />
}
