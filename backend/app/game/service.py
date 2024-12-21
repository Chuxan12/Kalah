import uuid
from typing import List, Optional

class KalahGame:
    def __init__(self, player1_id: uuid.UUID, player2_id: uuid.UUID, settings: dict):
        self.id = uuid.uuid4()
        self.player1_id = player1_id
        self.player2_id = player2_id
        self.current_player = player1_id  # Начинаем с первого игрока
        self.holes = [settings['stones_count']] * settings['holes_count']  # Лунки с камнями
        self.kalaha1 = 0  # Калаха игрока 1
        self.kalaha2 = 0  # Калаха игрока 2
        self.settings = settings  # Настройки игры

    def make_move(self, player_id: uuid.UUID, hole_index: int):
        if player_id != self.current_player:
            raise Exception("It's not your turn!")

        if hole_index < 0 or hole_index >= len(self.holes):
            raise Exception("Invalid hole index!")

        if self.holes[hole_index] == 0:
            raise Exception("Hole is empty!")

        stones_to_distribute = self.holes[hole_index]
        self.holes[hole_index] = 0
        index = hole_index

        while stones_to_distribute > 0:
            index = (index + 1) % (len(self.holes) + 2)  # +2 для калах
            if index < len(self.holes):  # Лунки
                self.holes[index] += 1
            elif index == len(self.holes):  # Калаха первого игрока
                if player_id == self.player1_id:
                    self.kalaha1 += 1
                else:
                    continue  # Калаха второго игрока не получает камни
            elif index == len(self.holes) + 1:  # Калаха второго игрока
                if player_id == self.player2_id:
                    self.kalaha2 += 1
                else:
                    continue  # Калаха первого игрока не получает камни

            stones_to_distribute -= 1

        # После распределения камней, если последний камень попал в пустую лунку игрока, он забирает камни
        if index < len(self.holes):
            if self.holes[index] == 1 and player_id == self.current_player:
                if player_id == self.player1_id:
                    self.kalaha1 += self.holes[index]  # Забираем камни в калаху
                else:
                    self.kalaha2 += self.holes[index]  # Забираем камни в калаху
                self.holes[index] = 0

        # Меняем текущего игрока
        self.current_player = self.player2_id if self.current_player == self.player1_id else self.player1_id

    def check_winner(self) -> Optional[uuid.UUID]:
        if sum(self.holes) == 0:  # Если все лунки пустые
            # Определяем победителя
            if self.kalaha1 > self.kalaha2:
                return self.player1_id
            elif self.kalaha2 > self.kalaha1:
                return self.player2_id
            else:
                return None  # Ничья
        return None

    def get_game_state(self) -> dict:
        return {
            "id": str(self.id),
            "current_player": str(self.current_player),
            "holes": self.holes,
            "kalaha1": self.kalaha1,
            "kalaha2": self.kalaha2,
            "settings": self.settings
        }