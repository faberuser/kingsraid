"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export function InterceptedDialog({ children, href }: { children: React.ReactNode; href: string }) {
	const router = useRouter()
	const [open, setOpen] = React.useState(true)

	React.useEffect(() => {
		console.log("Modal opened for:", href)
	}, [href])

	const onOpenChange = React.useCallback(
		(open: boolean) => {
			if (!open) {
				setOpen(false)
				router.back()
			}
		},
		[router],
	)

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
							// Using location.href forces a hard reload, bypassing the intercept
							window.location.href = href
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
