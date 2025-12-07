import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../services/authService";
import { HiMenu } from "react-icons/hi";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);

  // Lấy user khi load
  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  // Lắng nghe event auth-change
  useEffect(() => {
    const updateUser = () => setUser(getCurrentUser());
    window.addEventListener("auth-change", updateUser);
    return () => {
      window.removeEventListener("auth-change", updateUser);
    };
  }, []);

  useEffect(() => {
    const updateUser = () => setUser(getCurrentUser());

    window.addEventListener("userUpdated", updateUser);
    return () => {
      window.removeEventListener("userUpdated", updateUser);
    };
  }, []);

  // Ẩn header khi scroll xuống
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setHidden(current > lastScroll && current > 80);
      setLastScroll(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 backdrop-blur-md bg-white/80 border-b 
      transition-transform duration-500 
      ${hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div
          className="text-2xl font-bold text-blue-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          ABC Store
        </div>

        {/* Navbar */}
        <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
          <Link className="hover:text-blue-500 transition" to="/">
            Home
          </Link>
          <Link className="hover:text-blue-500 transition" to="/cart">
            Cart
          </Link>
          <Link className="hover:text-blue-500 transition" to="/profile">
            {" "}
            {/*Này bỏ tạm đây, khi nào quẳng chỗ khác thì quẳng =))*/}
            Profile
          </Link>
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {/* Nếu có user */}
          {user ? (
            <>
              <span
                className="text-gray-700 font-medium max-w-32 truncate"
                title={user.firstName}
              >
                Hi, {user.firstName}
              </span>

              <button
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg 
                transition text-sm"
                onClick={async () => {
                  try {
                    await logout();
                  } catch (err) {
                    console.error("Logout failed", err);
                  } finally {
                    setUser(null);
                    navigate("/");
                  }
                }}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            // Nếu chưa login
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
              transition text-sm font-medium"
              onClick={() => navigate("/login")}
            >
              Đăng nhập
            </button>
          )}

          {/* Mobile menu icon */}
          <button className="md:hidden text-gray-700 text-2xl">
            <HiMenu />
          </button>
        </div>
      </div>
    </header>
  );
}
