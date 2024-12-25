from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from app.game.models import Game, Settings, GameResponse
from app.game.dto import CreateGameGTO, SetPlayersDTO
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
    board = [data.beans] * (data.holes)
    board.insert(0, 0)
    board.insert(len(board), 0)

    new_game = Game(
        id=str(data.id),
        player1=str(-1),  # Задайте соответствующие значения для игроков
        player2=str(-1),
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


@router.post("/{game_id}/move/")
async def make_move(game_id: str, player: str, pit_index: int):
    game = games_store.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if player != game.current_turn:
        raise HTTPException(status_code=400, detail="It's not your turn")

    if pit_index < 0 or pit_index >= len(game.board) or game.board[pit_index] == 0:
        raise HTTPException(status_code=400, detail="Invalid move")

    # # Логика хода
    # stones = game.board[pit_index]
    # game.board[pit_index] = 0
    # if (pit_index + 1 < game.board[:len(game.board)//2]):
    #     index = pit_index + 1
    # else:
    #     index = len(game.board)-2
    # if (game.current_turn == game.player1):
    #     while stones > 0:
    #         if (index + 1 < game.board[:len(game.board)//2]):
    #             game.board[index] += 1
    #             index += 1
    #             stones -= 1
    #         else:
    #             game.board[index] += 1
    #             stones -= 1
    #             index -= 1
    # if (game.current_turn == game.player2):
    #     while stones > 0:
    #         if (index + 1 < game.board[:len(game.board)//2]):
    #             game.board[index] += 1
    #             index += 1
    #             stones -= 1
    #         else:
    #             game.board[index] += 1
    #             stones -= 1
    #             index -= 1

# Проверка на допустимость хода
    # pit_index от 1 до 10, так как 0 - это калах первого игрока, а 11 - калах второго игрока
    if pit_index < 1 or pit_index > len(game.board) - 2 or game.board[pit_index] == 0:
        raise HTTPException(status_code=400, detail="Invalid move")

    # # Логика хода
    # stones = game.board[pit_index]
    # game.board[pit_index] = 0
    # if (pit_index + 1 < game.board[:len(game.board)//2]):
    #     index = pit_index + 1
    # else:
    #     index = len(game.board)-2
    # if (game.current_turn == game.player1):
    #     while stones > 0:
    #         if (index + 1 < game.board[:len(game.board)//2]):
    #             game.board[index] += 1
    #             index += 1
    #             stones -= 1
    #         else:
    #             game.board[index] += 1
    #             stones -= 1
    #             index -= 1
    # if (game.current_turn == game.player2):
    #     while stones > 0:
    #         if (index + 1 < game.board[:len(game.board)//2]):
    #             game.board[index] += 1
    #             index += 1
    #             stones -= 1
    #         else:
    #             game.board[index] += 1
    #             stones -= 1
    #             index -= 1

# Проверка на допустимость хода
    # pit_index от 1 до 10, так как 0 - это калах первого игрока, а 11 - калах второго игрока
    if pit_index < 1 or pit_index > len(game.board) - 2 or game.board[pit_index] == 0:
        raise HTTPException(status_code=400, detail="Invalid move")

    stones = game.board[pit_index]
    game.board[pit_index] = 0  # Убираем камни из выбранной лунки
    index = pit_index
    game.board[pit_index] = 0  # Убираем камни из выбранной лунки
    index = pit_index

    # Распределение камней
    # Распределение камней
    while stones > 0:
        index += 1
        if index == 12:  # Если дошли до конца, пропускаем калах второго игрока (board[11])
            index += 1
        if index > 12:  # Если вышли за границы, возвращаемся в начало
        index += 1
        if index == 12:  # Если дошли до конца, пропускаем калах второго игрока (board[11])
            index += 1
        if index > 12:  # Если вышли за границы, возвращаемся в начало
            index = 0
        game.board[index] += 1
        stones -= 1

    # Проверка, попал ли последний камень в калах
    if index == 0:  # Последний камень попал в калах первого игрока
        pass  # Игрок ходит снова
    elif index == 11:  # Последний камень попал в калах второго игрока
        pass  # Ничего не делаем, ход переходит к другому игроку
    else:
        # Проверка на захват камней
        if game.board[index] == 1 and game.board[10 - index] > 0:  # Пустая лунка и непустая противоположная
            if game.current_turn == game.player1:
                game.board[0] += 1  # Переносим в калах первого игрока
                game.board[0] += game.board[10 - index]  # Переносим камни из противоположной лунки
                game.board[10 - index] = 0  # Очищаем противоположную лунку
            else:
                game.board[11] += 1  # Переносим в калах второго игрока
                game.board[11] += game.board[10 - index]  # Переносим камни из противоположной лунки
                game.board[10 - index] = 0  # Очищаем противоположную лунку

    # Смена текущего игрока
    game.current_turn = game.player2 if game.current_turn == game.player1 else game.player1

    # Проверка условий победы
    if all(stone == 0 for stone in game.board[1:7]):  # Если все лунки первого игрока пусты
        game.board[11] += sum(game.board[7:11])  # Переносим камни второго игрока в его калах
        game.board[7:11] = [0] * 4  # Очищаем лунки второго игрока
    elif all(stone == 0 for stone in game.board[7:11]):  # Если все лунки второго игрока пусты
        game.board[0] += sum(game.board[1:7])  # Переносим камни первого игрока в его калах
        game.board[1:7] = [0] * 6  # Очищаем лунки первого игрока


    # Смена текущего игрока
    game.current_turn = game.player2 if game.current_turn == game.player1 else game.player1

    # Проверка условия победы
    # Предположим, что первые половина - это игрок 1
    player1_stones = sum(game.board[:len(game.board)//2])
    # Вторая половина - это игрок 2
    player2_stones = sum(game.board[len(game.board)//2:])

    if player1_stones == 0 or player2_stones == 0:
        winner = game.player1 if player1_stones > player2_stones else game.player2
        return {
            "message": "Game over",
            "winner": winner,
            "game": game
        }

    # Проверка условия победы
    # Предположим, что первые половина - это игрок 1
    player1_stones = sum(game.board[:len(game.board)//2])
    # Вторая половина - это игрок 2
    player2_stones = sum(game.board[len(game.board)//2:])

    if player1_stones == 0 or player2_stones == 0:
        winner = game.player1 if player1_stones > player2_stones else game.player2
        return {
            "message": "Game over",
            "winner": winner,
            "game": game
        }

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
