"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignInBox() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/user/signin",
        {
          email: email,
          password: password,
        },
      );

      localStorage.setItem("token", response.data.token);
      router.push("/dashboard");
    } catch (error) {
      setError("Failed to sign in. Please check your credentials.");
    }
  };

  return (
    <div className="w-full max-w-sm p-8 space-y-8 bg-slate-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center text-white">Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-6 bg-slate-800 text-white border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-6 bg-slate-800 text-white border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-white text-sm pt-4">
            New here?{" "}
            <Link href="/signup" className="text-blue-500">
              Sign up
            </Link>
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-white text-black hover:bg-slate-200 transition-colors py-6"
        >
          Login
        </Button>
      </form>
    </div>
  );
}
