import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Next keycloak POC',
    description: 'POC for Keycloak authentication with Next.js',
    generator: 'v0.dev',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    )
}
