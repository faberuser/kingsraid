"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { InterceptedDialog } from "@/components/modal/intercepted-dialog"

export function BossesLayoutClient({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
	const pathname = usePathname()
	const hasModal = pathname !== "/bosses" && pathname.startsWith("/bosses/")

	return (
		<>
			<div className="main-content-list w-full">{children}</div>
			<InterceptedDialog hasModal={hasModal}>{modal}</InterceptedDialog>
		</>
	)
}
