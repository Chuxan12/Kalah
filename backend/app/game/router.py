from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from app.game.models import Game, Settings, GameResponse
from app.game.dto import CreateGameGTO, SetPlayersDTO
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
active_player_connections: Dict[str, WebSocket] = {}

# Хранилище для токенов и ID игр
token_to_game_id: Dict[str, str] = {}

# Создание новой игры


@router.post("/set_players", response_model=GameResponse)
async def set_players(data: SetPlayersDTO):
    temp = games_store[data.game_id]
    if temp.player1 == "-1":
        temp.player1 = str(data.id1)
        temp.current_turn = str(data.id1)
        logging.info(f"Первый: {temp}")
    else:
        temp.player2 = str(data.id2)
        logging.info(f"Второй: {temp}")
        await notify_players(str(temp.id), temp)
    return GameResponse(game=temp, tokens={"player1": str(temp.player1), "player2": str(temp.player2)})



@router.post("/", response_model=GameResponse)
async def create_game(data: CreateGameGTO):
    # Создание новой настройки игры
    settings_id = len(settings_store) + 1  # Генерация нового ID для настроек
    new_settings = Settings(stones_count=data.beans,
                            holes_count=data.holes, turn_time=data.time_per_move)
    settings_store[str(id)] = new_settings

    board = [data.beans] * (data.holes)
    board.insert(0, 0)
    board.insert(len(board), 0)

    new_game = Game(
        id=str(data.id),
        player1=str(-1),  # Задайте соответствующие значения для игроков
        player2=str(-1),
        board=board,
        current_turn=str(0),
        token=data.token
    )
    games_store[str(data.id)] = new_game

    # Генерация токенов и сохранение соответствий
    token1 = str(uuid.uuid4())
    token2 = str(uuid.uuid4())
    token_to_game_id[token1] = str(data.id)
    token_to_game_id[token2] = str(data.id)
    await notify_players(str(data.id), new_game)
    logging.info(f"Активное соединение: {games_store}")
    return GameResponse(game=new_game, tokens={"player1": token1, "player2": token2})

# Уведомление игроков об обновлениях игры


async def notify_players(game_id: str, game: Game):
    logging.info(f"Э бля")
    message = {"type": "game_update", "game": game.dict()}
    for player in [game.token]:
        logging.info(f"Зашли в notify")
        if player in active_connections:
            logging.info(f"Активное соединение: {active_connections[player]}")
            await active_connections[player].send_json(message)

# WebSocket для подключения игроков


@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    await websocket.accept()

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


# Выполнение хода
@router.post("/move/{game_id}/{pit_index}")
def make_move(game_id: str, pit_index: int):
    game = games_store.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.current_turn not in [game.player1, game.player2]:
        raise HTTPException(status_code=400, detail="Invalid player")

    # Проверка на допустимость хода
    num_pits = len(game.board) - 2  # Количество лунок (первый и последний элементы - калахи)
    if pit_index < 1 or pit_index > num_pits or game.board[pit_index] == 0:
        raise HTTPException(status_code=400, detail="Invalid move")

    stones = game.board[pit_index]
    game.board[pit_index] = 0  # Убираем камни из выбранной лунки
    index = pit_index

    # Распределение камней
    while stones > 0:
        index += 1
        if index == len(game.board):  # Пропускаем калах второго игрока
            index += 1
        if index >= len(game.board):  # Зацикливаем на начало
            index = 0
        game.board[index] += 1
        stones -= 1

    # Проверка результата последнего камня
    if index == 0:  # Если последний камень попал в калах первого игрока
        pass  # Игрок ходит снова
    elif index == len(game.board) - 1:  # Если последний камень попал в калах второго игрока
        pass  # Ничего не делаем, ход переходит к другому игроку
    elif game.board[index] == 1:  # Если последний камень попал в пустую лунку
        opposite_index = (num_pits + 1) - index  # Находим противоположную лунку
        if game.board[opposite_index] > 0:  # Проверяем, что в противоположной лунке есть камни
            if game.current_turn == game.player1:
                game.board[0] += 1 + game.board[opposite_index]  # Переносим в калах первого игрока
                game.board[opposite_index] = 0  # Очищаем противоположную лунку
            else:
                game.board[-1] += 1 + game.board[opposite_index]  # Переносим в калах второго игрока
                game.board[opposite_index] = 0  # Очищаем противоположную лунку

    # Смена текущего игрока
    game.current_turn = game.player2 if game.current_turn == game.player1 else game.player1

    return game

# Проверка условий окончания игры
@router.get("/check_winner/{game_id}")
def check_winner(game_id: str):
    game = games_store.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    player1_stones = game.board[0]  # Калах первого игрока
    player2_stones = game.board[-1]  # Калах второго игрока
    num_pits = len(game.board) - 2  # Количество лунок

    player1_pits_empty = all(stone == 0 for stone in game.board[1:num_pits + 1])  # Проверка пустоты лунок игрока 1
    player2_pits_empty = all(stone == 0 for stone in game.board[1:num_pits + 1])  # Проверка пустоты лунок игрока 2

    if player1_pits_empty or player2_pits_empty:
        # Перенос оставшихся камней в калах
        if player1_pits_empty:
            for i in range(1, num_pits + 1):
                player2_stones += game.board[i]
                game.board[i] = 0
        else:
            for i in range(1, num_pits + 1):
                player1_stones += game.board[i]
                game.board[i] = 0

        # Определение победителя
        if player1_stones > player2_stones:
            return {"winner": game.player1, "score": player1_stones}
        elif player2_stones > player1_stones:
            return {"winner": game.player2, "score": player2_stones}
        else:
            return {"winner": "draw", "score": player1_stones}

    return {"status": "ongoing"}

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
