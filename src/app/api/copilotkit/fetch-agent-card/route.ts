import { NextRequest, NextResponse } from "next/server";
const BackendUrl = process.env.BACKEND_URL;

export async function GET(req: NextRequest) {
  const agent = await req.json();
  console.log("Agent to be Updated Data Received:", agent);
  // Forward the request to FastAPI backend
  const res = await fetch("http://localhost:8000/fetch-agent-card-details", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  console.log("After update-agent GET data received", data)
  return NextResponse.json(data);
}