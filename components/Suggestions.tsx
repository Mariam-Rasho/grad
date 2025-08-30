"use client";

import { useEffect, useState } from "react";
import { FaEnvelope, FaCommentDots, FaTrash } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import url from '../components/url'

interface Suggestion {
  id: number;
  email: string;
  message: string;
}

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
//const token = "3|qcC8I2VA9xcnZtWgpTOlQueaAvue1HAnLAItRqtR0fd4517b"; // توكن مؤقت

  // جلب الاقتراحات من السيرفر عند تحميل الصفحة
  useEffect(() => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      Swal.fire("خطأ", "الرجاء تسجيل الدخول أولاً.", "error");
      return;
    }
  
    axios
      .get(`${url}/api/showAllSuggestion`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const data = res.data.data;
        const formatted = data.map((item: any) => ({
          id: item.id,
          email: item.email,
          message: item.Suggestion,
        }));
        setSuggestions(formatted);
      })
      .catch((err) => {
        console.error("فشل في تحميل الاقتراحات:", err);
        Swal.fire("خطأ", "فشل في تحميل الاقتراحات - ربما تحتاج تسجيل دخول", "error");
      });
  }, []);
  

  // حذف اقتراح واحد من السيرفر ومن الواجهة
  const deleteSuggestion = async (id: number) => {
    const confirmResult = await Swal.fire({
      title: "هل أنت متأكد من حذف هذا الاقتراح؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذفه",
      cancelButtonText: "إلغاء",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await axios.delete(`${url}/api/deleteSuggestion/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      

      setSuggestions((prev) => prev.filter((s) => s.id !== id));

      Swal.fire("تم الحذف!", "تم حذف الاقتراح بنجاح.", "success");
    } catch (error) {
      console.error("فشل في حذف الاقتراح:", error);
      Swal.fire("خطأ", "فشل في حذف الاقتراح", "error");
    }
  };

  // حذف كل الاقتراحات من السيرفر ومن الواجهة
  const clearAll = async () => {
    const confirmResult = await Swal.fire({
      title: "هل أنت متأكد من حذف جميع الاقتراحات؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف الكل",
      cancelButtonText: "إلغاء",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await axios.delete(`${url}/api/destroyAllSuggestion`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      

      setSuggestions([]);

      Swal.fire("تم الحذف!", "تم حذف جميع الاقتراحات.", "success");
    } catch (error) {
      console.error("فشل في حذف جميع الاقتراحات:", error);
      Swal.fire("خطأ", "فشل في حذف جميع الاقتراحات", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-gray-50 shadow" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-800">💡 اقتراحات المستخدمين</h2>
        {suggestions.length > 0 && (
          <button
            onClick={clearAll}
            className="bg-gray-700 hover:bg-red-600 text-white px-4 py-2 rounded text-sm shadow"
          >
            حذف الكل 🗑️
          </button>
        )}
      </div>

      {suggestions.length === 0 ? (
        <p className="text-center text-gray-500">لا توجد اقتراحات حاليًا.</p>
      ) : (
        <div className="space-y-6">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm relative"
            >
              <button
                onClick={() => deleteSuggestion(s.id)}
                className="absolute top-3 left-3 text-red-500 hover:text-red-700"
                title="حذف الاقتراح"
              >
                <FaTrash />
              </button>

              <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                <FaEnvelope />
                <span>{s.email}</span>
              </div>
              <div className="flex items-start gap-2 text-gray-800">
                <FaCommentDots className="mt-1 text-gray-400" />
                <p>{s.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

















// "use client";
// import { useState } from "react";
// import { FaEnvelope, FaCommentDots, FaTrash } from "react-icons/fa";

// interface Suggestion {
//   email: string;
//   message: string;
// }

// export default function Suggestions() {
//   const [suggestions, setSuggestions] = useState<Suggestion[]>([
//     {
//       email: "user1@example.com",
//       message: "أقترح إضافة قسم خاص للأنشطة الترفيهية للأطفال.",
//     },
//     {
//       email: "user2@example.com",
//       message: "الموقع رائع لكن أرجو تحسين سرعة التحميل.",
//     },
//   ]);

//   const deleteSuggestion = (index: number) => {
//     const updated = suggestions.filter((_, i) => i !== index);
//     setSuggestions(updated);
//   };

//   const clearAll = () => {
//     if (confirm("هل أنت متأكد من حذف جميع الاقتراحات؟")) {
//       setSuggestions([]);
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-4 md:p-8 bg-gray-50 shadow" dir="rtl">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold text-blue-800">💡 اقتراحات المستخدمين</h2>
//         {suggestions.length > 0 && (
//           <button
//             onClick={clearAll}
//             className="bg-gray-700 hover:bg-red-600 text-white px-4 py-2 rounded text-sm shadow"
//           >
//            حذف الكل 🗑️ 
//           </button>
//         )}
//       </div>

//       {suggestions.length === 0 ? (
//         <p className="text-center text-gray-500">لا توجد اقتراحات حاليًا.</p>
//       ) : (
//         <div className="space-y-6">
//           {suggestions.map((s, index) => (
//             <div
//               key={index}
//               className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm relative"
//             >
//               <button
//                 onClick={() => deleteSuggestion(index)}
//                 className="absolute top-3 left-3 text-red-500 hover:text-red-700"
//                 title="حذف الاقتراح"
//               >
//                 <FaTrash />
//               </button>

//               <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
//                 <FaEnvelope />
//                 <span>{s.email}</span>
//               </div>
//               <div className="flex items-start gap-2 text-gray-800">
//                 <FaCommentDots className="mt-1 text-gray-400" />
//                 <p>{s.message}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
