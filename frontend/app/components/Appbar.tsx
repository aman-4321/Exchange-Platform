"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { PrimaryButton, SuccessButton } from "./Button";
import { useEffect, useState } from "react";

export const Appbar = () => {
  const route = usePathname();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const Token = localStorage.getItem("token");
    setToken(Token);
  }, []);

  return (
    <div className="text-white border-b border-slate-799">
      <div className="flex justify-between items-center p-2">
        <div className="flex">
          <div
            className={`text-xl pl-4 flex flex-col justify-center cursor-pointer text-white`}
            onClick={() => router.push("/")}
          >
            Exchange
          </div>
          <div
            className={`text-sm pt-1 flex flex-col justify-center pl-8 cursor-pointer ${route.startsWith("/markets") ? "text-white" : "text-slate-500"}`}
            onClick={() => router.push("/markets")}
          >
            Markets
          </div>
          <div
            className={`text-sm pt-1 flex flex-col justify-center pl-8 cursor-pointer ${route.startsWith("/trade") ? "text-white" : "text-slate-500"}`}
            onClick={() => router.push("/trade/SOL_USDC")}
          >
            Trade
          </div>
        </div>
        <div className="flex">
          <div className="p-2 mr-2">
            {token ? (
              <>
                <SuccessButton>Deposit</SuccessButton>
                <PrimaryButton>Withdraw</PrimaryButton>
              </>
            ) : (
              <>
                <SuccessButton
                  onClick={() => {
                    router.push("/signup");
                  }}
                >
                  Sign up
                </SuccessButton>
                <PrimaryButton
                  onClick={() => {
                    router.push("login");
                  }}
                >
                  Sign in
                </PrimaryButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
