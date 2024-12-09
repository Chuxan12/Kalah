# Шаблон приложения FastAPI с аутентификацией и авторизацией

Этот проект представляет собой готовый шаблон для разработки масштабируемых веб-приложений на основе **FastAPI** с
полноценной системой аутентификации и авторизации. Проект включает модульную архитектуру, поддерживает гибкое
логирование с **loguru**, и взаимодействие с базой данных через **SQLAlchemy** с асинхронной поддержкой. Система
миграций **Alembic** упрощает работу со схемой базы данных.

## Стек технологий

- **Веб-фреймворк**: FastAPI
- **ORM**: SQLAlchemy с асинхронной поддержкой через aiosqlite
- **База данных**: SQLite (легко заменяемая на другую SQL-СУБД)
- **Система миграций**: Alembic
- **Авторизация/Аутентификация**: bcrypt для хеширования паролей, python-jose для защиты данных с использованием JWT

## Зависимости проекта

- `fastapi[all]==0.115.0` - высокопроизводительный веб-фреймворк
- `pydantic==2.9.2` - валидация данных
- `uvicorn==0.31.0` - ASGI-сервер
- `jinja2==3.1.4` - шаблонизатор
- `SQLAlchemy==2.0.35` - ORM для работы с базами данных
- `aiosqlite==0.20.0` - асинхронная поддержка SQLite
- `alembic==1.13.3` - управление миграциями базы данных
- `bcrypt==4.0.1` и `passlib[bcrypt]==1.7.4` - хеширование паролей
- `python-jose==3.3.0` - работа с JWT токенами
- `loguru==0.7.2` - красивое и удобное логирование

## Структура проекта

Проект построен с учётом модульной архитектуры, что позволяет легко расширять приложение и упрощает его поддержку.
Каждый модуль отвечает за отдельные задачи, такие как авторизация или управление данными.

### Основная структура проекта

```
├── app/
│   ├── auth/                   # Модуль авторизации и аутентификации
│   │   ├── auth.py             # Логика входа и регистрации
│   │   ├── dao.py              # Data Access Object для работы с БД
│   │   ├── dependencies.py     # Зависимости для авторизации
│   │   ├── models.py           # Модели данных для авторизации
│   │   ├── router.py           # Роутеры FastAPI для маршрутизации
│   │   ├── schemas.py          # Схемы для валидации данных
│   │   └── utils.py            # Вспомогательные функции для авторизации
│   ├── dao/                    # Общие DAO для приложения
│   │   └── base.py             # Базовый класс DAO для работы с БД
│   ├── migration/              # Миграции базы данных
│   │   ├── versions/           # Файлы миграций
│   │   ├── env.py              # Настройки среды для Alembic
│   │   ├── README              # Документация по миграциям
│   │   └── script.py.mako      # Шаблон для генерации миграций
│   ├── static/                 # Статические файлы приложения
│   │   └── .gitkeep            # Пустой файл для сохранения папки в Git
│   ├── config.py               # Конфигурация приложения
│   ├── database.py             # Подключение к базе данных и управление сессиями
│   ├── exceptions.py           # Исключения для обработки ошибок
│   ├── main.py                 # Основной файл для запуска приложения
├── data/                       # Папка для хранения файла БД
│   └── db.sqlite3              # Файл базы данных SQLite
├── .env                        # Конфигурация окружения
├── .gitignore                  # Игнорируемые файлы для Git
├── alembic.ini                 # Конфигурация Alembic
├── README.md                   # Документация проекта
└── requirements.txt            # Зависимости проекта
```

### Основные модули

- **app/auth** - Модуль для аутентификации и авторизации:
    - **auth.py**: Логика для входа и регистрации
    - **dao.py**: Объект доступа к данным для работы с пользователями
    - **dependencies.py**: Внедрение зависимостей для авторизации
    - **models.py**: Модели данных для пользователей
    - **router.py**: Маршрутизация запросов, связанных с авторизацией
    - **schemas.py**: Схемы Pydantic для валидации запросов и ответов
    - **utils.py**: Генерация и проверка токенов

- **app/dao** - Базовый DAO для доступа к данным приложения.
    - **base.py**: Общие методы CRUD для работы с БД

- **app/migration** - Управление миграциями базы данных с помощью Alembic:
    - **versions/**: Файлы миграций
    - **env.py**: Конфигурация среды Alembic
    - **script.py.mako**: Шаблон для генерации миграций

- **config.py** - Файл конфигурации с параметрами приложения, загружаемыми из `.env`.

- **database.py** - Управление подключением и сессиями SQLAlchemy.

- **main.py** - Запуск приложения, настройка маршрутов и начальных параметров.

## Настройка аутентификации и авторизации

Для аутентификации используется JSON Web Token (JWT) с bcrypt для хеширования паролей и python-jose для генерации и
проверки токенов. Это обеспечивает безопасное хранение данных и защищает API-эндпоинты.

### Пример регистрации пользователя

```python
from fastapi import APIRouter
from app.database import SessionDepWithCommit
from app.exceptions import UserAlreadyExistsException
from app.auth.dao import UsersDAO
from app.auth.schemas import SUserRegister, EmailModel, SUserAddDB
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix='/auth', tags=['Auth'])


@router.post("/register/")
async def register_user(user_data: SUserRegister, session: AsyncSession = SessionDepWithCommit) -> dict:
    user = await UsersDAO.find_one_or_none(session=session, filters=EmailModel(email=user_data.email))
    if user:
        raise UserAlreadyExistsException
    user_data_dict = user_data.model_dump()
    del user_data_dict['confirm_password']
    await UsersDAO.add(session=session, values=SUserAddDB(**user_data_dict))
    return {'message': 'Вы успешно зарегистрированы!'}
```

## Запуск приложения

1. Клонируйте репозиторий:

   ```bash
   git clone https://github.com/Yakvenalex/FastApiWithAuthSample.git .
   ```

2. Установите зависимости:

   ```bash
   pip install -r requirements.txt
   ```

3. Создайте и настройте `.env` файл:

   ```env
   SECRET_KEY=supersecretkey
   ALGORITHM=HS256
   ```

4. Запустите приложение с Uvicorn:

   ```bash
   uvicorn app.main:app --reload
   ```

## Миграции базы данных

1. Инициализируйте Alembic:

   ```bash
   cd app
   alembic init -t async migration
   ```

   Затем переместите `alembic.ini` в корень проекта.

2. В `alembic.ini` установите `script_location` как `app/migration`.

3. Создайте миграцию:

   ```bash
   alembic revision --autogenerate -m "Initial migration"
   ```

4. Примените миграции:

   ```bash
   alembic upgrade head
   ```

## Лучшие практики

- Разделяйте функциональность приложения на модули для удобства тестирования и поддержки.
- Обрабатывайте ошибки с четкими ответами и HTTP-кодами.
- Проводите миграции с Alembic для управления схемой базы данных.
- Используйте переменные окружения для безопасного хранения конфиденциальных данных.

---

Этот шаблон является мощной и удобной основой для разработки приложений на FastAPI с поддержкой аутентификации,
авторизации и структурированной архитектуры, готовой к масштабированию.