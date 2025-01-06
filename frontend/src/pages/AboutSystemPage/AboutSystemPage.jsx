import React, { useState, useEffect } from "react";
import styles from "./AboutSystemPage.module.css";

const AboutSystemPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.box}>
        <h2 className={styles.title}>О системе</h2>
        <nav className={styles.tableOfContents}>
          <h3>Содержание</h3>
          <ul>
            <li>
              <a href="#purpose" className={styles.link}>
                Назначение системы
              </a>
            </li>
            <li>
              <a href="#system-requirements" className={styles.link}>
                Условия работы системы
              </a>
            </li>
            <li>
              <a href="#installation" className={styles.link}>
                Установка системы
              </a>
            </li>
            <li>
              <a href="#system-usage" className={styles.link}>
                Работа с системой
              </a>
              <ul>
                <li>
                  <a href="#authentication" className={styles.link}>
                    Вход в систему (авторизация)
                  </a>
                </li>
                <li>
                  <a href="#user-mode" className={styles.link}>
                    Работа с системой в режиме пользователя
                  </a>
                </li>
                <li>
                  <a href="#game-modes" className={styles.link}>
                    Игровые режимы
                  </a>
                </li>
                <li>
                  <a href="#game-stages" className={styles.link}>
                    Этапы игры
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>

        <section id="purpose" className={styles.section}>
          <h3 className={styles.sectionTitle}>Назначение системы</h3>
          <p>
            Данная система предназначена для игры в «Калах» с возможностью
            настройки параметров игрового поля и выбора режима игры. Доступны
            режимы против бота разной сложности или онлайн против другого игрока
          </p>
        </section>

        <section id="system-requirements" className={styles.section}>
          <h3 className={styles.sectionTitle}>Условия работы системы</h3>
          <p>
            <strong>
              Для корректного функционирования системы (серверная часть)
              необходимо:
            </strong>
          </p>
          <ul>
            <li>тип ЭВМ: x86-64 совместимый;</li>
            <li>объем ОЗУ – не менее 3 Гб;</li>
            <li>объем свободного дискового пространства – не менее 33 Гб;</li>
            <li>клавиатура или иное устройство ввода;</li>
            <li>мышь или иное манипулирующее устройство;</li>
            <li>процессор – Intel Pentium не менее 1,5 ГГц;</li>
            <li>дисплей с разрешением не менее 1024 × 768 пикселей;</li>
            <li>операционная система Windows 10 и выше;</li>
            <li>СУБД SQLite 3.</li>
          </ul>
          <p>
            <strong>
              Для корректного функционирования системы (клиентская часть)
              необходимо:
            </strong>
          </p>
          <ul>
            <li>тип ЭВМ: x86-64 совместимый;</li>
            <li>объем ОЗУ – не менее 3 Гб;</li>
            <li>объем свободного дискового пространства – не менее 33 Гб;</li>
            <li>клавиатура или иное устройство ввода;</li>
            <li>мышь или иное манипулирующее устройство;</li>
            <li>процессор – Intel Pentium не менее 1,5 ГГц;</li>
            <li>дисплей с разрешением не менее 1024 × 768 пикселей;</li>
            <li>операционная система Windows 10 и выше;</li>
            <li>браузер – Google Chrome.</li>
          </ul>
        </section>

        <section id="installation" className={styles.section}>
          <h3 className={styles.sectionTitle}>Установка системы</h3>
          <p>
            Система устанавливается на сервер с помощью docker и docker compose
            файла. Docker файл и docker compose файл необходимо скачать в
            рабочую директорию и выполнить запуск в терминале команды:
            <code>docker-compose up —build</code>.
          </p>
        </section>

        <section id="system-usage" className={styles.section}>
          <h3 className={styles.sectionTitle}>Работа с системой</h3>
          <p>
            Система выводит начальную страницу веб-сайта, представленную на
            рисунке. С этой страницы доступны страницы справок и меню профиля,
            инициирующее вход пользователя в систему. Выбор режима игры
            недоступен, пока пользователь не авторизируется.
          </p>
          <figure>
            <img src="/info/index.png" alt="Начальная страница системы" />
            <figcaption>Рисунок A.1 – Начальная страница системы</figcaption>
          </figure>

          <h4 id="authentication">Вход в систему (авторизация)</h4>
          <p>
            Попытка входа в игровой режим или страницу профиля без
            аутентификации приведет на страницу авторизации. Не имеющий аккаунт
            посетитель может пройти регистрацию. Пользователь может ввести логин
            (email) и пароль и войти в систему. Страница регистрации для входа в
            систему представлена на рисунке А.2.
          </p>
          <figure>
            <img src="/info/auth.png" alt="Страница авторизации" />
            <figcaption>Рисунок А.2 – Страница авторизации</figcaption>
          </figure>

          <h4 id="user-mode">Работа с системой в режиме пользователя</h4>
          <p>
            После аутентификации система открывает страницу профиля
            пользователя. Здесь пользователь может изменить пароль, посмотреть
            информацию о статистике и обновить изображение профиля. На рисунке
            А.3 изображена страница профиля пользователя.
          </p>
          <figure>
            <img src="/info/profile.png" alt="Страница профиля пользователя" />
            <figcaption>Рисунок А.3 – Страница профиля</figcaption>
          </figure>

          <p>
            С главной страницы сайта доступны игровые режимы и страницы
            сведений. Рисунки страниц сведений об игре, о разработчиках и о
            системе представлены на рисунках A.4 – A.5.
          </p>
          <figure>
            <img src="/info/aboutdev.png" alt="Страница о разработчиках" />
            <figcaption>Рисунок А.4 – Страница «О разработчиках»</figcaption>
          </figure>
          <figure>
            <img src="/info/aboutgame.png" alt="Страницы об игре" />
            <figcaption>Рисунок А.5 – Страницы «Об игре»</figcaption>
          </figure>

          <h4 id="game-modes">Игровые режимы</h4>
          <p>
            При выборе игрового режима откроется страница настроек игры, на
            которой пользователь сможет задать желаемые параметры игровой
            сессии, такие как время на ход, количество лунок, количество зёрен и
            сложность бота. На рисунках А.6 – А.7 представлены страницы настроек
            для режима онлайн и против бота соответственно.
          </p>
          <figure>
            <img
              src="/info/settingsonline.png"
              alt="Страница настроек для онлайн игры"
            />
            <figcaption>
              Рисунок А.6 – Страница настроек игрового поля онлайн
            </figcaption>
          </figure>
          <figure>
            <img
              src="/info/settingbot.png"
              alt="Страница настроек против бота"
            />
            <figcaption>
              Рисунок А.7 – Страница настроек игрового поля против бота
            </figcaption>
          </figure>

          <h4 id="game-stages">Этапы игры</h4>
          <p>
            На рисунках А.8 – А.11 изображены следующие этапы игры: начало
            партии и присоединение игроков, выбор лунки, завершение хода и конец
            игры. До присоединения второго игрока выполнение ходов будет
            недоступно. После выбора лунки (доступно только в свой ход) лунка
            будет выделена зеленым кругом, станет доступной кнопка завершения
            хода. По нажатии кнопки произойдет пересчет игрового поля и передача
            хода противнику. Как только выполнится одно из условий победы
            игроков, система выдаст об этом сообщение. Статистика игроков
            обновится в соотвествии с исходом партии.
          </p>
          <figure>
            <img src="/info/start.png" alt="Начало игры" />
            <figcaption>
              Рисунок А.8 – Страница начала игры до совершения ходов
            </figcaption>
          </figure>
          <figure>
            <img src="/info/turnover.png" alt="Выбор лунки" />
            <figcaption>
              Рисунок А.9 – Страница игры после выбора лунки
            </figcaption>
          </figure>
          <figure>
            <img src="/info/game.png" alt="Завершение хода" />
            <figcaption>
              Рисунок А.10 – Страница игры после завершения хода
            </figcaption>
          </figure>
          <figure>
            <img src="/info/winner.png" alt="Конец игры" />
            <figcaption>
              Рисунок А.11 – Страница игры в случае победы одного из игроков
            </figcaption>
          </figure>
        </section>

        {isVisible && (
          <button onClick={scrollToTop} className={styles.scrollToTopButton}>
            ↑
          </button>
        )}
      </div>
    </div>
  );
};

export default AboutSystemPage;
