import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // In a real application, you would validate the token here
  // For example, by using a middleware or a library like jose

  // For demo purposes, we're just checking if the Authorization header exists
  const authHeader = request.headers.get("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Return some protected data
  return NextResponse.json({
    message: "This is protected data from the API",
    timestamp: new Date().toISOString(),
  })
}

