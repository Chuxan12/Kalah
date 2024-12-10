import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import { FaUserCircle } from 'react-icons/fa';

const Header = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}><Link to="/" style={{ textDecoration: 'none', color: '#333' }}>
    Калах онлайн
  </Link></h1>
      <nav>
        <ul className={styles.navList}>
          <li><a href="/theme">Тема</a></li>
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
