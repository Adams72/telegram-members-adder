"""
FastAPI backend for Telegram Members Adder.
Handles API requests and delegates to TelegramService for actual member addition.
"""

import logging
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from telegram_service import TelegramService, MemberResult
import asyncio

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Telegram Members Adder API")

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Telegram service instance
telegram_service: Optional[TelegramService] = None

class AddMembersRequest(BaseModel):
    """Request body for adding members to a Telegram group."""
    api_id: int = Field(..., description="Telegram API ID")
    api_hash: str = Field(..., description="Telegram API Hash")
    phone: str = Field(..., description="Phone number with country code")
    group_id: str = Field(..., description="Target group ID or username")
    members: list[str] = Field(..., description="List of usernames or phone numbers")
    delay: float = Field(default=2.0, ge=0, le=60, description="Delay between requests in seconds")

class MemberResultResponse(BaseModel):
    """Response model for member addition result."""
    username_or_phone: str
    success: bool
    message: str

class AddMembersResponse(BaseModel):
    """Response model for add members endpoint."""
    total: int
    successful: int
    failed: int
    results: list[MemberResultResponse]

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}

@app.post("/add-members")
async def add_members(request: AddMembersRequest) -> AddMembersResponse:
    """
    Add members to a Telegram group.
    
    Args:
        request: AddMembersRequest containing API credentials, phone, group ID, and member list
        
    Returns:
        AddMembersResponse with results for each member
        
    Raises:
        HTTPException: If connection fails or members list is empty
    """
    # Validate input
    if not request.members:
        raise HTTPException(status_code=400, detail="Members list cannot be empty")
    
    if len(request.members) > 100:
        raise HTTPException(status_code=400, detail="Cannot add more than 100 members at once")
    
    if not request.api_id or not request.api_hash:
        raise HTTPException(status_code=400, detail="API ID and API Hash are required")
    
    if not request.phone:
        raise HTTPException(status_code=400, detail="Phone number is required")
    
    if not request.group_id:
        raise HTTPException(status_code=400, detail="Group ID is required")
    
    try:
        # Initialize Telegram service
        service = TelegramService(request.api_id, request.api_hash)
        
        # Connect to Telegram
        logger.info(f"Connecting to Telegram with phone {request.phone}")
        connected = await service.connect(request.phone)
        
        if not connected:
            raise HTTPException(
                status_code=401,
                detail="Failed to authenticate with Telegram. Ensure your API credentials and phone number are correct."
            )
        
        try:
            # Add members to group
            logger.info(f"Adding {len(request.members)} members to group {request.group_id}")
            results = await service.add_members_to_group(
                members=request.members,
                group_id=request.group_id,
                delay=request.delay
            )
            
            # Count successes and failures
            successful = sum(1 for r in results if r.success)
            failed = len(results) - successful
            
            # Build response
            return AddMembersResponse(
                total=len(results),
                successful=successful,
                failed=failed,
                results=[
                    MemberResultResponse(
                        username_or_phone=r.username_or_phone,
                        success=r.success,
                        message=r.message
                    )
                    for r in results
                ]
            )
        finally:
            # Always disconnect
            await service.disconnect()
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in add_members endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred: {str(e)}"
        )

@app.post("/validate-credentials")
async def validate_credentials(
    api_id: int,
    api_hash: str,
    phone: str
) -> dict:
    """
    Validate Telegram API credentials and connection.
    
    Args:
        api_id: Telegram API ID
        api_hash: Telegram API Hash
        phone: Phone number with country code
        
    Returns:
        Dictionary with validation result
    """
    if not api_id or not api_hash or not phone:
        raise HTTPException(
            status_code=400,
            detail="API ID, API Hash, and phone number are required"
        )
    
    try:
        service = TelegramService(api_id, api_hash)
        connected = await service.connect(phone)
        
        if connected:
            try:
                return {"valid": True, "message": "Credentials are valid"}
            finally:
                await service.disconnect()
        else:
            return {
                "valid": False,
                "message": "Failed to authenticate. Check your credentials."
            }
    except Exception as e:
        logger.error(f"Error validating credentials: {str(e)}")
        return {
            "valid": False,
            "message": f"Error: {str(e)}"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
