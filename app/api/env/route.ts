import { NextResponse } from "next/server"

export async function GET() {
    // Only expose specific environment variables that are needed in the frontend
    // and are safe to expose
    return NextResponse.json({
        NEXT_PUBLIC_KEYCLOAK_URL: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
        NEXT_PUBLIC_KEYCLOAK_REALM: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
        NEXT_PUBLIC_KEYCLOAK_CLIENT_ID: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
    })
}

