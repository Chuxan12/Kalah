import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RegistrationPage.module.css";
import axios from "axios";

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (formData.username.length < 3 || formData.username.length > 50) {
      newErrors.username = "Имя пользователя должно быть от 3 до 50 символов.";
    }

    if (formData.email.length < 3 || formData.email.length > 50) {
      newErrors.email = "Email должен быть от 3 до 50 символов.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают.";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Пароль должен быть не менее 6 символов.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  if (!validateForm()) {
    return;
  }

  try {
    await axios.post(
      "/api/registration",
      {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      },
      { withCredentials: true }
    );

    navigate("/");
  } catch (error) {
    setErrorMessage(
      error.response?.data?.message || "Произошла ошибка при регистрации."
    );
  }
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
            {errors.username && (
              <p className={styles.errorText}>{errors.username}</p>
            )}
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
            {errors.email && <p className={styles.errorText}>{errors.email}</p>}
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
            {errors.password && (
              <p className={styles.errorText}>{errors.password}</p>
            )}
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
            {errors.confirmPassword && (
              <p className={styles.errorText}>{errors.confirmPassword}</p>
            )}
          </div>
          <button type="submit" className={styles.submitButton}>
            Зарегистрироваться
          </button>
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
          <p className={styles.loginText}>
            Уже зарегистрированы?{" "}
            <a href="/login" className={styles.loginLink}>
              Войдите
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
