import "@/app/globals.css"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import SidebarWrapper from "@/components/sidebar/sidebar-wrapper"
import SidebarInsetClient from "@/components/sidebar/sidebar-inset-client"
import { HeroToggleProvider } from "@/contexts/hero-toggle-context"
import { HeroDataVersionProvider } from "@/hooks/use-hero-data-version"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "King's Raid",
	description: "Comprehensive resource for Kings Raid",
	openGraph: {
		title: "King's Raid",
		description: "Comprehensive resource for Kings Raid",
		url: process.env.NEXT_PUBLIC_SITE_URL || "https://kingsraid.k-clowd.top",
		siteName: "King's Raid",
	},
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://kingsraid.k-clowd.top"),
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<>
			<html lang="en" suppressHydrationWarning>
				<head />
				<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
						<HeroDataVersionProvider>
							<HeroToggleProvider>
								<SidebarProvider>
									<SidebarWrapper />
									<SidebarInsetClient>{children}</SidebarInsetClient>
								</SidebarProvider>
							</HeroToggleProvider>
						</HeroDataVersionProvider>
					</ThemeProvider>
				</body>
			</html>
		</>
	)
}
