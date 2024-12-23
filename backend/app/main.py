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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Разрешенные источники
    allow_credentials=True,  # Разрешение на использование cookies/credentials
    allow_methods=["*"],  # Разрешить все методы (GET, POST, PUT, DELETE и т.д.)
    allow_headers=["*"],  # Разрешить все заголовки
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

app.include_router(router_auth)
app.include_router(router_game)