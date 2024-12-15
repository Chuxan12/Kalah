from app.dao.database import Base, str_uniq
from sqlalchemy import ForeignKey, Integer, String, Text, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Mapped, mapped_column, relationship


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(50))  # Добавляем имя
    email: Mapped[str] = mapped_column(
        String(100), unique=True)  # Уникальная почта
    # Аватар (может быть URL или путь к изображению)
    avatar: Mapped[str] = mapped_column(Text)
    password: Mapped[str] = mapped_column(String(100))  # Пароль
    statistics: Mapped["UserStatistics"] = relationship(
        "UserStatistics", back_populates="user", uselist=False)

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self.id}, first_name={self.first_name}, email={self.email})"


class UserStatistics(Base):
    __tablename__ = 'user_statistics'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey(
        'users.id'), unique=True)  # Связь один к одному
    wins: Mapped[int] = mapped_column(Integer, default=0)  # Количество побед
    games_played: Mapped[int] = mapped_column(
        Integer, default=0)  # Количество игр
    user: Mapped[User] = relationship("User", back_populates="statistics")

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self.id}, user_id={self.user_id}, wins={self.wins}, games_played={self.games_played})"
