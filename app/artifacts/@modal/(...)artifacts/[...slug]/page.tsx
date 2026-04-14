import SlugPage, { generateStaticParams } from "@/app/artifacts/[...slug]/page"
import { SlugPageProps } from "@/lib/get-data"

export { generateStaticParams }

export default async function ModalSlugPage(props: SlugPageProps) {
	return <SlugPage {...props} />
}
