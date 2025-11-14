import { NextRequest, NextResponse } from 'next/server'

// Different webhooks for different purposes
const CANDIDATE_WEBHOOK_URL = 'https://chainesanb9.app.n8n.cloud/webhook/76238103-dc48-413c-a0c7-65aab770af09'
const BULK_UPLOAD_WEBHOOK_URL = 'https://chainesanb9.app.n8n.cloud/webhook/c37944db-e2da-4baa-9825-c40548311dff'
const CANDIDATES_BULK_UPLOAD_WEBHOOK_URL = 'https://chainesanb9.app.n8n.cloud/webhook/d85beb97-0958-4e9d-b1d1-1e419c6be353'

export async function POST(request: NextRequest) {
  console.log('🔗 Webhook proxy called at:', new Date().toISOString())

  try {
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    
    console.log('📝 Request type:', type || 'bulk-upload')

    // Handle different request types
    if (type === 'linkedin') {
      return await handleLinkedInSubmission(request)
    } else if (type === 'cv') {
      return await handleCVUpload(request)
    } else if (type === 'candidates_bulk') {
      return await handleCandidatesBulkUpload(request)
    } else {
      // Default to bulk upload (JSON file upload)
      return await handleBulkUpload(request)
    }
  } catch (error) {
    console.error('❌ Webhook proxy error:', error)
    
    let errorMessage = 'Failed to forward request to webhook'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Webhook request timed out after 60 seconds'
        statusCode = 408
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error connecting to webhook'
        statusCode = 502
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    )
  }
}

async function handleLinkedInSubmission(request: NextRequest) {
  const body = await request.json()
  console.log('📋 LinkedIn payload received:', body)

  const webhookPayload = {
    url: body.url,
    notes: body.notes || '',
    phone: body.phone || '',
    email: body.email || '',
    status: body.status || (body.isActive ? 'active' : 'inactive'),
    isActive: body.isActive !== undefined ? body.isActive : true,
    type: 'linkedin',
  }

  console.log('🚀 Forwarding LinkedIn data to webhook:', CANDIDATE_WEBHOOK_URL)

  const response = await fetch(CANDIDATE_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Lexa-HR-Copilot/1.0',
    },
    body: JSON.stringify(webhookPayload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Webhook error:', errorText)
    throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
  }

  const result = await response.text()
  console.log('✅ LinkedIn submission success:', result)

  return NextResponse.json({ success: true, message: 'LinkedIn URL submitted successfully' })
}

async function handleCVUpload(request: NextRequest) {
  const formData = await request.formData()
  const cv = formData.get('cv') as File
  
  if (!cv) {
    throw new Error('No CV file provided')
  }

  console.log('📋 CV upload received:', cv.name, cv.size)

  const webhookFormData = new FormData()
  webhookFormData.append('cv', cv)
  
  const notes = formData.get('notes')
  const email = formData.get('email')
  const status = formData.get('status')
  const isActive = formData.get('isActive')

  if (notes) webhookFormData.append('notes', notes as string)
  if (email) webhookFormData.append('email', email as string)
  if (status) webhookFormData.append('status', status as string)
  if (isActive) webhookFormData.append('isActive', isActive as string)
  webhookFormData.append('type', 'cv')

  console.log('🚀 Forwarding CV to webhook:', CANDIDATE_WEBHOOK_URL)

  const response = await fetch(CANDIDATE_WEBHOOK_URL, {
    method: 'POST',
    body: webhookFormData,
    headers: {
      'User-Agent': 'Lexa-HR-Copilot/1.0',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Webhook error:', errorText)
    throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
  }

  const result = await response.text()
  console.log('✅ CV upload success:', result)

  return NextResponse.json({ success: true, message: 'CV uploaded successfully' })
}

async function handleBulkUpload(request: NextRequest) {
  // Get the form data from the request
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    throw new Error('No file provided')
  }

  console.log('📄 Processing bulk upload file:', file.name, 'Size:', file.size, 'Type:', file.type)
    
    // For large files, skip JSON validation to avoid memory issues
    const shouldValidate = file.size < 5 * 1024 * 1024 // Only validate files smaller than 5MB
    
    let finalFormData = formData
    
    if (shouldValidate) {
      console.log('🔧 File is small enough, performing JSON validation and cleanup...')
      
      try {
        // Read and validate/fix the JSON content
        const fileContent = await file.text()
        console.log('📝 Original file content length:', fileContent.length)
        
        let cleanedContent = fileContent
        
        // Fix common JSON issues
        cleanedContent = cleanedContent.replace(/^\uFEFF/, '') // Remove BOM
        cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        
        // Try to parse to validate
        try {
          JSON.parse(cleanedContent)
          console.log('✅ JSON is valid')
          
          // Create new FormData with cleaned content
          const cleanedFormData = new FormData()
          const cleanedBlob = new Blob([cleanedContent], { type: 'application/json' })
          cleanedFormData.append('file', cleanedBlob, file.name)
          finalFormData = cleanedFormData
          
        } catch (parseError) {
          console.warn('⚠️ JSON validation failed, sending original file:', parseError)
          // Send original file if validation fails
        }
      } catch (error) {
        console.warn('⚠️ Could not validate JSON, sending original file:', error)
        // Send original file if any error during validation
      }
    } else {
      console.log('📦 Large file detected, skipping validation and sending directly')
    }
    
    console.log('📤 Webhook proxy: Forwarding file to n8n webhook:', BULK_UPLOAD_WEBHOOK_URL)
    
    // Add timeout for the webhook request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log('⏰ Webhook request timeout reached')
      controller.abort()
    }, 60000) // 60 second timeout
    
    // Forward the FormData to the actual webhook
    const response = await fetch(BULK_UPLOAD_WEBHOOK_URL, {
      method: 'POST',
      body: finalFormData,
      headers: {
        'User-Agent': 'Lexa-HR-Copilot/1.0',
      },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)

    console.log('🔄 Webhook response:', { status: response.status, ok: response.ok })

    if (response.ok) {
      const result = await response.text()
      console.log('✅ Webhook success:', result)
      return NextResponse.json({ success: true, message: 'File uploaded successfully', data: result })
    } else {
      const errorText = await response.text()
      console.error('❌ Webhook error:', response.status, response.statusText, errorText)
      return NextResponse.json(
        { success: false, error: `Webhook responded with status ${response.status}: ${response.statusText}` },
        { status: response.status }
      )
    }
}

