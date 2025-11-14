import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Proxying chat request:', body)
    
    const response = await fetch('https://lexa-backend-xidw.vercel.app/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    console.log('Chat API response:', { status: response.status, data })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || data.message || 'Chat API error' },
        { status: response.status }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Chat proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to call chat API' },
      { status: 500 }
    )
  }
}





