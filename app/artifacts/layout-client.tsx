"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { InterceptedDialog } from "@/components/modal/intercepted-dialog"

export function ArtifactsLayoutClient({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
	const pathname = usePathname()
	const hasModal = pathname !== "/artifacts" && pathname.startsWith("/artifacts/")

	return (
		<>
			<div className="main-content-list w-full">{children}</div>
			<InterceptedDialog hasModal={hasModal}>{modal}</InterceptedDialog>
		</>
	)
}
