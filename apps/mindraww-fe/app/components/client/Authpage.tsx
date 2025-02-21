"use client";

import { Button } from "@repo/ui";
import { Input } from "@repo/ui";
import Link from "next/link";
import Navbar from "../Navbar";
import { useState } from "react";

interface AuthPageProps {
  isSignIn: boolean;
  authFunction: (email: string, password: string, name?: string) => void;
  isLoading: boolean;
}

export default function AuthPage({
  isSignIn,
  authFunction,
  isLoading,
}: AuthPageProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");

  const handleSubmit = () => {
    if (isSignIn) {
      authFunction(email, password);
    } else {
      authFunction(email, password, name);
    }
  };

  return (
    <div className="h-screen">
      <Navbar />
      <div className="h-full flex justify-center items-center bg-slate-900">
        <div className="p-10 m-2 bg-white rounded flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-slate-500 text-center">
            {isSignIn ? "Sign In" : "Sign Up"}
          </h1>
          <Input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {!isSignIn && (
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <Button
            onClick={handleSubmit}
            variant="primary"
            size="md"
            disabled={isLoading}
          >
            {isSignIn ? "Sign In" : "Sign Up"}
          </Button>
          <p className="text-center text-slate-500">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}
          </p>
          <Link
            className="w-full flex justify-center items-center"
            href={isSignIn ? "/signup" : "/signin"}
          >
            <Button variant="outline" size="lg">
              {isSignIn ? "Register Here" : "Sign In"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
