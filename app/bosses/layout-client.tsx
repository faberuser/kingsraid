"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { HeroesDialogShell } from "@/components/modal/heroes-dialog-shell"

export function BossesLayoutClient({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
	const pathname = usePathname()
	const hasModal = pathname !== "/bosses" && pathname.startsWith("/bosses/")

	return (
		<>
			<div className="main-content-list w-full">{children}</div>
			<HeroesDialogShell hasModal={hasModal}>{modal}</HeroesDialogShell>
		</>
	)
}
