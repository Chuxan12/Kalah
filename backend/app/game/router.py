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
    if temp.player1 == "-1" or temp.player1 == str(data.id1):
        temp.player1 = str(data.id1)
        temp.current_turn = str(data.id1)
        logging.info(f"Первый: {temp}")
    else:
        temp.player2 = str(data.id1)
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
    if (data.holes > 14 or data.holes < 6):
        raise HTTPException(status_code=400, detail="Invalid holes")
    if (data.beans < 3 or data.beans > 10):
        raise HTTPException(status_code=400, detail="Invalid beans")
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
@router.post("/move/{game_id}/{pit_index}", response_model=Game)
async def make_move(game_id: str, pit_index: int):
    game = games_store.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    if game.current_turn not in [game.player1, game.player2]:
        raise HTTPException(status_code=400, detail="Invalid player")
    if game.current_turn == game.player1 and pit_index >= len(game.board)//2:
        raise HTTPException(status_code=400, detail="Invalid index")
    if game.current_turn == game.player2 and pit_index < len(game.board)//2:
        raise HTTPException(status_code=400, detail="Invalid index")

    # Проверка на допустимость хода
    # Количество лунок (первый и последний элементы - калахи)
    num_pits = len(game.board) - 2
    if pit_index < 1 or pit_index > num_pits or game.board[pit_index] == 0:
        raise HTTPException(status_code=400, detail="Invalid move")

    logging.info(f"Игра1:{game}")
    temp = []
    for i in range(0, len(game.board)//2):
        temp.append(game.board[i])
    for i in range(len(game.board) - 2, len(game.board)//2 - 1, -1):
        temp.append(game.board[i])
    temp.append(game.board[len(game.board) - 1])
    logging.info(f"Игра11:{temp}")
    stones = temp[pit_index]
    temp[pit_index] = 0  # Убираем камни из выбранной лунки
    index = pit_index
    # Распределение камней
    if (game.current_turn == game.player1):
        while stones > 0:
            index += 1
            if index == len(game.board) - 1:  # Пропускаем калах второго игрока
                index += 1
            if index >= len(game.board):  # Зацикливаем на начало
                index = 0
            if (stones == 1):
                if (index != 0):
                    if (index < len(game.board)//2):
                        if (temp[index] == 0):
                            temp[0] += temp[len(game.board) - 1 - index] + 1
                            temp[len(game.board) - 1 - index] = 0
                            stones -= 1
                        else:
                            temp[index] += 1
                            stones -= 1
                    else:
                        temp[index] += 1
                        stones -= 1
                else:
                    temp[index] += 1
                    stones -= 1
            else:
                temp[index] += 1
                stones -= 1
    if (game.current_turn == game.player2):
        while stones > 0:
            index += 1
            if index == 0:  # Пропускаем калах первого игрока
                index += 1
            if index >= len(game.board):  # Зацикливаем на начало
                index = 1
            if (stones == 1):
                if (index != len(game.board) - 1):
                    if (index >= len(game.board)//2):
                        if (temp[index] == 0):
                            temp[len(game.board) -
                                 1] += temp[len(game.board) - 1 - index] + 1
                            temp[len(game.board) - 1 - index] = 0
                            stones -= 1
                        else:
                            temp[index] += 1
                            stones -= 1
                    else:
                        temp[index] += 1
                        stones -= 1
                else:
                    temp[index] += 1
                    stones -= 1
            else:
                temp[index] += 1
                stones -= 1

    logging.info(f"Игра2:{temp}")
    game.board[0] = temp[0]
    game.board[len(game.board)-1] = temp[len(game.board)-1]
    for i in range(1, len(game.board)//2):
        game.board[i] = temp[i]
    cnt = 0
    for i in range(len(game.board)//2, len(game.board)-1):
        game.board[i] = temp[len(game.board)-2 - cnt]
        cnt += 1
    if (game.current_turn == game.player1) and (index == 0):
        game.current_turn = game.player1
    elif (game.current_turn == game.player2) and (index == len(game.board)-1):
        game.current_turn = game.player2
    else:
        game.current_turn = game.player2 if game.current_turn == game.player1 else game.player1

    total_stones = 0
    for i in range(len(game.board)):
        total_stones += game.board[i]
    if (game.board[0] > total_stones/2):
        game.winner = game.player1
        await notify_players(str(game_id), game)
        return game
    if (game.board[len(game.board)-1] > total_stones/2):
        game.winner = game.player2
        await notify_players(str(game_id), game)
        return game
    flag1 = True
    for i in range(1, len(game.board)//2):
        if (temp[i] != 0):
            flag1 = False
    if (flag1):
        for i in range(1, len(game.board)//2):
            temp[0] += temp[i]
    flag2 = True
    for i in range(len(game.board)//2, len(game.board)-1):
        if (temp[i] != 0):
            flag2 = False
    if (flag2):
        for i in range(1, len(game.board)//2):
            temp[len(game.board)-1] += temp[i]
    if (flag1 or flag2):
        if (game.board[0] > game.board[len(game.board)-1]):
            game.winner = game.player1
        elif (game.board[0] < game.board[len(game.board)-1]):
            game.winner = game.player2
        else:
            game.winner = "draw"
    await notify_players(str(game_id), game)
    return game

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
