from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, List
from uuid import uuid4

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Signal Chat Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OutboundMessage(BaseModel):
    id: str
    room_id: str
    sender_id: str
    cipher_text: str
    created_at: str


class SendMessagePayload(BaseModel):
    type: str = Field(default="message")
    room_id: str
    sender_id: str
    cipher_text: str


class TypingPayload(BaseModel):
    type: str = Field(default="typing")
    room_id: str
    sender_id: str
    is_typing: bool


class AckPayload(BaseModel):
    type: str = Field(default="ack")
    room_id: str
    message_id: str
    user_id: str


class PresencePayload(BaseModel):
    type: str = Field(default="presence")
    user_id: str
    status: str


rooms: Dict[str, List[OutboundMessage]] = {}
clients: Dict[str, WebSocket] = {}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def broadcast(payload: dict, exclude_user: str | None = None) -> None:
    for uid, ws in list(clients.items()):
        if exclude_user and uid == exclude_user:
            continue
        await ws.send_json(payload)


@app.get('/health')
async def health() -> dict:
    return {"status": "ok", "timestamp": now_iso()}


@app.websocket('/ws/{user_id}')
async def websocket_endpoint(websocket: WebSocket, user_id: str) -> None:
    await websocket.accept()
    clients[user_id] = websocket
    await broadcast(PresencePayload(user_id=user_id, status="online").model_dump())

    try:
        while True:
            data = await websocket.receive_json()
            packet_type = data.get("type")

            if packet_type == "message":
                payload = SendMessagePayload(**data)
                message = OutboundMessage(
                    id=str(uuid4()),
                    room_id=payload.room_id,
                    sender_id=payload.sender_id,
                    cipher_text=payload.cipher_text,
                    created_at=now_iso(),
                )
                rooms.setdefault(payload.room_id, []).append(message)
                await broadcast({"type": "message", **message.model_dump()})

            elif packet_type == "typing":
                payload = TypingPayload(**data)
                await broadcast(payload.model_dump(), exclude_user=payload.sender_id)

            elif packet_type == "ack":
                payload = AckPayload(**data)
                await broadcast(payload.model_dump(), exclude_user=payload.user_id)

            elif packet_type == "history":
                room_id = data.get("room_id", "default")
                history = [m.model_dump() for m in rooms.get(room_id, [])]
                await websocket.send_json({"type": "history", "room_id": room_id, "messages": history})

    except WebSocketDisconnect:
        clients.pop(user_id, None)
        await broadcast(PresencePayload(user_id=user_id, status="offline").model_dump())
