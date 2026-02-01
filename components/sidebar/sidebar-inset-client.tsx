"use client"

import { ArrowLeft, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import MobileMenu from "@/components/mobile-menu"
import { SidebarInset } from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import { useDataVersion, DataVersion, DataVersionLabels, DataVersionDescriptions } from "@/hooks/use-data-version"
import { useHeroToggle } from "@/contexts/version-toggle-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MobileTooltip } from "@/components/mobile-tooltip"
import { CompareToggle } from "@/components/compare"
import { useCompareMode } from "@/hooks/use-compare-mode"

export default function SidebarInsetClient({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const pathname = usePathname()
	const { version, setVersion } = useDataVersion()
	const { showToggle, availableVersions } = useHeroToggle()
	const { isCompareMode } = useCompareMode()

	return (
		<SidebarInset className={`${pathname !== "/" && "container mx-auto p-4 pt-2 sm:p-8 sm:pt-4"}`}>
			{/* Back Button */}
			<div
				className={`mb-2 flex flex-row items-center gap-2 flex-wrap ${
					pathname === "/" ? "p-4 pt-2.5 justify-end md:hidden" : "justify-between"
				}`}
			>
				{pathname !== "/" && (
					<Button variant="ghost" className="gap-2 has-[>svg]:px-0 p-0" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
						Back
					</Button>
				)}
				{showToggle && availableVersions.length > 0 && (
					<div className="flex items-center gap-2 flex-wrap">
						{/* Compare Toggle - show when multiple versions available */}
						{availableVersions.length > 1 && <CompareToggle availableVersions={availableVersions} />}

						{/* Version Selector - hide when in compare mode */}
						{!isCompareMode && (
							<>
								<MobileTooltip
									content={<div className="text-sm">{DataVersionDescriptions[version]}</div>}
								>
									<Info className="h-4 w-4 text-muted-foreground" />
								</MobileTooltip>
								<Select
									key={availableVersions.join(",")}
									value={version}
									onValueChange={(value) => setVersion(value as DataVersion)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Version" />
									</SelectTrigger>
									<SelectContent>
										{availableVersions.map((opt) => (
											<SelectItem key={opt} value={opt}>
												{DataVersionLabels[opt]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</>
						)}
					</div>
				)}
				<div className="md:hidden">
					<MobileMenu />
				</div>
			</div>
			<main className="w-full">{children}</main>
		</SidebarInset>
	)
}
