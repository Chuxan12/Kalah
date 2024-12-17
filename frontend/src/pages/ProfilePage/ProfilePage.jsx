import React from 'react';
import styles from './ProfilePage.module.css';

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result); // Обновляем аватар
      };
      reader.readAsDataURL(file); // Читаем файл как Data URL
    }
  };


const ProfilePage = ({ avatarUrl, name, email, wins, games }) => {
  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
      <div className={styles.avatarSection}>
        <img src={avatarUrl} alt="" className={styles.profileAvatar} />
        <label htmlFor="avatar-upload" className={styles.changeAvatarButton}>Изменить аватар</label>
        <input 
          id="avatar-upload"
          type="file" 
          accept="image/*" 
          className={styles.fileInput} 
          onChange={handleAvatarChange}
        />
      </div>

      <div className={styles.profileInfo}>
        <h3 className={styles.columnTitle}>Пользователь</h3>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Имя</label>
          <p className={styles.profileName}>{name}</p>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Почта</label>
          <p className={styles.profileEmail}>{email}</p>
        </div>

        {/* Поля для изменения пароля */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Старый пароль</label>
          <input 
            type="password" 
            className={styles.inputField} 
            placeholder="Введите старый пароль" 
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Новый пароль</label>
          <input 
            type="password" 
            className={styles.inputField} 
            placeholder="Введите новый пароль" 
          />
        </div>

        {/* Кнопка для подтверждения изменений */}
        <button className={styles.saveButton}>Подтвердить изменения</button>
      </div>
    </div>
      <div className={styles.statsCard}>
        <h3 className={styles.statsTitle}>Статистика</h3>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Количество сыгранных игр</span>
            <span className={styles.statValue}>{games}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Количество побед</span>
            <span className={styles.statValue}>{wins}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
