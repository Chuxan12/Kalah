from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.models import User
from app.dao.base import BaseDAO

class UsersDAO(BaseDAO):
    model = User

    @staticmethod
    async def update(session: AsyncSession, user: User):
        # Если нужно обновить только атрибуты, просто измените их
        try:
            # Сначала проверяем, что объект пользователя существует в сессии
            # Если это не так, мы можем извлечь его из базы данных
            existing_user = await session.get(User, user.id)
            if existing_user is None:
                raise ValueError("Пользователь не найден")

            # Обновляем атрибуты пользователя
            existing_user.first_name = user.first_name
            if user.password:
                existing_user.password = user.password  # Здесь предполагается, что пароль уже захеширован

            # Сохраняем изменения
            await session.commit()
        except Exception as e:
            await session.rollback()  # Откатываем изменения в случае ошибки
            raise e  # Повторно выбрасываем исключение для обработки выше