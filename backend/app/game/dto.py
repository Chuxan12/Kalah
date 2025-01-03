from pydantic import BaseModel, EmailStr, conint
from typing import List, Optional
from uuid import UUID


class GameDTO(BaseModel):
    id: Optional[int]
    player1_id: Optional[int]
    player2_id: Optional[int]
    settings_id: Optional[int]


class SettingsDTO(BaseModel):
    id: Optional[int]
    stones_count: Optional[int]
    holes_count: Optional[int] 
    turn_time: Optional[int] 


class HoleDTO(BaseModel):
    id: Optional[int]
    number: Optional[int]
    stones_count: Optional[int]
    game_id: Optional[int]


class KalahaDTO(BaseModel):
    id: Optional[int]
    number: Optional[int]
    stones_count: Optional[int]
    game_id: Optional[int]


class CreateGameGTO(BaseModel):
    beans: Optional[int]
    holes: Optional[int]
    time_per_move: Optional[int]
    ai_difficulty: Optional[int]
    id: Optional[UUID]
    token: Optional[str]


class SetPlayersDTO(BaseModel):
    id1: int
    id2: int
    game_id: str