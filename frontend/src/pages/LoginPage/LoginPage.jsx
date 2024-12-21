import React, { useState } from "react";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const response = await axios.post("api/sign_in", {
        username: formData.username,
        password: formData.password
      });
      console.log("login form submitted", formData);
      navigate('/');
    } catch(error){
      setErrorMessage(
        error.response?.data?.message || "Произошла ошибка при авторизации."
      );
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Авторизация</h2>
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
              type="password"
              id="password"
              name="password"
              placeholder="Введите пароль"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className={styles.submitButton}>Войти</button>
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
          <p className={styles.registrationText}>
            Первый раз здесь? <a href="/registration" className={styles.loginLink}>Зарегистрируйтесь</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
