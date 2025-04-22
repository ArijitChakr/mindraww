"use client";

import axios from "axios";
import AuthPage from "../components/client/Authpage";
import { BACKEND_URL } from "../config";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SigninPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignin = async (email: string, password: string) => {
    setLoading(true);

    const response = await axios.post(`${BACKEND_URL}/signin`, {
      email,
      password,
    });
    setLoading(false);
    localStorage.setItem("token", response.data.token);
    router.push("/dashboard");
  };

  return (
    <AuthPage authFunction={handleSignin} isSignIn={true} isLoading={loading} />
  );
}
