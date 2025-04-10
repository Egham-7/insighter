"use client";
import { useState } from "react";

export function Weather() {
  const [weather, setWeather] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const city = formData.get("city");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city }),
      });

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        setWeather((prev) => prev + text);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input name="city" placeholder="Enter city name" required />
        <button type="submit">Get Weather</button>
      </form>
      {weather && <pre>{weather}</pre>}
    </div>
  );
}
