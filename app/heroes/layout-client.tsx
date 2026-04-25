"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { InterceptedDialog } from "@/components/intercepted-dialog"

export function HeroesLayoutClient({ children, modal }: { children: React.ReactNode; modal?: React.ReactNode }) {
	const pathname = usePathname()
	const hasModal = pathname !== "/heroes" && pathname.startsWith("/heroes/")

	return (
		<>
			<div className="main-content-list w-full">{children}</div>
			{modal !== undefined && <InterceptedDialog hasModal={hasModal}>{modal}</InterceptedDialog>}
		</>
	)
}
