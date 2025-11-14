import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🔗 Notes to Job proxy called at:', new Date().toISOString())

  try {
    const body = await request.json()
    console.log('📝 Request body:', body)

    // Forward the request to the actual API
    const response = await fetch('https://lexa-backend-xidw.vercel.app/notes_to_job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Lexa-HR-Copilot/1.0',
      },
      body: JSON.stringify(body),
    })

    console.log('📡 API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API error:', response.status, response.statusText, errorText)
      
      let errorMessage = `API error: ${response.status} ${response.statusText}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        // If error text is not JSON, use as is
        errorMessage = errorText || errorMessage
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ API success, response type:', typeof data, 'is array:', Array.isArray(data))
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('💥 Proxy error:', error)
    
    let errorMessage = 'Failed to process request'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out'
        statusCode = 408
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error connecting to API'
        statusCode = 502
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
