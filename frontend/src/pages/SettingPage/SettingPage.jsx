import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import CustomSlider from '../../components/CustomSlider/CustomSlider'; 
import styles from './SettingPage.module.css'; 

const SettingPage = () => {
  const [searchParams] = useSearchParams();
  const isOnline = searchParams.get('isOnline') === 'true';
  const [sliderValues, setSliderValues] = useState({
    beans: 3,
    holes: 6,
    timePerMove: 5,
    aiDifficulty: 1,
  });

  const handleSliderChange = (name, value) => {
    setSliderValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateGameButtonClick = () => {
    alert("Left button clicked!");
    // логика для создания
  };

  const handleJoinGameButtonClick = () => {
    alert("Right button clicked!");
    // логика для присоединения 
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
        <button className={styles.leftButton} onClick={handleCreateGameButtonClick}>Создать игру с заданными параметрами</button>
        {isOnline && (<button className={styles.rightButton} onClick={handleJoinGameButtonClick}>Присоединиться к игре!</button>)}
      </div>
    </div>
  );
};

SettingPage.propTypes = {
  showFourSliders: PropTypes.bool,
};

export default SettingPage;
