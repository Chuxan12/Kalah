import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import CustomSlider from "../../components/CustomSlider/CustomSlider";
import styles from "./SettingPage.module.css";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const SettingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isOnline = searchParams.get("isOnline") === "true";
  const [sliderValues, setSliderValues] = useState({
    beans: 3,
    holes: 6,
    time_per_move: 5,
    ai_difficulty: isOnline ? 0 : 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameToken, setGameToken] = useState("");

  // Проверка авторизации при загрузке страницы
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("api/auth/me/", {
          withCredentials: true,
        });
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

  const handleSliderChange = (name, value) => {
    setSliderValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateGameButtonClick = async () => {
    try {
      const id = uuidv4();
      const token = id;
      localStorage.setItem("id", id);
      const gameData = { id, ...sliderValues, token }; // Добавляем id к sliderValues
      const response = await axios.post("api/games/", gameData);
      if (gameData.ai_difficulty > 0) {
        localStorage.setItem("bot", gameData.ai_difficulty);
        navigate("/game-board-offline");
      } else {
        navigate("/game-board");
      }
    } catch (error) {
      alert("Создание игры невозможно!");
    }
  };

  const handleJoinGameButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleJoinGame = async () => {
    if (gameToken.trim()) {
      localStorage.setItem("id", gameToken.trim());
      setIsModalOpen(false);
      navigate("/game-board");
    } else {
      alert("Введите токен для подключения.");
    }
  };

  return (
    <div className={styles.formContainer}>
      <CustomSlider
        min={3}
        max={10}
        step={1}
        label="Количество зёрен"
        value={sliderValues.beans}
        onChange={(value) => handleSliderChange("beans", value)}
      />
      <CustomSlider
        min={6}
        max={14}
        step={2}
        label="Количество лунок"
        value={sliderValues.holes}
        onChange={(value) => handleSliderChange("holes", value)}
      />
      <CustomSlider
        min={5}
        max={180}
        step={1}
        label="Время на ход в секундах"
        value={sliderValues.time_per_move}
        onChange={(value) => handleSliderChange("time_per_move", value)}
      />
      {!isOnline && (
        <CustomSlider
          min={1}
          max={3}
          step={1}
          label="Сложность ИИ"
          value={sliderValues.ai_difficulty}
          onChange={(value) => handleSliderChange("ai_difficulty", value)}
        />
      )}

      <div className={styles.buttonContainer}>
        <button
          className={styles.leftButton}
          onClick={handleCreateGameButtonClick}
        >
          Создать игру с заданными параметрами
        </button>
        {isOnline && (
          <button
            className={styles.rightButton}
            onClick={handleJoinGameButtonClick}
          >
            Присоединиться к игре!
          </button>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Введите токен игры</h3>
            <input
              type="text"
              value={gameToken}
              onChange={(e) => setGameToken(e.target.value)}
              placeholder="Токен игры"
            />
            <div className={styles.modalButtons}>
              <button onClick={handleJoinGame}>Подключиться</button>
              <button onClick={() => setIsModalOpen(false)}>Выход</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

SettingPage.propTypes = {
  showFourSliders: PropTypes.bool,
};

export default SettingPage;