async function handleCandidatesBulkUpload(request: NextRequest) {
  // Get the form data from the request
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    throw new Error('No file provided')
  }

  console.log('👥 Processing candidates bulk upload file:', file.name, 'Size:', file.size, 'Type:', file.type)
    
  // For large files, skip JSON validation to avoid memory issues
  const shouldValidate = file.size < 5 * 1024 * 1024 // Only validate files smaller than 5MB
  
  let finalFormData = formData
  
  if (shouldValidate) {
    console.log('🔧 File is small enough, performing JSON validation and cleanup...')
    
    try {
      // Read and validate/fix the JSON content
      const fileContent = await file.text()
      console.log('📝 Original file content length:', fileContent.length)
      
      let cleanedContent = fileContent
      
      // Fix common JSON issues
      cleanedContent = cleanedContent.replace(/^\uFEFF/, '') // Remove BOM
      cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      
      // Try to parse to validate
      try {
        JSON.parse(cleanedContent)
        console.log('✅ JSON is valid')
        
        // Create new FormData with cleaned content
        const cleanedFormData = new FormData()
        const cleanedBlob = new Blob([cleanedContent], { type: 'application/json' })
        cleanedFormData.append('file', cleanedBlob, file.name)
        finalFormData = cleanedFormData
        
      } catch (parseError) {
        console.warn('⚠️ JSON validation failed, sending original file:', parseError)
        // Send original file if validation fails
      }
    } catch (error) {
      console.warn('⚠️ Failed to read file for validation, sending original:', error)
      // Send original file if reading fails
    }
  } else {
    console.log('📦 Large file detected, skipping validation and sending directly')
  }
  
  console.log('📤 Webhook proxy: Forwarding candidates file to n8n webhook:', CANDIDATES_BULK_UPLOAD_WEBHOOK_URL)
  
  // Add timeout for the webhook request
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    console.log('⏰ Webhook request timeout reached')
    controller.abort()
  }, 60000) // 60 second timeout
  
  // Forward the FormData to the actual webhook
  const response = await fetch(CANDIDATES_BULK_UPLOAD_WEBHOOK_URL, {
    method: 'POST',
    body: finalFormData,
    headers: {
      'User-Agent': 'Lexa-HR-Copilot/1.0',
    },
    signal: controller.signal,
  })
  
  clearTimeout(timeoutId)
  
  console.log('🔄 Webhook response:', { status: response.status, ok: response.ok })

  if (response.ok) {
    const result = await response.text()
    console.log('✅ Webhook success:', result)
    return NextResponse.json({ success: true, message: 'Candidates file uploaded successfully', data: result })
  } else {
    const errorText = await response.text()
    console.error('❌ Webhook error:', response.status, response.statusText, errorText)
    return NextResponse.json(
      { success: false, error: `Webhook responded with status ${response.status}: ${response.statusText}` },
      { status: response.status }
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