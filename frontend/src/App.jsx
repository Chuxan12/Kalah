import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import MainPage from "./pages/MainPage/MainPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import RegistrationPage from "./pages/RegistrationPage/RegistrationPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import SettingPage from "./pages/SettingPage/SettingPage";
import { ThemeContext } from "./context/ThemeContext";
import AboutDevelopersPage from "./pages/AboutDevelopersPage/AboutDevelopersPage";
import AboutGamePage from "./pages/AboutGamePage/AboutGamePage";
import GameBoardPage from "./pages/GameBoardPage/GameBoardPage";
import axios from "axios";
import AboutSystemPage from "./pages/AboutSystemPage/AboutSystemPage";

const App = () => {
  const [currentTheme, setCurrentTheme] = useState("desert");
  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme }}>
      <Routes>
        <Route path="/" element={<MainLayout currentTheme={currentTheme} />}>
          <Route index element={<MainPage />} />
          <Route path="registration" element={<RegistrationPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="game-setting" element={<SettingPage />} />
          <Route path="about-developers" element={<AboutDevelopersPage />} />
          <Route path="about-game" element={<AboutGamePage />} />
          <Route path="game-board" element={<GameBoardPage />} />
          <Route path="about-system" element={<AboutSystemPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ThemeContext.Provider>
  );
};

export default App;
