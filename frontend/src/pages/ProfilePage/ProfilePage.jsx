import React, { useState } from "react";
import "./ProfilePage.module.css";

const ProfilePage = () => {
  const [user, setUser] = useState({
    avatar: "https://via.placeholder.com/150",
    username: "ИмяПользователя",
    email: "mail@mail.ru",
  });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleAvatarChange = () => {
    alert("Change avatar functionality not implemented yet.");
  };

  const handlePasswordChange = () => {
    if (oldPassword && newPassword) {
      alert("Password successfully changed!");
      setOldPassword("");
      setNewPassword("");
    } else {
      alert("Please fill out both password fields.");
    }
  };

  return (
    <div className="container rounded-box">
      <div className="user-profile">
        <div className="avatar-section">
          <div className="avatar-wrapper">
            <img
              src={user.avatar}
              alt="User Avatar"
              className="avatar-img"
            />
          </div>
          <button className="avatar-button" onClick={handleAvatarChange}>
            Изменить фото профиля
          </button>
        </div>

        <div className="profile-details">
          <div className="input-box">
            <span className="user-username">{user.username}</span>
          </div>
          <div className="input-box">
            <span className="user-email"><strong>{user.email}</strong></span>
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="Подтвердите старый пароль"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Введите новый пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button className="confirm-button" onClick={handlePasswordChange}>
            Подтвердить изменения
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
