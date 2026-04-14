"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { HeroesDialogShell } from "@/components/modal/heroes-dialog-shell"

export function ArtifactsLayoutClient({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
	const pathname = usePathname()
	const hasModal = pathname !== "/artifacts" && pathname.startsWith("/artifacts/")

	return (
		<>
			<div className="main-content-list w-full">{children}</div>
			<HeroesDialogShell hasModal={hasModal}>{modal}</HeroesDialogShell>
		</>
	)
}
