import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = "https://lexa-backend-xidw.vercel.app"

// Enhanced helper function to parse the complex date format
function parseComplexDate(dateObj: any): string | null {
  try {
    if (!dateObj) {
      console.log(`❌ Date object is null/undefined:`, dateObj)
      return null
    }

    console.log(`🔍 Attempting to parse date:`, JSON.stringify(dateObj, null, 2))

    // Handle standard ISO date strings first (most common case)
    if (typeof dateObj === "string") {
      // Try direct parsing first
      const date = new Date(dateObj)
      if (!isNaN(date.getTime())) {
        console.log(`✅ Successfully parsed ISO date string: ${dateObj} -> ${date.toISOString()}`)
        return date.toISOString()
      }

      // Try parsing with different formats
      const cleanedDate = dateObj.trim()
      const dateFormats = [
        cleanedDate,
        cleanedDate.replace(/T/, " "),
        cleanedDate.replace(/Z$/, ""),
        cleanedDate.split(".")[0] + "Z", // Remove microseconds
      ]

      for (const format of dateFormats) {
        const testDate = new Date(format)
        if (!isNaN(testDate.getTime())) {
          console.log(`✅ Successfully parsed date with format: ${format} -> ${testDate.toISOString()}`)
          return testDate.toISOString()
        }
      }

      console.log(`❌ Failed to parse string date: ${dateObj}`)
    }

    // Handle the complex nested date format with _DateTime__date and _DateTime__time
    if (typeof dateObj === "object" && dateObj._DateTime__date && dateObj._DateTime__time) {
      const dateInfo = dateObj._DateTime__date
      const timeInfo = dateObj._DateTime__time

      // Extract date components
      const year = dateInfo._Date__year
      const month = dateInfo._Date__month
      const day = dateInfo._Date__day

      // Extract time components
      const hour = timeInfo._Time__hour || 0
      const minute = timeInfo._Time__minute || 0
      const second = timeInfo._Time__second || 0
      const nanosecond = timeInfo._Time__nanosecond || 0

      console.log(`🔍 Complex date components: ${year}-${month}-${day} ${hour}:${minute}:${second}`)

      // Validate the extracted values
      if (year && month && day) {
        // Create a proper ISO date string
        const isoString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}.${String(Math.floor(nanosecond / 1000000)).padStart(3, "0")}Z`

        // Validate the created date
        const date = new Date(isoString)
        if (!isNaN(date.getTime())) {
          console.log(`✅ Successfully parsed complex date: ${isoString}`)
          return isoString
        }
      }
    }

    // Handle alternative nested formats
    if (typeof dateObj === "object" && dateObj.date && dateObj.time) {
      const dateInfo = dateObj.date
      const timeInfo = dateObj.time

      const year = dateInfo.year || dateInfo._Date__year
      const month = dateInfo.month || dateInfo._Date__month
      const day = dateInfo.day || dateInfo._Date__day

      const hour = timeInfo.hour || timeInfo._Time__hour || 0
      const minute = timeInfo.minute || timeInfo._Time__minute || 0
      const second = timeInfo.second || timeInfo._Time__second || 0

      if (year && month && day) {
        const isoString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}.000Z`

        const date = new Date(isoString)
        if (!isNaN(date.getTime())) {
          console.log(`✅ Successfully parsed alternative date format: ${isoString}`)
          return isoString
        }
      }
    }

    // Handle timestamp numbers
    if (typeof dateObj === "number") {
      const date = new Date(dateObj)
      if (!isNaN(date.getTime())) {
        console.log(`✅ Successfully parsed timestamp: ${dateObj} -> ${date.toISOString()}`)
        return date.toISOString()
      }
    }

    console.log(`❌ Failed to parse date object:`, JSON.stringify(dateObj, null, 2))
    return null
  } catch (error) {
    console.error("❌ Error parsing date:", error, dateObj)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("🚀 Starting campaigns proxy request...")

    const response = await fetch(`${API_BASE_URL}/campaigns`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Lexa-HR-Copilot/1.0",
      },
      cache: "no-store",
    })

    console.log("📡 API Response status:", response.status)
    console.log("📡 API Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      console.error("❌ API request failed:", response.status, response.statusText)

      // Return a success response with empty data instead of failing
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        error: `External API returned ${response.status}: ${response.statusText}`,
        originalResponse: {
          status: response.status,
          statusText: response.statusText,
          apiStatus: "error",
        },
      })
    }

    const rawData = await response.text()
    console.log("📄 Raw response (first 500 chars):", rawData.substring(0, 500))

    let data
    try {
      data = JSON.parse(rawData)
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError)

      // Return success with empty data instead of failing
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        error: "Invalid JSON response from external API",
        originalResponse: {
          rawData: rawData.substring(0, 200),
          apiStatus: "parse_error",
        },
      })
    }

    console.log("📊 Parsed data type:", typeof data)
    console.log("📊 Data structure:", Array.isArray(data) ? `Array with ${data.length} items` : "Object")

    // Handle different response formats
    let campaigns = []
    if (Array.isArray(data)) {
      campaigns = data
    } else if (data && typeof data === "object") {
      campaigns = data.campaigns || data.data || data.results || []
      if (!Array.isArray(campaigns)) {
        campaigns = [data] // Single campaign object
      }
    }

    console.log("🔄 Processing", campaigns.length, "campaigns...")

    // Transform campaigns to match expected format
    const transformedCampaigns = campaigns.map((campaign: any, index: number) => {
      try {
        // Extract creation date from various possible fields with enhanced parsing
        let createdAt = null

        console.log(`📅 Campaign ${index} - Full campaign object:`, JSON.stringify(campaign, null, 2))

        // List all possible date fields to check
        const dateFields = [
          { name: "created", value: campaign.created },
          { name: "created_at", value: campaign.created_at },
          { name: "createdAt", value: campaign.createdAt },
          { name: "date_created", value: campaign.date_created },
          { name: "dateCreated", value: campaign.dateCreated },
          { name: "timestamp", value: campaign.timestamp },
          { name: "date", value: campaign.date },
          { name: "time", value: campaign.time },
        ]

        console.log(
          `📅 Campaign ${index} - Available date fields:`,
          dateFields.filter((f) => f.value),
        )

        // Try to parse each date field
        for (const field of dateFields) {
          if (field.value) {
            console.log(`📅 Campaign ${index} - Trying field '${field.name}':`, field.value)
            const parsed = parseComplexDate(field.value)
            if (parsed) {
              createdAt = parsed
              console.log(`📅 Campaign ${index} - Successfully parsed '${field.name}':`, createdAt)
              break
            }
          }
        }

        // If still no date, leave as null
        if (!createdAt) {
          console.log(`📅 Campaign ${index} - No valid date found in any field, setting to null`)
        }

        return {
          campaign_id: String(campaign.campaign_id || campaign.id || `campaign-${index}`),
          campaign_raw: JSON.stringify(campaign),
          created_at: createdAt, // Can be null
          updated_at: campaign.updated_at || campaign.updatedAt || createdAt,
          job: {
            title: String(
              campaign.job?.title ||
                campaign.title ||
                campaign.job_title ||
                campaign.application_link ||
                "Untitled Position",
            ),
            company: String(campaign.job?.company || campaign.company || campaign.company_name || "Unknown Company"),
            location: String(campaign.job?.location || campaign.location || "Remote"),
            contract: String(campaign.job?.contract || campaign.contract_type || campaign.type || "Full-time"),
            seniority: campaign.job?.seniority || campaign.seniority || null,
            salary_min: campaign.job?.salary_min || campaign.salary_min || null,
            salary_max: campaign.job?.salary_max || campaign.salary_max || null,
            salary_currency: campaign.job?.salary_currency || campaign.currency || "EUR",
            description: String(
              campaign.job?.description ||
                campaign.description ||
                campaign.job_description ||
                "No description available",
            ),
            application_link: campaign.job?.application_link || campaign.application_link || null,
            work_mode: String(campaign.job?.work_mode || campaign.work_mode || "Hybrid"),
            department: campaign.job?.department || campaign.department || null,
            company_desc: String(campaign.job?.company_desc || campaign.company_description || ""),
            skills: Array.isArray(campaign.job?.skills)
              ? campaign.job.skills.map((skill: any) => ({
                  name: String(skill.name || skill),
                  mastery: skill.mastery || null,
                }))
              : Array.isArray(campaign.skills)
                ? campaign.skills.map((skill: any) => ({
                    name: String(skill.name || skill),
                    mastery: skill.mastery || null,
                  }))
                : [],
            languages: Array.isArray(campaign.job?.languages)
              ? campaign.job.languages
              : Array.isArray(campaign.languages)
                ? campaign.languages
                : [],
            benefits: Array.isArray(campaign.job?.benefits)
              ? campaign.job.benefits
              : Array.isArray(campaign.benefits)
                ? campaign.benefits
                : [],
            requirements: Array.isArray(campaign.job?.requirements)
              ? campaign.job.requirements
              : Array.isArray(campaign.requirements)
                ? campaign.requirements
                : [],
            responsibilities: Array.isArray(campaign.job?.responsibilities)
              ? campaign.job.responsibilities
              : Array.isArray(campaign.responsibilities)
                ? campaign.responsibilities
                : [],
          },
        }
      } catch (transformError) {
        console.error(`❌ Error transforming campaign ${index}:`, transformError)
        return {
          campaign_id: `error-${index}`,
          campaign_raw: JSON.stringify(campaign),
          created_at: null,
          updated_at: null,
          job: {
            title: "Error loading campaign",
            company: "Unknown",
            location: "Unknown",
            contract: "Unknown",
            seniority: null,
            salary_min: null,
            salary_max: null,
            salary_currency: "EUR",
            description: "Error processing campaign data",
            application_link: null,
            work_mode: "Unknown",
            department: null,
            company_desc: "",
            skills: [],
            languages: [],
            benefits: [],
            requirements: [],
            responsibilities: [],
          },
        }
      }
    })

    // Sort campaigns by creation date (newest first)
    // Handle null dates by putting them at the end
    transformedCampaigns.sort((a, b) => {
      if (!a.created_at && !b.created_at) return 0
      if (!a.created_at) return 1 // null dates go to end
      if (!b.created_at) return -1 // null dates go to end

      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA // Newest first
    })

    console.log("✅ Successfully transformed and sorted", transformedCampaigns.length, "campaigns")
    if (transformedCampaigns.length > 0) {
      console.log("📅 First campaign date:", transformedCampaigns[0].created_at)
      console.log("📅 Last campaign date:", transformedCampaigns[transformedCampaigns.length - 1].created_at)
    }

    return NextResponse.json({
      success: true,
      data: transformedCampaigns,
      count: transformedCampaigns.length,
      originalResponse: {
        dataType: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : "N/A",
        apiStatus: "success",
      },
    })
  } catch (error) {
    console.error("💥 Proxy error:", error)

    // Return success with empty data instead of failing
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      originalResponse: {
        apiStatus: "network_error",
      },
    })
  }
}
