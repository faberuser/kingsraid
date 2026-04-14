"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

/**
 * Persistent dialog shell that lives in the layout and stays mounted across
 * intercepted route navigations. This prevents the flash-close/reopen that
 * occurs when the @modal slot unmounts and remounts on router.replace().
 *
 * The modal slot content renders as children of this shell.
 * When no modal is active (children is null/the default slot), the dialog closes.
 */
export function InterceptedDialog({ children, hasModal }: { children: React.ReactNode; hasModal: boolean }) {
	const router = useRouter()
	const pathname = usePathname()
	const [isFullPage, setIsFullPage] = React.useState(false)
	const isMobile = useIsMobile()
	const dialogContentRef = React.useRef<HTMLDivElement>(null)

	const shouldRenderFull = isMobile || isFullPage

	// When the modal slot becomes inactive, reset full-page state
	React.useEffect(() => {
		if (!hasModal) {
			setIsFullPage(false)
		}
	}, [hasModal])

	// On mobile, scroll to top when modal opens and restore position when it closes
	const savedScrollY = React.useRef(0)
	React.useEffect(() => {
		if (shouldRenderFull && hasModal) {
			savedScrollY.current = window.scrollY
			window.scrollTo({ top: 0, behavior: "instant" })
		} else if (!hasModal && savedScrollY.current !== 0) {
			window.scrollTo({ top: savedScrollY.current, behavior: "instant" })
			savedScrollY.current = 0
		}
	}, [shouldRenderFull, hasModal])

	// Reset scroll to top on navigation between items (pathname changes while modal is open)
	const prevPathname = React.useRef(pathname)
	React.useEffect(() => {
		if (!hasModal) {
			prevPathname.current = pathname
			return
		}
		if (pathname !== prevPathname.current) {
			prevPathname.current = pathname
			// Desktop: scroll the dialog content container
			if (dialogContentRef.current) {
				dialogContentRef.current.scrollTop = 0
			}
			// Mobile / full-page: scroll the window
			if (shouldRenderFull) {
				window.scrollTo({ top: 0, behavior: "instant" })
			}
		}
	}, [pathname, hasModal, shouldRenderFull])

	React.useEffect(() => {
		if (shouldRenderFull && hasModal) {
			document.body.classList.add("intercepted-mobile-open")
		} else {
			document.body.classList.remove("intercepted-mobile-open")
		}
		return () => {
			document.body.classList.remove("intercepted-mobile-open")
		}
	}, [shouldRenderFull, hasModal])

	const onOpenChange = React.useCallback(
		(open: boolean) => {
			if (!open) {
				router.back()
			}
		},
		[router],
	)

	const handleSetFullPage = React.useCallback(() => {
		setIsFullPage(true)
	}, [])

	if (!hasModal) {
		return null
	}

	if (shouldRenderFull) {
		return <div className="w-full h-full pb-8">{children}</div>
	}

	return (
		<Dialog open={hasModal} onOpenChange={onOpenChange}>
			<DialogContent
				ref={dialogContentRef}
				className="max-w-[95vw] w-full max-h-[95vh] h-full overflow-y-auto custom-scrollbar sm:max-w-7xl bg-background/70 backdrop-blur-sm shadow-xl"
			>
				<DialogTitle className="sr-only">View Item</DialogTitle>
				<DialogDescription className="sr-only">Item Details</DialogDescription>
				<div className="absolute left-4 top-4 z-50">
					<Button variant="outline" size="sm" onClick={handleSetFullPage}>
						<ExternalLink className="mr-1 h-4 w-4" />
						Open Full Page
					</Button>
				</div>
				<div className="pt-10">{children}</div>
			</DialogContent>
		</Dialog>
	)
}
