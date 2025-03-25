"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Keycloak from "keycloak-js"

export default function KeycloakAuth() {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [apiData, setApiData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Initialize Keycloak only on the client side
    if (typeof window !== "undefined" && !keycloak) {
      const keycloakInstance = new Keycloak({
        url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080",
        realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "myrealm",
        clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "myclient",
      })

      setKeycloak(keycloakInstance)
    }
  }, [keycloak])

  const login = async () => {
    if (!keycloak) return

    try {
      setLoading(true)
      const authenticated = await keycloak.init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
        pkceMethod: "S256",
      })

      setAuthenticated(authenticated)
      setLoading(false)
    } catch (error) {
      console.error("Failed to initialize Keycloak", error)
      setLoading(false)
    }
  }

  const logout = () => {
    if (keycloak) {
      keycloak.logout()
      setAuthenticated(false)
      setApiData(null)
    }
  }

  const fetchApi = async () => {
    if (!keycloak || !keycloak.token) return

    try {
      setLoading(true)
      // Replace with your actual API endpoint
      const response = await fetch("/api/protected", {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      })

      const data = await response.json()
      setApiData(JSON.stringify(data, null, 2))
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch API", error)
      setApiData("Error fetching data")
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Authentication Status</CardTitle>
        <CardDescription>
          {authenticated ? `Logged in as ${keycloak?.tokenParsed?.preferred_username || "User"}` : "Not authenticated"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {apiData && (
          <div className="p-4 bg-muted rounded-md mb-4 overflow-auto max-h-40">
            <pre>{apiData}</pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!authenticated ? (
          <Button onClick={login} disabled={loading}>
            {loading ? "Initializing..." : "Login with Keycloak"}
          </Button>
        ) : (
          <div className="flex gap-4 w-full">
            <Button onClick={fetchApi} disabled={loading} className="flex-1">
              {loading ? "Loading..." : "Fetch API Data"}
            </Button>
            <Button onClick={logout} variant="outline" className="flex-1">
              Logout
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

