import "@/app/globals.css"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"

const title = process.env.NEXT_PUBLIC_TITLE || "Some Cool Title"
const description = process.env.NEXT_PUBLIC_DESCRIPTION || "Indexer for Some Cool Title"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title,
	description,
	openGraph: {
		title,
		description,
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<SidebarProvider>
						<div className="flex h-screen w-full">
							<AppSidebar title={title} />
							<main className="flex-1 overflow-auto">
								<div suppressHydrationWarning>{children}</div>
							</main>
						</div>
					</SidebarProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
