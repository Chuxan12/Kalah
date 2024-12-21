import React from "react";
import styles from "./NotFoundPage.module.css";

const NotFoundPage = () => {
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.backgroundBlur}></div>
      <div className={styles.notFoundContent}>
        <h1 className={styles.title}>Страница не найдена</h1>
      </div>
    </div>
  );
};

export default NotFoundPage;