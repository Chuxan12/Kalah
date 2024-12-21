import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import { FaUserCircle } from 'react-icons/fa';

const Header = ({ setCurrentTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>
          Калах онлайн
        </Link>
      </h1>
      <nav>
        <ul className={styles.navList}>
          <li className={styles.themeMenuWrapper}>
            <button 
              className={styles.themeButton} 
              onClick={toggleMenu} 
            >
              Тема
            </button>

            {isMenuOpen && (
              <ul className={styles.themeMenu}>
                <li 
                  onClick={() => handleThemeChange('forest')} 
                  className={styles.themeMenuItem}
                >
                  Лес
                </li>
                <li 
                  onClick={() => handleThemeChange('metal')} 
                  className={styles.themeMenuItem}
                >
                  Металл
                </li>
                <li 
                  onClick={() => handleThemeChange('desert')} 
                  className={styles.themeMenuItem}
                >
                  Пустыня
                </li>
              </ul>
            )}
          </li>
          <li><a href="/about-system">О системе</a></li>
          <li><a href="/about-developers">О разработчиках</a></li>
          <li><a href="/about-game">Об игре</a></li>
        </ul>
      </nav>
      <div className={styles.profile}>
        <Link to="/profile">
          <FaUserCircle className={styles.profileIcon} />
        </Link>
      </div>
    </header>
  );
};

export default Header;
