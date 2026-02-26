import React, { useState, useContext } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import API from "../services/Api";
import { ThemeContext } from "../context/ThemeContext";

const Login = () => {
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let userCredential;

      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(
          auth, formData.email, formData.password
        );
      } else {
        userCredential = await createUserWithEmailAndPassword(
          auth, formData.email, formData.password
        );
      }

      const firebaseUser = userCredential.user;

      const res = await API.post("/users", {
        firebaseUID: firebaseUser.uid,
        email: firebaseUser.email,
        name: formData.name || firebaseUser.email,
      });

      localStorage.setItem("userId", res.data._id);
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const res = await API.post("/users", {
        firebaseUID: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
      });

      localStorage.setItem("userId", res.data._id);
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      setError("Google login failed.");
    }
  };

  // ── Shared input classes ──────────────────────────────────────────────────
  const inputClasses = `
    w-full p-3 rounded-lg border
    bg-white dark:bg-darkBg
    text-lightText dark:text-darkText
    placeholder-gray-400 dark:placeholder-gray-500
    border-gray-300 dark:border-darkBorder
    focus:outline-none focus:ring-2
    focus:ring-lightAccent dark:focus:ring-darkAccent
    transition
  `;

  return (
    <div className="min-h-screen flex items-center justify-center
      bg-lightBg dark:bg-darkBg
      transition-colors duration-500"
    >
      <div className="w-96 p-8 rounded-2xl shadow-lg
        bg-white dark:bg-darkCard
        border border-gray-200 dark:border-darkBorder"
      >
        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-6
          text-lightText dark:text-darkText"
        >
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className={inputClasses}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            className={inputClasses}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className={inputClasses}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-medium
            bg-lightAccent dark:bg-darkAccent
            text-white dark:text-black
            hover:scale-105 transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 text-center text-sm
          text-lightMuted dark:text-gray-400"
        >
          OR
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 p-3 rounded-xl
          border border-gray-300 dark:border-darkBorder
          bg-white dark:bg-darkBg
          text-lightText dark:text-darkText
          hover:bg-gray-50 dark:hover:bg-darkBorder
          transition"
        >
          <FcGoogle size={22} />
          Continue with Google
        </button>

        {/* Toggle */}
        <p className="text-center mt-6 text-sm
          text-lightMuted dark:text-gray-400"
        >
          {isLogin ? "Don't have an account?" : "Already have one?"}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 cursor-pointer
            text-lightAccent dark:text-darkAccent
            hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;