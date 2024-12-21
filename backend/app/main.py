import asyncio
import logging
from typing import Dict, List

from app.auth.router import router as router_auth
from app.game.router import router as router_game
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()
active_connections: Dict[int, WebSocket] = {}

# Добавляем middleware для CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешаем все источники
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы
    allow_headers=["*"],  # Разрешаем все заголовки
)

app.mount('/static', StaticFiles(directory='app/static'), name='static')


@app.get("/")
def home_page():
    return {
        "message": "Добро пожаловать! Пусть эта заготовка станет удобным инструментом для вашей работы и "
                   "приносит вам пользу!"
    }

import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)

# Функция для отправки сообщения пользователю, если он подключен
async def notify_user(user_id: int, message: dict):
    """Отправить сообщение пользователю, если он подключен."""
    if user_id in active_connections:
        websocket = active_connections[user_id]
        # Отправляем сообщение в формате JSON
        await websocket.send_json(message)


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await websocket.accept()
    logging.info(f"User {user_id} connected.")
    active_connections[user_id] = websocket
    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        logging.info(f"User {user_id} disconnected.")
        active_connections.pop(user_id, None)


app.include_router(router_auth)
app.include_router(router_game)