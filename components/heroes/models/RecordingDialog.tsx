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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Download } from "lucide-react"

interface RecordingDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	recordingUrl: string | null
	downloadFormat: "webm" | "mp4" | "gif"
	setDownloadFormat: (format: "webm" | "mp4" | "gif") => void
	onDownload: () => void
	isConverting: boolean
}

export function RecordingDialog({
	open,
	onOpenChange,
	recordingUrl,
	downloadFormat,
	setDownloadFormat,
	onDownload,
	isConverting,
}: RecordingDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Recording Complete</DialogTitle>
					<DialogDescription>Choose your preferred format and download the animation.</DialogDescription>
				</DialogHeader>
				{recordingUrl && (
					<div className="flex justify-center">
						<video
							src={recordingUrl}
							controls
							autoPlay
							loop
							className="max-w-full h-auto rounded-lg border"
						/>
					</div>
				)}
				<div className="space-y-2">
					<label className="text-sm font-medium">Download Format</label>
					<RadioGroup value={downloadFormat} onValueChange={(value: any) => setDownloadFormat(value)}>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="webm" id="webm" />
							<label htmlFor="webm" className="text-sm cursor-pointer">
								WebM (Best quality, smallest file, modern browsers)
							</label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="mp4" id="mp4" />
							<label htmlFor="mp4" className="text-sm cursor-pointer">
								MP4 (Most compatible, works everywhere)
							</label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="gif" id="gif" />
							<label htmlFor="gif" className="text-sm cursor-pointer">
								GIF (Animated image, may have quality limitations)
							</label>
						</div>
					</RadioGroup>
					{downloadFormat === "gif" && (
						<p className="text-xs text-muted-foreground">
							Note: GIF may result in larger file sizes, reduced quality and longer conversion times.
						</p>
					)}
				</div>
				<DialogFooter className="flex gap-2">
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isConverting}>
						Close
					</Button>
					<Button onClick={onDownload} disabled={isConverting}>
						<Download className="h-4 w-4" />
						{isConverting ? "Converting..." : `Download as ${downloadFormat.toUpperCase()}`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
