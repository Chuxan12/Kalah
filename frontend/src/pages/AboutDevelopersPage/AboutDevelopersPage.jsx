import React from "react";
import styles from "./AboutDevelopersPage.module.css";

const AboutDevelopersPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Самарский университет</h1>
        <h2>Кафедра программных систем</h2>
        <p>Курсовой проект по дисциплине <strong>Программная инженерия</strong></p>
        <p>
          <strong>Тема проекта:</strong> Приложение «Игра «Калах»»
        </p>
        <p>
          Разработчики: обучающиеся группы 6402-020302D<br />
          Панфилов А.А.,
          Юрин М.А.
        </p>
        <p>Самара 2024</p>
      </div>
    </div>
  );
};

export default AboutDevelopersPage;
