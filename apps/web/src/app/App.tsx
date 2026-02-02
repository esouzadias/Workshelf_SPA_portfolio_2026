import { Outlet } from "react-router-dom";
import ThemePrompt from "../Components/ThemePrompt";
import Navbar from "../Components/Navbar/Navbar";

export default function App() {
  return (
    <>
      <Navbar />
      <ThemePrompt />
      <Outlet />
    </>
  );
}