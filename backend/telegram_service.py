"""
Telegram service for adding members to groups using Telethon.
"""

import asyncio
import logging
from dataclasses import dataclass
from typing import Optional
from telethon import TelegramClient
from telethon.errors import (
    SessionPasswordNeededError,
    PhoneNumberUnoccupiedError,
    PhoneCodeInvalidError,
    PeerIdInvalidError,
    UserPrivacyRestrictedError,
    UserBotError,
    UserDeactivatedBanError,
    UserNotMutualContactError,
    ChatAdminRequiredError,
)
from telethon.tl.types import User, Channel, Chat

logger = logging.getLogger(__name__)

@dataclass
class MemberResult:
    """Result of adding a member to a group."""
    username_or_phone: str
    success: bool
    message: str

class TelegramService:
    """Service for managing Telegram member additions."""
    
    def __init__(self, api_id: int, api_hash: str):
        """Initialize the Telegram service."""
        self.api_id = api_id
        self.api_hash = api_hash
        self.client: Optional[TelegramClient] = None
        
    async def connect(self, phone: str) -> bool:
        """
        Connect to Telegram and authenticate.
        
        Args:
            phone: Phone number with country code (e.g., +1234567890)
            
        Returns:
            True if connected successfully, False otherwise
        """
        try:
            self.client = TelegramClient(
                "telegram_session",
                self.api_id,
                self.api_hash
            )
            
            await self.client.connect()
            
            # Check if already authorized
            if not await self.client.is_user_authorized():
                # Request code - in real usage, this would require user interaction
                # For now, we'll return an error message
                await self.client.disconnect()
                return False
                
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Telegram: {str(e)}")
            return False
    
    async def disconnect(self) -> None:
        """Disconnect from Telegram."""
        if self.client:
            await self.client.disconnect()
            self.client = None
    
    async def add_members_to_group(
        self,
        members: list[str],
        group_id: str,
        delay: float = 2.0,
    ) -> list[MemberResult]:
        """
        Add multiple members to a Telegram group.
        
        Args:
            members: List of usernames or phone numbers to add
            group_id: Group ID or username (e.g., '@groupname' or '-100123456789')
            delay: Delay in seconds between requests to avoid rate limits
            
        Returns:
            List of MemberResult objects with success/failure info
        """
        if not self.client:
            return [
                MemberResult(
                    username_or_phone=member,
                    success=False,
                    message="Not connected to Telegram"
                )
                for member in members
            ]
        
        results: list[MemberResult] = []
        
        try:
            # Get the target group
            group = await self._get_group(group_id)
            if not group:
                return [
                    MemberResult(
                        username_or_phone=member,
                        success=False,
                        message=f"Group '{group_id}' not found or not accessible"
                    )
                    for member in members
                ]
            
            # Add each member
            for username_or_phone in members:
                try:
                    # Add a delay to avoid rate limiting
                    await asyncio.sleep(delay)
                    
                    # Get the user entity
                    try:
                        user = await self.client.get_entity(username_or_phone)
                    except Exception as e:
                        results.append(
                            MemberResult(
                                username_or_phone=username_or_phone,
                                success=False,
                                message=f"User not found: {str(e)}"
                            )
                        )
                        continue
                    
                    # Try to add the user to the group
                    try:
                        await self.client.edit_permissions(
                            group,
                            user,
                            view_messages=True
                        )
                        
                        results.append(
                            MemberResult(
                                username_or_phone=username_or_phone,
                                success=True,
                                message="Successfully added to group"
                            )
                        )
                    except ChatAdminRequiredError:
                        results.append(
                            MemberResult(
                                username_or_phone=username_or_phone,
                                success=False,
                                message="Admin permission required to add members"
                            )
                        )
                    except UserPrivacyRestrictedError:
                        results.append(
                            MemberResult(
                                username_or_phone=username_or_phone,
                                success=False,
                                message="User has privacy restrictions"
                            )
                        )
                    except UserBotError:
                        results.append(
                            MemberResult(
                                username_or_phone=username_or_phone,
                                success=False,
                                message="Cannot add bots to this group"
                            )
                        )
                    except UserDeactivatedBanError:
                        results.append(
                            MemberResult(
                                username_or_phone=username_or_phone,
                                success=False,
                                message="User account is deactivated or banned"
                            )
                        )
                    except UserNotMutualContactError:
                        results.append(
                            MemberResult(
                                username_or_phone=username_or_phone,
                                success=False,
                                message="User is not a mutual contact"
                            )
                        )
                    except PeerIdInvalidError:
                        results.append(
                            MemberResult(
                                username_or_phone=username_or_phone,
                                success=False,
                                message="Invalid peer ID"
                            )
                        )
                    except Exception as e:
                        results.append(
                            MemberResult(
                                username_or_phone=username_or_phone,
                                success=False,
                                message=f"Failed to add member: {str(e)}"
                            )
                        )
                        
                except Exception as e:
                    logger.error(f"Error processing member {username_or_phone}: {str(e)}")
                    results.append(
                        MemberResult(
                            username_or_phone=username_or_phone,
                            success=False,
                            message=f"Error: {str(e)}"
                        )
                    )
            
            return results
            
        except Exception as e:
            logger.error(f"Error adding members to group: {str(e)}")
            return [
                MemberResult(
                    username_or_phone=member,
                    success=False,
                    message=f"Error: {str(e)}"
                )
                for member in members
            ]
    
    async def _get_group(self, group_id: str) -> Optional[Channel | Chat]:
        """
        Get a group entity by ID or username.
        
        Args:
            group_id: Group ID or username
            
        Returns:
            Group entity or None if not found
        """
        if not self.client:
            return None
        
        try:
            group = await self.client.get_entity(group_id)
            return group
        except Exception as e:
            logger.error(f"Failed to get group {group_id}: {str(e)}")
            return None
