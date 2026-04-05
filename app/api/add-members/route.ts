import { NextRequest, NextResponse } from 'next/server'

interface AddMembersRequest {
  config: {
    apiId: string
    apiHash: string
    phone: string
    groupId: string
    delay: number
  }
  members: Array<{ username_or_phone: string }>
}

interface AddMembersResponse {
  success: boolean
  message: string
  successCount: number
  failureCount: number
  details: Array<{
    member: string
    success: boolean
    reason?: string
  }>
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<AddMembersResponse>> {
  try {
    const body: AddMembersRequest = await request.json()

    const { config, members } = body

    // Validate input
    if (!config.apiId || !config.apiHash || !config.phone || !config.groupId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required configuration fields',
          successCount: 0,
          failureCount: 0,
          details: [],
        },
        { status: 400 }
      )
    }

    if (!members || members.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No members provided',
          successCount: 0,
          failureCount: 0,
          details: [],
        },
        { status: 400 }
      )
    }

    // Simulate the member addition process
    // In production, this would call the Telethon client to actually add members
    const results = simulateAddMembers(members, config.delay)

    return NextResponse.json({
      success: results.successCount > 0,
      message: `Added ${results.successCount} out of ${members.length} members successfully`,
      successCount: results.successCount,
      failureCount: results.failureCount,
      details: results.details,
    })
  } catch (error) {
    console.error('Error adding members:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while adding members',
        successCount: 0,
        failureCount: 0,
        details: [],
      },
      { status: 500 }
    )
  }
}

function simulateAddMembers(
  members: Array<{ username_or_phone: string }>,
  delay: number
) {
  let successCount = 0
  let failureCount = 0
  const details: Array<{
    member: string
    success: boolean
    reason?: string
  }> = []

  // Simulate adding each member with a delay
  members.forEach((member, index) => {
    // Simulate success/failure ratio (80% success, 20% failure for demo)
    const isSuccess = Math.random() > 0.2

    if (isSuccess) {
      successCount++
      details.push({
        member: member.username_or_phone,
        success: true,
      })
    } else {
      failureCount++
      const reasons = [
        'User privacy restricted',
        'User already a participant',
        'User not found',
        'Account limited',
      ]
      const reason = reasons[Math.floor(Math.random() * reasons.length)]

      details.push({
        member: member.username_or_phone,
        success: false,
        reason,
      })
    }
  })

  return {
    successCount,
    failureCount,
    details,
  }
}
