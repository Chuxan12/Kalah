from pydantic import BaseModel, EmailStr, conint
from typing import List, Optional


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
