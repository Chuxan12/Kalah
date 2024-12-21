import React from 'react';
import { useNavigate } from 'react-router-dom';
import Kalaha from '../KalahButton/KalahButton';
import Hole from '../Hole/Hole';
import styles from './Board.module.css';

const BoardMenu = () => {
  const navigate = useNavigate();

  const handleNavigate = (flag) => {
    navigate(`/game_setting?isOnline=${flag}`); // через query
  };

  return (
    <div className={styles.board}>
      <Kalaha topText="Сразиться онлайн" centerText="Сразитесь с игроками со всего света за звание мастера"
      onClick={() => handleNavigate(true)}/>
      <div className={styles.holesContainer}>
        <div className={styles.row}>
          <Hole />
          <Hole />
          <Hole />
          <Hole />
          <Hole />
          <Hole />  
        </div>
        <div className={styles.row}>
          <Hole />
          <Hole />
          <Hole />
          <Hole />
          <Hole />
          <Hole />
        </div>
      </div>
      <Kalaha topText="Сразиться с ИИ" centerText="Отточите свои навыки в битве с искусственым интеллектом" 
      onClick={() => handleNavigate(false)}/>
    </div>
  );
};

export default BoardMenu;
