import React, { useState } from "react";
import styles from "./LoginPage.module.css";
import axios from "axios";
import Cookies from "js-cookie";
const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
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
      const response = await axios.post(
        "api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true } 
      );

      const { ok, access_token, message } = response.data;

      if (ok) {
        Cookies.set("access_token", access_token, {
          expires: 7,
          secure: true,
          sameSite: "Strict",
        });

        alert(message || "Вы успешно вошли!");
        navigate("/");
      } else {
        setErrorMessage(message || "Что-то пошло не так");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Ошибка авторизации");
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
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Введите почту"
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
