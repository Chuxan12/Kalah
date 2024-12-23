from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .models import Game, Settings, Hole, Kalaha
from app.auth.models import User  # Импортируем User
from app.auth.dependencies import get_current_user  # Предполагаем, что у вас есть зависимости
from uuid import uuid4
from typing import Dict, List
from app.dao.database import Base, str_uniq
from app.dao.session_maker import TransactionSessionDep, SessionDep


router = APIRouter(prefix="/games", tags=["Games"])

# Временное хранилище в памяти
games_store: Dict[str, 'Game'] = {}  # Хранение игр
settings_store: Dict[int, 'Settings'] = {}  # Хранение настроек (пример, ID -> объект)

# Пример настроек для игры (можно расширить или изменить)
default_settings = {
    1: {'stones_count': 4, 'holes_count': 6, 'turn_time': 30}  # Пример настроек
}
settings_store.update({id: Settings(**data) for id, data in default_settings.items()})

class Game:
    def __init__(self, player1_id: int, player2_id: int, settings: 'Settings'):
        self.id = str(uuid4())
        self.player1_id = player1_id
        self.player2_id = player2_id
        self.settings = settings
        self.holes = [settings.stones_count] * settings.holes_count  # Инициализация лунок
        self.kalaha1 = 0  # Калаха игрока 1
        self.kalaha2 = 0  # Калаха игрока 2

class Settings:
    def __init__(self, stones_count: int, holes_count: int, turn_time: int):
        self.stones_count = stones_count
        self.holes_count = holes_count
        self.turn_time = turn_time

# Создание новой игры
@router.post("/", response_model=dict)
async def create_game(
    player2_id: int,  # ID второго игрока
    settings_id: int,  # ID настроек игры
    current_user: User = Depends(get_current_user),
):
    # Проверяем, существуют ли настройки
    settings = settings_store.get(settings_id)
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")

    new_game = Game(player1_id=current_user.id, player2_id=player2_id, settings=settings)
    games_store[new_game.id] = new_game  # Сохраняем игру в хранилище

    return {"game_id": new_game.id, "player1_id": new_game.player1_id, "player2_id": new_game.player2_id}

# Совершение хода
@router.post("/{game_id}/moves")
async def make_move(game_id: str, hole_index: int, current_user: User = Depends(get_current_user)):
    game = games_store.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    # Проверяем, что текущий пользователь является игроком в игре
    if current_user.id not in [game.player1_id, game.player2_id]:
        raise HTTPException(status_code=403, detail="You are not a participant in this game")

    # Проверяем, что выбранная лунка не пуста
    if game.holes[hole_index] == 0:
        raise HTTPException(status_code=400, detail="The selected hole is empty")

    # Логика распределения камней (упрощенная)
    stones_to_distribute = game.holes[hole_index]
    game.holes[hole_index] = 0

    # Здесь должна быть логика распределения камней...

    return {"message": "Move made successfully"}

# Получение состояния игры
@router.get("/{game_id}", response_model=dict)
async def get_game_state(game_id: str):
    game = games_store.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    return {
        "game_id": game.id,
        "player1_id": game.player1_id,
        "player2_id": game.player2_id,
        "holes": game.holes,
        "kalaha1": game.kalaha1,
        "kalaha2": game.kalaha2,
        "settings": {
            "stones_count": game.settings.stones_count,
            "holes_count": game.settings.holes_count,
            "turn_time": game.settings.turn_time,
        }
    }

# Получение всех игр игрока
@router.get("/my-games/", response_model=List[dict])
async def get_my_games(current_user: User = Depends(get_current_user)):
    user_games = [game for game in games_store.values() if game.player1_id == current_user.id or game.player2_id == current_user.id]
    return [{"game_id": game.id, "player1_id": game.player1_id, "player2_id": game.player2_id} for game in user_games]

# # Эндпоинт для создания новых настроек
# @router.post("/settings/", response_model=dict)
# async def create_settings(
#     stones_count: int,
#     holes_count: int,
#     turn_time: int,
#     current_user: User = Depends(get_current_user),
#     db: AsyncSession = Depends(SessionDep)  # Предполагаем, что у вас есть зависимость для получения базы данных
# ):
#     # Создаем новую настройку
#     new_setting = Settings(stones_count=stones_count, holes_count=holes_count, turn_time=turn_time)

#     # Добавляем настройку в базу данных
#     db.add(new_setting)
#     await db.commit()
#     await db.refresh(new_setting)

#     return {"id": new_setting.id, "stones_count": new_setting.stones_count, "holes_count": new_setting.holes_count, "turn_time": new_setting.turn_time}
