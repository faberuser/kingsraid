"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import MobileMenu from "@/components/mobile-menu"
import { SidebarInset } from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"

export default function SidebarInsetClient({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const pathname = usePathname()

	return (
		<SidebarInset className={`${pathname !== "/" && "container mx-auto p-4 pt-2 sm:p-8"}`}>
			{/* Back Button */}
			<div
				className={`mb-2 flex flex-row items-center ${
					pathname === "/" ? "p-4 mt-0.5 justify-end md:hidden" : "justify-between"
				}`}
			>
				{pathname !== "/" && (
					<Button variant="ghost" className="gap-2 has-[>svg]:px-0 p-0" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
						Back
					</Button>
				)}
				<div className="md:hidden">
					<MobileMenu />
				</div>
			</div>
			<main className="w-full">{children}</main>
		</SidebarInset>
	)
}
