"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import KeycloakService from "@/services/keycloak-service"

export default function KeycloakAuth() {
    const [authenticated, setAuthenticated] = useState(false)
    const [apiData, setApiData] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const initAuth = async () => {
            try {
                await KeycloakService.initKeycloak(() => {
                    setAuthenticated(KeycloakService.isLoggedIn())
                    setLoading(false)
                })
            } catch (err) {
                console.error("Failed to initialize Keycloak", err)
                setError("Failed to initialize authentication")
                setLoading(false)
            }
        }

        initAuth().then(() => console.log('Keycloak initialized'))
    }, [])

    const login = async () => {
        try {
            setLoading(true)
            await KeycloakService.doLogin({ redirectUri: window.location.origin })
            setLoading(false)
        } catch (error) {
            console.error("Failed to login", error)
            setError("Failed to login")
            setLoading(false)
        }
    }

    const logout = async () => {
        setAuthenticated(false)
        await KeycloakService.doLogout({ redirectUri: window.location.origin })
    }

    const fetchApi = async () => {
        try {
            setLoading(true)
            setError(null)

            const token = await KeycloakService.getToken()
            if (!token) {
                setError("No authentication token available")
                setLoading(false)
                return
            }

            const response = await fetch("/api/protected", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`)
            }

            const data = await response.json()
            setApiData(JSON.stringify(data, null, 2))
            setLoading(false)
        } catch (error) {
            console.error("Failed to fetch API", error)
            setApiData(null)
            setError("Error fetching data: " + (error instanceof Error ? error.message : String(error)))
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Authentication Status</CardTitle>
                <CardDescription>
                    {loading
                        ? "Initializing..."
                        : authenticated
                            ? `Logged in as ${KeycloakService.getUsername() || "User"}`
                            : "Not authenticated"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && <div className="p-4 bg-red-50 text-red-800 rounded-md mb-4">{error}</div>}
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

