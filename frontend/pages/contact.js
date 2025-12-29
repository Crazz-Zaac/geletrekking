"use client";

import { useState } from "react";
import axios from "axios";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/contact`,
        { name, email, message }
      );
      setStatus({ type: "success", message: "Thank you! We'll get back to you soon." });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Failed to send message." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light text-brand-secondary py-20 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
        Contact Us
      </h1>
      <div className="max-w-xl mx-auto bg-white border border-gray-200 p-8 rounded-xl shadow">
        {status && (
          <div
            className={`mb-4 p-3 rounded text-sm ${status.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {status.message}
          </div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full border border-gray-300 rounded p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full border border-gray-300 rounded p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              className="w-full border border-gray-300 rounded p-2 h-32"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-primary text-white px-4 py-2 rounded font-semibold hover:bg-brand-primary/90 transition"
          >
            {loading ? "Sending…" : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}