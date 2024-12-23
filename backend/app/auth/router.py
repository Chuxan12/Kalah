from typing import List
from fastapi import APIRouter, Response, Depends
from app.auth.dependencies import get_current_user, get_current_admin_user, get_user_by_id
from app.auth.models import User
from app.exceptions import UserAlreadyExistsException, IncorrectEmailOrPasswordException
from app.auth.auth import authenticate_user, create_access_token
from app.auth.dao import UsersDAO
from app.auth.schemas import SUserRegister, SUserAuth, EmailModel, SUserAddDB, SUserInfo, SUserUpdate, UserGetDTO
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.utils import get_password_hash
from app.auth.utils import verify_password
import logging
from fastapi import HTTPException, status

from app.dao.session_maker import TransactionSessionDep, SessionDep

router = APIRouter(prefix='/auth', tags=['Auth'])


@router.post("/register/")
async def register_user(response: Response, user_data: SUserRegister, session: AsyncSession = TransactionSessionDep) -> dict:
    user = await UsersDAO.find_one_or_none(session=session, filters=EmailModel(email=user_data.email))
    if user:
        raise UserAlreadyExistsException
    user_data_dict = user_data.model_dump()
    del user_data_dict['confirm_password']
    new_user = await UsersDAO.add(session=session, values=SUserAddDB(**user_data_dict))
    access_token = create_access_token({"sub": str(new_user.id)})
    response.set_cookie(key="users_access_token", value=access_token, httponly=True)
    return {'message': f'Вы успешно зарегистрированы!'}


@router.post("/login/")
async def auth_user(response: Response, user_data: SUserAuth, session: AsyncSession = SessionDep):
    check = await authenticate_user(session=session, email=user_data.email, password=user_data.password)
    if check is None:
        raise IncorrectEmailOrPasswordException
    access_token = create_access_token({"sub": str(check.id)})
    response.set_cookie(key="users_access_token", value=access_token, httponly=True)
    return {'ok': True, 'access_token': access_token, 'message': 'Авторизация успешна!'}


@router.post("/logout/")
async def logout_user(response: Response):
    response.delete_cookie(key="users_access_token")
    return {'message': 'Пользователь успешно вышел из системы'}


@router.get("/me/")
async def get_me(user_data: User = Depends(get_current_user)) -> UserGetDTO:
    return user_data

@router.get("/get_user_by_id/")
async def get_me(id: int, user_data: User = Depends(get_user_by_id)) -> UserGetDTO:
    return user_data


@router.get("/all_users/")
async def get_all_users(session: AsyncSession = SessionDep,
                        user_data: User = Depends(get_current_user)) -> List[SUserInfo]:
    return await UsersDAO.find_all(session=session, filters=None)

@router.put("/update")
async def update_user(
    user_data: SUserUpdate,
    session: AsyncSession = TransactionSessionDep,
    current_user: dict = Depends(get_current_user) 
) -> dict:
    # Получаем текущего пользователя из базы данных
    user = await UsersDAO.find_one_or_none(session=session, filters=EmailModel(email=current_user["email"]))
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                                detail='Пользователь не найден')

    # Проверяем совпадение старого пароля
    if user_data.old_password is not None:
        if not verify_password(plain_password=user_data.old_password, hashed_password=user.password):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                                  detail='Старый пароль не совпадает')

    # Обновляем поля пользователя в зависимости от переданных данных
    if user_data.first_name is not None:
        user.first_name = user_data.first_name
    if user_data.avatar is not None:
        user.avatar = user_data.avatar
    if user_data.password:  # Если новый пароль передан, хешируем его
        user.password = get_password_hash(user_data.password)

    # Применяем изменения в базе данных
    await UsersDAO.update(session=session, user=user)

    return {'message': 'Данные пользователя успешно обновлены!'}