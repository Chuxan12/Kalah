import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import axios from "axios";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Проверка авторизации при загрузке страницы
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("api/auth/me/", {
          withCredentials: true, 
        });
          navigate("/profile"); // Перенаправляем на профиль, если пользователь авторизован
        
      } catch (error) {
        console.log("Пользователь не авторизован", error);
      }
    };

    checkAuth();
  }, [navigate]);

  // Обработка изменения формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "api/auth/login/",
        formData,
        {
          withCredentials: true, // Для отправки и получения cookies
        }
      );

      if (response.status === 200) {
        navigate("/profile"); // Перенаправляем на профиль после успешной авторизации
      }
    } catch (error) {
      console.error("Ошибка авторизации:", error);
      setErrorMessage("Неправильная почта или пароль. Попробуйте снова");
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
          <button
            type="submit"
            className={styles.submitButton}>
            Войти
          </button>
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
          <p className={styles.registrationText}>
            Первый раз здесь?{" "}
            <a href="/registration" className={styles.loginLink}>
              Зарегистрируйтесь
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
