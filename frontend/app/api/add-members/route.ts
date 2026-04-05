import { NextRequest, NextResponse } from 'next/server'

interface AddMembersRequest {
  api_id: number
  api_hash: string
  phone: string
  group_id: string
  members: string[]
  delay: number
}

interface MemberResult {
  username_or_phone: string
  success: boolean
  message: string
}

interface AddMembersResponse {
  total: number
  successful: number
  failed: number
  results: MemberResult[]
}

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const body: AddMembersRequest = await request.json()

    const { api_id, api_hash, phone, group_id, members, delay } = body

    // Validate input
    if (!api_id || !api_hash || !phone || !group_id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required configuration fields',
          total: 0,
          successful: 0,
          failed: 0,
          results: [],
        },
        { status: 400 }
      )
    }

    if (!members || members.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No members provided',
          total: 0,
          successful: 0,
          failed: 0,
          results: [],
        },
        { status: 400 }
      )
    }

    if (members.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot add more than 100 members at once',
          total: members.length,
          successful: 0,
          failed: members.length,
          results: members.map(m => ({
            username_or_phone: m,
            success: false,
            message: 'Request limit exceeded'
          })),
        },
        { status: 400 }
      )
    }

    // Call the Python backend
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000'
    
    const response = await fetch(`${pythonApiUrl}/add-members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_id,
        api_hash,
        phone,
        group_id,
        members,
        delay,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: 'Unknown error from backend'
      }))
      
      return NextResponse.json(
        {
          success: false,
          message: errorData.detail || 'Backend error occurred',
          total: members.length,
          successful: 0,
          failed: members.length,
          results: members.map(m => ({
            username_or_phone: m,
            success: false,
            message: errorData.detail || 'Backend request failed'
          })),
        },
        { status: response.status }
      )
    }

    const data: AddMembersResponse = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error adding members:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      {
        success: false,
        message: `An error occurred: ${errorMessage}. Make sure the Python backend is running.`,
        total: 0,
        successful: 0,
        failed: 0,
        results: [],
      },
      { status: 500 }
    )
  }
}
