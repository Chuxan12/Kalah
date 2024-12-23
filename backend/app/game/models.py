from pydantic import BaseModel
from typing import List, Optional

class Game(BaseModel):
    id: str
    player1: str
    player2: str
    board: List[int]
    current_turn: str
    winner: Optional[str] = None

class Settings(BaseModel):
    stones_count: int
    holes_count: int
    turn_time: int
