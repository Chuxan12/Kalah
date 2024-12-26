from fastapi import Request, HTTPException, status, Depends
from sqlalchemy.future import select
from jose import jwt, JWTError
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.exceptions import TokenExpiredException, NoJwtException, NoUserIdException, ForbiddenException, TokenNoFound
from app.auth.dao import UsersDAO
from app.auth.models import User, UserStatistics
from app.dao.session_maker import SessionDep
import logging
from contextlib import asynccontextmanager
from typing import Callable, Optional, AsyncGenerator
from fastapi import Depends
from loguru import logger
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession
from sqlalchemy import text
from functools import wraps

from app.dao.database import async_session_maker


async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
    """
    Зависимость для FastAPI, возвращающая сессию без управления транзакцией.
    """
    async with self.create_session() as session:
        yield session

def get_token(request: Request):
    token = request.cookies.get('users_access_token')
    logging.info(token)
    if not token:
        raise TokenNoFound
    return token


async def get_current_user(token: str = Depends(get_token), session: AsyncSession = SessionDep):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY,
                             algorithms=settings.ALGORITHM)
    except JWTError:
        raise NoJwtException

    expire: str = payload.get('exp')
    expire_time = datetime.fromtimestamp(int(expire), tz=timezone.utc)
    if (not expire) or (expire_time < datetime.now(timezone.utc)):
        raise TokenExpiredException

    user_id: str = payload.get('sub')
    if not user_id:
        raise NoUserIdException

    user = await UsersDAO.find_one_or_none_by_id(data_id=int(user_id), session=session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')
    query = select(UserStatistics).where(UserStatistics.user_id == user.id)
    result = await session.execute(query)
    result = result.scalar_one_or_none()
    logging.debug(result)
    user_info = {
        "id": user.id,
        "first_name": user.first_name,
        "email": user.email,
        "avatar": user.avatar,
        "wins": result.wins if result else 0,
        "games": result.games_played if result else 0
    }
    logging.debug(user_info)
    return user_info


async def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role.id in [3, 4]:
        return current_user
    raise ForbiddenException


async def get_user_by_id(id: int, session: AsyncSession = SessionDep):
    user = await UsersDAO.find_one_or_none_by_id(data_id=int(id), session=session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')
    query = select(UserStatistics).where(UserStatistics.user_id == user.id)
    result = await session.execute(query)
    result = result.scalar_one_or_none()
    logging.debug(result)
    user_info = {
        "id": user.id,
        "first_name": user.first_name,
        "email": user.email,
        "avatar": user.avatar,
        "wins": result.wins if result else 0,
        "games": result.games_played if result else 0
    }
    logging.debug(user_info)
    return user_info