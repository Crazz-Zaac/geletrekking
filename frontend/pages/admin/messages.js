"use client";

import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { UserContext } from "../../context/UserContext";

// Admin contact messages page
//
// Lists contact messages submitted by users.  Only admin and
// superadmin roles can access this page.  Messages are fetched from
// `/api/contact/admin`.  There is no delete functionality provided in
// the backend, so this page only displays the messages.
export default function AdminMessagesPage() {
  const { user, loading: userLoading } = useContext(UserContext);
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // Redirect non-admin
  useEffect(() => {
    if (!userLoading) {
      if (!user || !["admin", "superadmin"].includes(user.role)) {
        router.replace("/etalogin");
      }
    }
  }, [userLoading, user, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/contact/admin`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data || []);
      } catch (err) {
        console.error(err);
        setMsg({ type: "error", text: err.response?.data?.message || "Failed to load messages" });
      } finally {
        setLoading(false);
      }
    };
    if (user && ["admin", "superadmin"].includes(user.role)) {
      fetchData();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-brand-light text-brand-secondary py-20 px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Contact Messages</h1>
      {msg && (
        <div
          className={`mb-4 p-3 rounded text-sm ${msg.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {msg.text}
        </div>
      )}
      {loading ? (
        <p>Loading…</p>
      ) : messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Name</th>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Email</th>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Message</th>
                <th className="p-3 text-left text-sm font-medium text-brand-secondary">Date</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m._id} className="border-t border-gray-200">
                  <td className="p-3 text-sm">{m.name}</td>
                  <td className="p-3 text-sm">{m.email}</td>
                  <td className="p-3 text-sm">{m.message}</td>
                  <td className="p-3 text-sm">
                    {new Date(m.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}