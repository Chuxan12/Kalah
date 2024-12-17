import React, {useState, useEffect} from "react";
import Header from "../components/Header/Header";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.css";

const themes = {
  forest: 'url(/images/forest-bg.jpg)',
  metal: 'url(/images/metal-bg.jpg)', 
  desert: 'url("/images/desert-bg.jpg")'
};

const MainLayout = () => {

    const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('currentTheme') || 'desert';
  });

    useEffect(() => {
    localStorage.setItem('currentTheme', currentTheme);
  }, [currentTheme]);

  return (
<div 
      className={styles.layout} 
      style={{ backgroundImage: themes[currentTheme] }}
    >
      <Header setCurrentTheme={setCurrentTheme} />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
