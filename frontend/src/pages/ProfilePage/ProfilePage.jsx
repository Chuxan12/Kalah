import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Для перенаправления
import styles from "./ProfilePage.module.css";
import axios from "axios";
import Cookies from "js-cookie"; // Для работы с куками

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // Для состояния загрузки
  const navigate = useNavigate(); // Для навигации

  // Проверка авторизации при загрузке страницы
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Извлекаем токен из куки
        const accessToken = Cookies.get("access_token");

        if (!accessToken) {
          throw new Error("Токен отсутствует");
        }

        // Отправляем запрос с токеном в заголовке
        const response = await axios.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Указываем токен в заголовке
          },
        });

        // Если запрос успешный, сохраняем данные пользователя
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        // Если ошибка, перенаправляем на страницу логина
        console.error("Ошибка авторизации:", error.response?.data?.message || error.message);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  // Обработчик изменения аватара
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData((prevData) => ({
          ...prevData,
          avatarUrl: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Отправка POST-запроса
  const handleClickOnConfirmButton = async () => {
    try {
      const accessToken = Cookies.get("access_token");
      if (!accessToken) {
        throw new Error("Токен отсутствует");
      }

      const dataToSend = {
        name: userData.name,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
        // Добавьте другие данные для отправки
      };

      const response = await axios.post(
        "/api/profile/update",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Указываем токен в заголовке
          },
        }
      );

      alert("Изменения успешно сохранены!");
    } catch (error) {
      console.error("Ошибка при сохранении данных:", error.response?.data?.message || error.message);
      alert("Не удалось сохранить изменения. Попробуйте позже.");
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <div className={styles.avatarSection}>
          <img
            src={userData.avatarUrl}
            alt=""
            className={styles.profileAvatar}
          />
          <label htmlFor="avatar-upload" className={styles.changeAvatarButton}>
            Изменить аватар
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={handleAvatarChange}
          />
        </div>

        <div className={styles.profileInfo}>
          <h3 className={styles.columnTitle}>Пользователь</h3>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Имя</label>
            <p className={styles.profileName}>{userData.name}</p>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Почта</label>
            <p className={styles.profileEmail}>{userData.email}</p>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Старый пароль</label>
            <input
              type="password"
              className={styles.inputField}
              placeholder="Введите старый пароль"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Новый пароль</label>
            <input
              type="password"
              className={styles.inputField}
              placeholder="Введите новый пароль"
            />
          </div>
          <button
            className={styles.saveButton}
            onClick={handleClickOnConfirmButton}
          >
            Подтвердить изменения
          </button>
        </div>
      </div>
      <div className={styles.statsCard}>
        <h3 className={styles.statsTitle}>Статистика</h3>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Количество сыгранных игр</span>
            <span className={styles.statValue}>{userData.games}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Количество побед</span>
            <span className={styles.statValue}>{userData.wins}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
