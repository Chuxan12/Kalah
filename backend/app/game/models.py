from sqlalchemy import ForeignKey, Integer, String, Text, UUID
from sqlalchemy.orm import Mapped, relationship, mapped_column
from sqlalchemy.ext.declarative import declarative_base
from app.auth.models import User
from app.dao.database import Base, str_uniq


class Game(Base):
    __tablename__ = 'games'

    id: Mapped[int] = mapped_column(primary_key=True)
    player1_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    player2_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    settings_id: Mapped[int] = mapped_column(ForeignKey('settings.id'))

    settings: Mapped["Settings"] = relationship("Settings", back_populates="games")
    holes: Mapped[list["Hole"]] = relationship("Hole", back_populates="game")
    kalahas: Mapped[list["Kalaha"]] = relationship("Kalaha", back_populates="game")

    # Изменено: используем строковые ссылки для player1_id и player2_id
    players: Mapped[list["User"]] = relationship(
        "User",
        primaryjoin="or_(User.id==Game.player1_id, User.id==Game.player2_id)",
        backref="games"
    )

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self.id}, player1_id={self.player1_id}, player2_id={self.player2_id})"



class Settings(Base):
    __tablename__ = 'settings'

    id: Mapped[int] = mapped_column(primary_key=True)
    stones_count: Mapped[int] = mapped_column(Integer)  # Количество камней
    holes_count: Mapped[int] = mapped_column(Integer)  # Количество лунок
    turn_time: Mapped[int] = mapped_column(Integer)  # Время на ход
    games: Mapped[list["Game"]] = relationship(
        "Game", back_populates="settings")

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self.id}, stones_count={self.stones_count}, holes_count={self.holes_count}, turn_time={self.turn_time})"


class Hole(Base):
    __tablename__ = 'holes'

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[int] = mapped_column(Integer)  # Номер лунки
    stones_count: Mapped[int] = mapped_column(Integer)  # Количество камней
    game_id: Mapped[int] = mapped_column(ForeignKey('games.id'))
    game: Mapped[Game] = relationship("Game", back_populates="holes")

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self.id}, number={self.number}, stones_count={self.stones_count})"


class Kalaha(Base):
    __tablename__ = 'kalahas'

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[int] = mapped_column(Integer)  # Номер калаха
    stones_count: Mapped[int] = mapped_column(Integer)  # Количество камней
    game_id: Mapped[int] = mapped_column(ForeignKey('games.id'))
    game: Mapped[Game] = relationship("Game", back_populates="kalahas")

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self.id}, number={self.number}, stones_count={self.stones_count})"
