from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from app.game.models import Game, Settings, GameResponse
from app.game.dto import CreateGameGTO
from typing import Dict, List, Optional
from uuid import UUID
import uuid
import asyncio
import logging

router = APIRouter(prefix="/games", tags=["Games"])

# Временное хранилище в памяти
games_store: Dict[str, Game] = {}
settings_store: Dict[str, Settings] = {}

# Активные WebSocket соединения
active_connections: Dict[str, WebSocket] = {}

# Хранилище для токенов и ID игр
token_to_game_id: Dict[str, str] = {}

# Создание новой игры
@router.post("/", response_model=GameResponse)
async def create_game(data: CreateGameGTO):
    # Создание новой настройки игры
    settings_id = len(settings_store) + 1  # Генерация нового ID для настроек
    new_settings = Settings(stones_count=data.beans, holes_count=data.holes, turn_time=data.time_per_move)
    settings_store[str(id)] = new_settings

    board = [data.beans] * (data.holes * 2)

    game_id = str(id)  # Преобразуем UUID в строку
    new_game = Game(
        id=game_id,
        player1=str(0),  # Задайте соответствующие значения для игроков
        player2=str(0),
        board=board,
        current_turn=str(0)
    )
    games_store[game_id] = new_game

    # Генерация токенов и сохранение соответствий
    token1 = str(uuid.uuid4())
    token2 = str(uuid.uuid4())
    token_to_game_id[token1] = game_id
    token_to_game_id[token2] = game_id

    await notify_players(game_id, new_game)
    return GameResponse(game=new_game, tokens={"player1": token1, "player2": token2})

# Уведомление игроков об обновлениях игры
async def notify_players(game_id: str, game: Game):
    message = {"type": "game_update", "game": game.dict()}
    for player in [game.player1, game.player2]:
        if player in active_connections:
            await active_connections[player].send_json(message)

# WebSocket для подключения игроков
@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    await websocket.accept()
    
    # Проверка, есть ли игра, связанная с токеном
    game_id = await get_game_id_by_token(token)
    if game_id is None:
        await websocket.close()
        raise HTTPException(status_code=403, detail="Invalid token")

    active_connections[token] = websocket
    logging.info(f"User {token} connected.")

    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        logging.info(f"User {token} disconnected.")
        active_connections.pop(token, None)

# Получение ID игры по токену
async def get_game_id_by_token(token: str) -> Optional[str]:
    return token_to_game_id.get(token, None)

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
