import React, { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export const Home = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <div>
      <h1>Home Component</h1>
      <p>Theme: {theme}</p>
      <button onClick={toggleTheme}>Switch Theme</button>
    </div>
  );
};
