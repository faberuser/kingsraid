import SlugPage from "@/app/bosses/[...slug]/page"
import { InterceptedDialog } from "@/components/modal/intercepted-dialog"
import { SlugPageProps } from "@/lib/get-data"

export default async function ModalSlugPage(props: SlugPageProps) {
	const params = await props.params
	const slugUrl = params.slug.join("/")

	return (
		<InterceptedDialog href={`/bosses/${slugUrl}`}>
			<SlugPage {...props} />
		</InterceptedDialog>
	)
}
