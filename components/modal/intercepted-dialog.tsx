"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export function InterceptedDialog({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const [open, setOpen] = React.useState(true)
	const [isFullPage, setIsFullPage] = React.useState(false)
	const isMobile = useIsMobile()

	const shouldRenderFull = isMobile || isFullPage

	React.useEffect(() => {
		if (shouldRenderFull) {
			document.body.classList.add("intercepted-mobile-open")
		} else {
			document.body.classList.remove("intercepted-mobile-open")
		}

		return () => {
			document.body.classList.remove("intercepted-mobile-open")
		}
	}, [shouldRenderFull])

	const onOpenChange = React.useCallback(
		(open: boolean) => {
			if (!open) {
				setOpen(false)
				router.back()
			}
		},
		[router],
	)

	if (shouldRenderFull) {
		return <div className="w-full h-full pb-8">{children}</div>
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full overflow-y-auto sm:max-w-7xl">
				<DialogTitle className="sr-only">View Item</DialogTitle>
				<DialogDescription className="sr-only">Item Details</DialogDescription>
				<div className="absolute left-4 top-4 z-50">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setIsFullPage(true)
						}}
					>
						<ExternalLink className="mr-2 h-4 w-4" />
						Open Full Page
					</Button>
				</div>
				<div className="pt-10">{children}</div>
			</DialogContent>
		</Dialog>
	)
}
