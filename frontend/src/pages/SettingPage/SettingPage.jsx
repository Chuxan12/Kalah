import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import CustomSlider from '../../components/CustomSlider/CustomSlider'; 
import styles from './SettingPage.module.css'; 

const SettingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isOnline = searchParams.get('isOnline') === 'true';
  const [sliderValues, setSliderValues] = useState({
    beans: 3,
    holes: 6,
    timePerMove: 5,
    aiDifficulty: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameToken, setGameToken] = useState('');

  const handleSliderChange = (name, value) => {
    setSliderValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateGameButtonClick = async () => {
    try {
      const response = await fetch('/api/game_setting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          beans: sliderValues.beans,
          holes: sliderValues.holes,
          timePerMove: sliderValues.timePerMove,
          aiDifficulty : isOnline ? 0 : sliderValues.aiDifficulty
        }),
      });
      if (response.ok) {
        const data = await response.json();
        navigate(`/game-board?gameId=${data.gameId}`);
      } else {
        alert('Ошибка при создании игры.');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при подключении к серверу.');
    }
  };

  const handleJoinGameButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleJoinGame = () => {
    if (gameToken.trim()) {
      alert(`Присоединение к игре с токеном: ${gameToken}`);
      // логика для присоединения к игре по токену




      setIsModalOpen(false);
    } else {
      alert('Введите токен для подключения.');
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
        onChange={(value) => handleSliderChange('beans', value)} 
      />
      <CustomSlider 
        min={6} 
        max={14}
        step={2} 
        label="Количество лунок" 
        value={sliderValues.holes} 
        onChange={(value) => handleSliderChange('holes', value)} 
      />
      <CustomSlider 
        min={5} 
        max={180}
        step={1} 
        label="Время на ход в секундах" 
        value={sliderValues.timePerMove} 
        onChange={(value) => handleSliderChange('timePerMove', value)} 
      />
      {!isOnline && (
        <CustomSlider 
          min={1} 
          max={3} 
          step={1}
          label="Сложность ИИ" 
          value={sliderValues.aiDifficulty} 
          onChange={(value) => handleSliderChange('aiDifficulty', value)} 
        />
      )}

      <div className={styles.buttonContainer}>
        <button className={styles.leftButton} onClick={handleCreateGameButtonClick}>
          Создать игру с заданными параметрами
        </button>
        {isOnline && (
          <button className={styles.rightButton} onClick={handleJoinGameButtonClick}>
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
