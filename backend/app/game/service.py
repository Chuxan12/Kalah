import random
from typing import List, Optional
from app.game.models import Game, Settings, GameResponse
import logging

class KalahBot:
    def __init__(self, player_name: str, difficulty: str):
        self.player_name = player_name
        self.difficulty = self.set_difficulty(difficulty)

    def set_difficulty(self, difficulty: str) -> int:
        if difficulty == "easy":
            return 1
        elif difficulty == "medium":
            return 3
        elif difficulty == "hard":
            return 5
        else:
            raise ValueError("Invalid difficulty level")

    def choose_move(self, game: 'Game') -> Optional[int]:
        best_move, _ = self.minimax(game, self.difficulty, True)
        return best_move

    def minimax(self, game: 'Game', depth: int, maximizing_player: bool):
        if depth == 0 or self.is_terminal(game):
            return None, self.evaluate(game)

        best_move = None
        if maximizing_player:
            max_eval = float('-inf')
            for i in range(1, len(game.board) // 2):  # Игрока 1
                if game.board[i] > 0:
                    temp_game = self.simulate_move(game, i)
                    eval = self.minimax(temp_game, depth - 1, False)[1]
                    if eval > max_eval:
                        max_eval = eval
                        best_move = i
            return best_move, max_eval
        else:
            min_eval = float('inf')
            for i in range(len(game.board) // 2 + 1, len(game.board) - 1):  # Игрока 2
                if game.board[i] > 0:
                    temp_game = self.simulate_move(game, i)
                    eval = self.minimax(temp_game, depth - 1, True)[1]
                    if eval < min_eval:
                        min_eval = eval
                        best_move = i
            return best_move, min_eval

    def is_terminal(self, game: 'Game') -> bool:
        # Проверка, закончилась ли игра
        return sum(game.board[1:len(game.board)//2]) == 0 or sum(game.board[len(game.board)//2 + 1:]) == 0

    def evaluate(self, game: 'Game') -> int:
        # Простая оценка: разница в камнях
        return game.board[0] - game.board[len(game.board) // 2 + 1]

    def simulate_move(self, game: 'Game', pit_index: int) -> 'Game':
        # Создаем копию текущей игры
        temp_game = Game(
            id=game.id,
            player1=game.player1,
            player2=game.player2,
            board=game.board.copy(),
            current_turn=game.current_turn,
            winner=game.winner,
            token=game.token
        )

        num_pits = len(temp_game.board)
        logging.info(f"Игра1:{temp_game}")
        temp = []
        for i in range(0, len(temp_game.board)):
            temp.append(temp_game.board[i])
        logging.info(f"Игра11:{temp}")
        stones = temp[pit_index]
        temp[pit_index] = 0  # Убираем камни из выбранной лунки
        index = pit_index
        # Распределение камней
        if (game.current_turn == game.player1):
            while stones > 0:
                index += 1
                if index == 0:  # Пропускаем калах второго игрока
                    index += 1
                if index >= len(game.board):  # Зацикливаем на начало
                    index = 1
                if (stones == 1):
                    if (index != 0):
                        if (index < len(temp_game.board)//2):
                            if (temp[index] == 0):
                                temp[len(game.board) //
                                    2] += temp[len(temp_game.board) - index] + 1
                                temp[len(temp_game.board) - index] = 0
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
        if (temp_game.current_turn == temp_game.player2):
            while stones > 0:
                index += 1
                if index == len(temp_game.board)//2:  # Пропускаем калах первого игрока
                    index += 1
                if index >= len(temp_game.board):  # Зацикливаем на начало
                    index = 0
                if (stones == 1):
                    if (index != len(temp_game.board) - 1):
                        if (index >= len(temp_game.board)//2):
                            if (temp[index] == 0):
                                temp[0] += temp[len(temp_game.board) - index + 1] + 1
                                temp[len(temp_game.board) - index] = 0
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

        for i in range(0, len(temp_game.board)):
            temp_game.board[i] = temp[i]
        if (temp_game.current_turn == temp_game.player1) and (index == len(temp_game.board)//2):
            temp_game.current_turn = temp_game.player1
        elif (temp_game.current_turn == temp_game.player2) and (index == 0):
            temp_game.current_turn = temp_game.player2
        else:
            temp_game.current_turn = temp_game.player2 if temp_game.current_turn == temp_game.player1 else temp_game.player1

        total_stones = 0
        for i in range(len(temp_game.board)):
            total_stones += temp_game.board[i]
        if (temp_game.board[0] > total_stones/2):
            temp_game.winner = temp_game.player2
            return game
        if (temp_game.board[len(temp_game.board)//2] > total_stones/2):
            temp_game.winner = temp_game.player1
            return temp_game
        flag1 = True
        for i in range(1, len(temp_game.board)//2):
            if (temp[i] != 0):
                flag1 = False
        if (flag1):
            for i in range(1, len(temp_game.board)//2):
                temp[len(temp_game.board)//2] += temp[i]
        flag2 = True
        for i in range(len(temp_game.board)//2, len(temp_game.board)-1):
            if (temp[i] != 0):
                flag2 = False
        if (flag2):
            for i in range(len(temp_game.board)//2, len(temp_game.board)):
                temp[0] += temp[i]
        if (flag1 or flag2):
            if (temp_game.board[0] > temp_game.board[len(temp_game.board)//2]):
                game.winner = game.player2
            elif (temp_game.board[0] < temp_game.board[len(temp_game.board)//2]):
                temp_game.winner = temp_game.player1
            else:
                temp_game.winner = "draw"
        return temp_game

# Пример использования бота
# @router.post("/play_bot/{game_id}/{difficulty}")
# def play_with_bot(game_id: str, difficulty: str):
#     game = games_store.get(game_id)
#     if not game:
#         raise HTTPException(status_code=404, detail="Game not found")

#     bot = KalahBot(player_name=game.player2, difficulty=difficulty)

#     # Бот делает ход
#     move = bot.choose_move(game)
#     if move is not None:
#         return make_move_and_check_winner(game_id, move)
#     else:
#         return {"message": "No available moves for the bot."}