import { useState } from "react";

import {
  formatMacAddress,
  validateMacAddress,
} from "../lib/password.js";

export default function IndexRoute() {
  const [macAddress, setMacAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidMacAddress = validateMacAddress(macAddress);

  function handleInputChange(event) {
    setMacAddress(formatMacAddress(event.target.value));
    setPassword("");
    setError("");
  }

  async function handleGenerate() {
    if (!validateMacAddress(macAddress)) {
      setError("Invalid MAC address format. Expected: AA:BB:CC:DD:EE:FF");
      return;
    }

    setLoading(true);
    setError("");
    setPassword("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mac: macAddress }),
      });

      const data = await response.json();

      if (data.success) {
        setPassword(data.password);
      } else {
        setError(data.error || "Failed to generate password");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && isValidMacAddress) {
      handleGenerate();
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Algérie Télécom&apos;s Fiberhome HG6145F1 Password Generator
          </h1>
        </header>

        <section className="space-y-6 rounded-lg bg-white p-8 shadow-sm">
          <div>
            <label
              htmlFor="mac"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              MAC Address
            </label>
            <input
              id="mac"
              type="text"
              value={macAddress}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="AA:BB:CC:DD:EE:FF"
              className={`w-full rounded-lg border px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                macAddress && !isValidMacAddress
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }`}
              maxLength={17}
            />
            {macAddress && !isValidMacAddress ? (
              <p className="mt-1 text-sm text-red-600">
                Invalid format. Use: AA:BB:CC:DD:EE:FF
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!isValidMacAddress || loading}
            className={`w-full rounded-lg px-4 py-2 font-medium transition ${
              isValidMacAddress && !loading
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
          >
            {loading ? "Generating..." : "Generate Password"}
          </button>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          ) : null}

          {password ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="mb-1 text-sm text-gray-600">Generated Password:</p>
              <p className="select-all font-mono text-xl font-bold text-green-800">
                {password}
              </p>
            </div>
          ) : null}
        </section>

        <section className="space-y-4 rounded-lg bg-white p-6 text-sm text-gray-600 shadow-sm">
          <div className="space-y-2">
            <p className="font-semibold text-gray-700">Credits:</p>
            <p>
              Password generation algorithm by{" "}
              <a
                href="https://github.com/theeyepatch07/HG6145F1_PasswordGen"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                @theeyepatch07
              </a>
            </p>
            <p className="text-xs text-gray-500">
              This website decompiled the APK, extracted the function, and now
              runs the password generator directly from the React Router server
              for convenience.
            </p>
          </div>

          <div className="space-y-2 border-t pt-4">
            <p className="font-semibold text-gray-700">
              Have methods for other Algérie Télécom routers?
            </p>
            <p>
              Please share them in our Telegram group:{" "}
              <a
                href="https://t.me/FTTHALGERIAGROUP"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                FTTH Algeria Group
              </a>
            </p>
            <p className="text-xs text-gray-500">
              We&apos;ll add them to this website if possible.
            </p>
          </div>

          <div className="border-t pt-4">
            <p>
              Source code:{" "}
              <a
                href="https://github.com/rainxh11/AlgerieTelecomRouterPassword"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                GitHub
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
