"use client";

import { useEffect, useState } from "react";
import { FaEnvelope, FaUser } from "react-icons/fa";
import url from '../components/url'

export default function Account() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // ✅ جلب بيانات المستخدم من API
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${url}/api/admininformation`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const result = await response.json();

        if (result.status === 1 && result.data) {
          setName(result.data.name || "");
          setEmail(result.data.email || "");
        } else {
          console.error("فشل في جلب البيانات:", result.message);
        }
      } catch (error) {
        console.error("خطأ أثناء جلب معلومات الحساب:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 shadow md:p-8" dir="rtl">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">
        🧾 معلومات الحساب
      </h2>

      <div className="space-y-6">
        {/* الاسم */}
        <h2 className="font-bold mb-4">الاسم</h2>
        <div className="flex items-center gap-2 pb-1 border-b">
          <FaUser className="text-gray-500" />
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-4 py-2 text-right transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <span className="text-gray-800">{name}</span>
          )}
        </div>

        {/* البريد الإلكتروني */}
        <h2 className="font-bold mb-4">البريد الالكتروني</h2>
        <div className="flex items-center gap-2 pb-1 border-b">
          <FaEnvelope className="text-gray-500" />
          {isEditing ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-4 py-2 text-right transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <span className="text-gray-800">{email}</span>
          )}
        </div>
      </div>
    </div>
  );
}



//flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700