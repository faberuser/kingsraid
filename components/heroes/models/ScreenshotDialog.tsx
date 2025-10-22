"use client"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Copy, Download } from "lucide-react"

interface ScreenshotDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	screenshotUrl: string | null
	onDownload: () => void
	onCopyToClipboard: () => void
}

export function ScreenshotDialog({
	open,
	onOpenChange,
	screenshotUrl,
	onDownload,
	onCopyToClipboard,
}: ScreenshotDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Screenshot Captured</DialogTitle>
					<DialogDescription>Choose how you want to save your screenshot.</DialogDescription>
				</DialogHeader>
				{screenshotUrl && (
					<div className="flex justify-center">
						<img
							src={screenshotUrl}
							alt="Screenshot preview"
							className="max-w-full h-auto rounded-lg border"
						/>
					</div>
				)}
				<DialogFooter className="flex gap-2">
					<Button variant="outline" onClick={onCopyToClipboard}>
						<Copy className="h-4 w-4" />
						Copy to Clipboard
					</Button>
					<Button onClick={onDownload}>
						<Download className="h-4 w-4" />
						Download
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
