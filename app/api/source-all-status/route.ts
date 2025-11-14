import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const campaignId = req.nextUrl.searchParams.get("campaign_id")

  if (!campaignId) {
    console.error("[source-all-status] Missing campaign_id")
    return NextResponse.json(
      { error: "Missing campaign_id" },
      { status: 400 },
    )
  }

  const backendUrl = `https://lexa-backend-xidw.vercel.app/source-all-status?campaign_id=${encodeURIComponent(
    campaignId,
  )}`

  try {
    // This is the CURL you care about
    console.log(
      "[source-all-status] Calling backend:",
      `curl -X GET "${backendUrl}"`,
    )

    const resp = await fetch(backendUrl, { method: "GET" })

    console.log(
      "[source-all-status] Backend HTTP status:",
      resp.status,
      resp.statusText,
    )

    const raw = await resp.text()

    // This is the "curl output" printed in your terminal:
    console.log("[source-all-status] Raw backend body:", raw)

    if (!resp.ok) {
      return NextResponse.json(
        {
          error: `Upstream error ${resp.status}`,
          raw,
        },
        { status: 500 },
      )
    }

    const cleaned = raw.replace(/%+$/g, "").trim()

    let ready = false
    let parsed: any = null

    try {
      parsed = JSON.parse(cleaned)
      ready = Boolean(parsed?.ready)
    } catch (err) {
      console.warn(
        "[source-all-status] JSON parse failed, trying regex fallback",
        err,
      )

      if (/"ready"\s*:\s*true/.test(cleaned)) {
        ready = true
      } else if (/"ready"\s*:\s*false/.test(cleaned)) {
        ready = false
      }
    }

    // Log interpreted ready value
    console.log(
      "[source-all-status] Interpreted ready value:",
      ready,
      "for campaign",
      campaignId,
    )

    // Return a clean JSON payload to the client
    return NextResponse.json({
      campaign_id: campaignId,
      raw, // optional: for debugging in browser
      ready,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
    })
  } catch (error) {
    console.error("[source-all-status] Request failed:", error)
    return NextResponse.json(
      { error: "Failed to reach backend" },
      { status: 500 },
    )
  }
}
