import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProfilePage.module.css";
import axios from "axios";

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    first_name: "",
    avatar: "",
    email: "",
    games: null,
    wins: null,
  });

  const [userInput, setUserInput] = useState({
    old_password: "",
    password: "",
  });

  const navigate = useNavigate();

  // Проверка авторизации при загрузке страницы
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("api/auth/me/", {
          withCredentials: true,
        });
        if (response.status == 200) {
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

  // Обработчик изменения аватара
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData((prevData) => ({
          ...prevData,
          avatar: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Обновление значений полей ввода
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInput((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  };

  // Подтверждение изменения данных
  const handleClickOnConfirmButton = async () => {
    try {
      const dataToSend = {
        first_name: userData.first_name,
        avatar: userData.avatar,
        old_password: userInput.old_password,
        password: userInput.password,
      };
      const response = await axios.put("api/auth/update", dataToSend, {
        withCredentials: true,
      });

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
    </div>
  );
};

export default ProfilePage;
