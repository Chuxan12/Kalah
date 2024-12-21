import re
from typing import Self
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator, computed_field
from app.auth.utils import get_password_hash
from typing import Optional


class EmailModel(BaseModel):
    email: EmailStr = Field(description="Электронная почта")
    model_config = ConfigDict(from_attributes=True)


class UserBase(EmailModel):
    first_name: str = Field(min_length=3, max_length=50,
                            description="Имя, от 3 до 50 символов")


class SUserRegister(UserBase):
    password: str = Field(min_length=5, max_length=50,
                          description="Пароль, от 5 до 50 знаков")
    confirm_password: str = Field(
        min_length=5, max_length=50, description="Повторите пароль")

    @model_validator(mode="after")
    def check_password(self) -> Self:
        if self.password != self.confirm_password:
            raise ValueError("Пароли не совпадают")
        # хешируем пароль до сохранения в базе данных
        self.password = get_password_hash(self.password)
        return self


class SUserAddDB(UserBase):
    password: str = Field(
        min_length=5, description="Пароль в формате HASH-строки")


class SUserAuth(EmailModel):
    password: str = Field(min_length=5, max_length=50,
                          description="Пароль, от 5 до 50 знаков")


class SUserInfo(UserBase):
    id: int = Field(description="Идентификатор пользователя")

class SUserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=50, description="Имя пользователя. Оставьте пустым, если не хотите менять.")
    avatar: Optional[str] = Field(None, description="URL или путь к изображению аватара. Оставьте пустым, если не хотите менять.")
    password: Optional[str] = Field(None, min_length=5, max_length=50, description="Пароль, от 5 до 50 знаков. Оставьте пустым, если не хотите менять.")