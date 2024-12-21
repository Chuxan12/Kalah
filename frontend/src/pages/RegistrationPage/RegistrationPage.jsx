import React, { useState } from "react";
import styles from "./RegistrationPage.module.css";

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 
    console.log("Reg form submitted", formData);
  };

  return (
    <div className={styles.registrationContainer}>
      <div className={styles.registrationBox}>
        <h2 className={styles.title}>Регистрация</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Введите имя пользователя"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Введите email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Введите пароль"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Повторите пароль"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className={styles.submitButton}>Зарегистрироваться</button>
          <p className={styles.loginText}>
            Уже зарегистрированы? <a href="/login" className={styles.loginLink}>Войдите</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
