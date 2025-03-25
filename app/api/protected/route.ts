import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    // Extract Authorization header
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Call external API with the Authorization header
        const externalApiResponse = await fetch("https://external-api.com/protected", {
            method: "GET",
            headers: {
                "Authorization": authHeader,  // Pass the auth token
                "Content-Type": "application/json",
            },
        });

        // Check if the external API call was successful
        if (!externalApiResponse.ok) {
            return NextResponse.json({ error: "Failed to fetch data from external API" }, { status: externalApiResponse.status });
        }

        // Extract JSON response from the external API
        const data = await externalApiResponse.json();

        // Return the external API response to the client
        return NextResponse.json({ message: "Success", data }, { status: 200 });

    } catch (error) {
        console.error("Error calling external API:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}