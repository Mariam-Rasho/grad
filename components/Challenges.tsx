"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import url from '../components/url'
interface Challenge {
  id: number;
  title: string;
  condition: string;
}

export default function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // جلب التحديات من الـ API عند تحميل الصفحة
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await axios.get(`${url}/api/getCompetition`);
        const data = response.data.data;

        const formatted = data.map((item: any) => ({
          id: item.id,
          title: item.name,
          condition: convertConditionToText(item.Competition_condition),
        }));

        setChallenges(formatted);
      } catch (error) {
        console.error("فشل في تحميل التحديات:", error);
        Swal.fire("خطأ", "تعذر تحميل التحديات من الخادم", "error");
      }
    };

    fetchChallenges();
  }, []);

  // دالة تحويل شرط التحدي إلى نص مفهوم
  const convertConditionToText = (condition: string) => {
    switch (condition) {
      case "rate_5_sites":
        return "قيّم 5 مواقع سياحية";
      case "walk_10000_steps":
        return "المشي 10,000 خطوة يومياً";
      case "read_a_book":
        return "اقرأ كتاباً كاملاً";
      default:
        return condition;
    }
  };

  const handleDelete = (id: number) => {
    // حالياً حذف من الواجهة فقط، إذا أردت الربط بـ API للحذف أخبرني
    setChallenges((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 shadow md:p-8" dir="rtl">
      <h2 className="text-2xl font-bold mb-6 text-center">🎯 قائمة التحديات</h2>

      <div className="space-y-4">
        {challenges.length > 0 ? (
          challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="p-4 bg-gray-100 rounded flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-lg">{challenge.title}</h3>
                <p className="text-gray-700">{challenge.condition}</p>
              </div>
             
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">لا توجد تحديات حالياً</p>
        )}
      </div>
    </div>
  );
}
