import SlugPage from "@/app/heroes/[...slug]/page"
import { InterceptedDialog } from "@/components/modal/intercepted-dialog"
import { SlugPageProps } from "@/lib/get-data"

export default async function ModalSlugPage(props: SlugPageProps) {
	const params = await props.params
	const slugUrl = params.slug.join("/")

	return (
		<InterceptedDialog href={`/heroes/${slugUrl}`}>
			<SlugPage {...props} />
		</InterceptedDialog>
	)
}
