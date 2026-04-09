import SlugPage from "@/app/artifacts/[...slug]/page"
import { InterceptedDialog } from "@/components/modal/intercepted-dialog"
import { SlugPageProps } from "@/lib/get-data"

export default async function ModalSlugPage(props: SlugPageProps) {
	return (
		<InterceptedDialog>
			<SlugPage {...props} />
		</InterceptedDialog>
	)
}
