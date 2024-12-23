from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from app.game.models import Game, Settings
from typing import Dict, List, Optional
import uuid
import asyncio
import logging


router = APIRouter(prefix="/games", tags=["Games"])

# Временное хранилище в памяти
games_store: Dict[str, Game] = {}
settings_store: Dict[int, Settings] = {
    1: Settings(stones_count=4, holes_count=6, turn_time=30)
}

# Активные WebSocket соединения
active_connections: Dict[str, WebSocket] = {}

# Создание новой игры
@router.post("/", response_model=Game)
async def create_game(player1: str, player2: str, settings_id: int = 1):
    if settings_id not in settings_store:
        raise HTTPException(status_code=404, detail="Settings not found")

    settings = settings_store[settings_id]
    board = [settings.stones_count] * (settings.holes_count * 2)

    game_id = str(uuid.uuid4())
    new_game = Game(
        id=game_id,
        player1=player1,
        player2=player2,
        board=board,
        current_turn=player1
    )
    games_store[game_id] = new_game

    await notify_players(game_id, new_game)
    return new_game

# Уведомление игроков об обновлениях игры
async def notify_players(game_id: str, game: Game):
    message = {"type": "game_update", "game": game.dict()}
    for player in [game.player1, game.player2]:
        if player in active_connections:
            await active_connections[player].send_json(message)

# WebSocket для подключения игроков
@router.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await websocket.accept()
    active_connections[username] = websocket
    logging.info(f"User {username} connected.")

    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        logging.info(f"User {username} disconnected.")
        active_connections.pop(username, None)

# Сделать ход в игре
@router.post("/{game_id}/move/")
async def make_move(game_id: str, player: str, pit_index: int):
    game = games_store.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if player != game.current_turn:
        raise HTTPException(status_code=400, detail="It's not your turn")

    if pit_index < 0 or pit_index >= len(game.board) or game.board[pit_index] == 0:
        raise HTTPException(status_code=400, detail="Invalid move")

    # Логика хода
    stones = game.board[pit_index]
    game.board[pit_index] = 0
    index = pit_index + 1

    while stones > 0:
        if index >= len(game.board):
            index = 0
        game.board[index] += 1
        stones -= 1
        index += 1

    # Смена текущего игрока
    game.current_turn = game.player2 if game.current_turn == game.player1 else game.player1

    await notify_players(game_id, game)
    return {"message": "Move made", "game": game}

# Получение состояния игры по ID
@router.get("/{game_id}", response_model=Game)
async def get_game(game_id: str):
    game = games_store.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

# Получение всех доступных настроек
@router.get("/settings/", response_model=Dict[int, Settings])
async def get_settings():
    return settings_store