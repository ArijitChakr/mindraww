"use client";
import axios from "axios";
import AuthPage from "../components/client/Authpage";
import { BACKEND_URL } from "../config";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (
    email: string,
    password: string,
    name?: string
  ) => {
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/signup`, {
        email,
        password,
        name,
      });
      setLoading(false);
      router.push("/signin");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthPage
      authFunction={handleSignup}
      isSignIn={false}
      isLoading={loading}
    />
  );
}
