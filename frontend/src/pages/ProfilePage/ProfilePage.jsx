import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProfilePage.module.css";
import axios from "axios";

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    first_name: null,
    avatar: null,
    email: null,
    games: null,
    wins: null,
  });
  const [userInput, setUserInput] = useState({
    old_password: "",
    password: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  // Предустановленные аватары
  const presetAvatars = [
    "/avatars/avatar_anime.jpg",
    "/avatars/avatar_ant.jpeg",
    "/avatars/avatar_minion.jpg",
    "/avatars/avatar_vendeta.jpg",
    "/avatars/avatar_z.jpg",
    "/avatars/krutoi.jpg",
    "/avatars/avatar_pobedni.jpg",
    "/avatars/avatar_rabochi.jpg",
    "/avatars/avatar_goida.jpg",
    "/avatars/avatar_jaba.jpg",
    "/avatars/avatar_starege.jpg",
    "/avatars/avatar_anime_z.jpg",
    "/avatars/avatar_pozdman.jpg",
    "/avatars/avatar_soleniya.jpg",
    "/avatars/avatar_dobro.jpg",
  ];

  // Проверка авторизации при загрузке страницы
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("api/auth/me/", {
          withCredentials: true,
        });
        if (response.status === 200) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error(
          "Ошибка при получении данных пользователя:",
          error.response?.data?.message || error.message
        );
        navigate("/login"); // Перенаправляем на страницу логина, если пользователь не авторизован
      }
    };

    fetchUserData();
  }, [navigate]);

  // Обновление значений полей ввода
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInput((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  };

  // Выбор аватара из предустановленных
  const handleAvatarSelect = (url) => {
    setUserData((prevUserData) => ({
      ...prevUserData,
      avatar: url,
    }));
    setIsModalOpen(false);
  };

  // хендл изменения данных
  const handleClickOnConfirmButton = async () => {
    try {
      const dataToSend = {
        first_name: userData.first_name,
        avatar: userData.avatar,
        old_password: userInput.old_password,
        password: userInput.password,
      };

      const response = await axios.put(
        "api/auth/update/",
        {
          withCredentials: true,
        },
        dataToSend
      );

      alert("Изменения успешно сохранены!");
    } catch (error) {
      console.error(
        "Ошибка при сохранении данных:",
        error.response?.data?.message || error.message
      );
      alert("Не удалось сохранить изменения. Попробуйте позже.");
    }
  };

  // хендл для выхода
  const handleLogout = async () => {
    try {
      await axios.post("api/auth/logout/", {
        withCredentials: true,
      });
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <div className={styles.avatarSection}>
          <img src={userData.avatar} alt="" className={styles.profileAvatar} />
          <button
            onClick={() => setIsModalOpen(true)}
            className={styles.changeAvatarButton}
          >
            Изменить аватар
          </button>

          <button onClick={handleLogout} className={styles.logoutButton}>
            Выйти
          </button>
        </div>

        <div className={styles.profileInfo}>
          <h3 className={styles.columnTitle}>Пользователь</h3>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Имя</label>
            <p className={styles.profileName}>{userData.first_name}</p>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Почта</label>
            <p className={styles.profileEmail}>{userData.email}</p>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Старый пароль</label>
            <input
              type="password"
              name="old_password"
              className={styles.inputField}
              placeholder="Введите старый пароль"
              value={userInput.old_password}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Новый пароль</label>
            <input
              type="password"
              name="password"
              className={styles.inputField}
              placeholder="Введите новый пароль"
              value={userInput.password}
              onChange={handleInputChange}
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

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Выберите аватар</h3>
            <div className={styles.avatarGrid}>
              {presetAvatars.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Аватар ${index + 1}`}
                  className={styles.avatarOption}
                  onClick={() => handleAvatarSelect(url)}
                />
              ))}
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className={styles.closeModalButton}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
