"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import url from '../components/url'

interface Activity {
  id: number;
  name: string;
}

export default function Activities() {
  const [activityName, setActivityName] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);

  // 🟡 جلب النشاطات عند تحميل الصفحة
  useEffect(() => {
    const fetchActivities = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`${url}/api/getActivity`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        
        setActivities(response.data.data);
      } catch (error) {
        console.error("فشل في جلب النشاطات:", error);
        Swal.fire("خطأ", "حدث خطأ أثناء جلب النشاطات", "error");
      }
    };

    fetchActivities();
  }, []);

  // 🟢 إضافة نشاط جديد
  const handleAddActivity = async () => {
    if (activityName.trim() === "") {
      Swal.fire("تنبيه", "يرجى إدخال اسم النشاط", "warning");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${url}/api/addActivity`,
        { name: activityName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const newActivity: Activity = response.data.data;
      setActivities((prev) => [...prev, newActivity]);
      setActivityName("");

      Swal.fire("تم", "تمت إضافة النشاط بنجاح", "success");
    } catch (error) {
      console.error("فشل في إضافة النشاط:", error);
      Swal.fire("خطأ", "حدث خطأ أثناء إضافة النشاط", "error");
    }
  };

  // 🔴 حذف النشاط
  const handleDeleteActivity = async (activityId: number) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${url}/api/deleteActivity/${activityId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setActivities((prev) => prev.filter((activity) => activity.id !== activityId));

      Swal.fire("تم", "تم حذف النشاط بنجاح", "success");
    } catch (error) {
      console.error("فشل في حذف النشاط:", error);
      Swal.fire("خطأ", "حدث خطأ أثناء حذف النشاط", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 shadow md:p-8" dir="rtl">
      <h2 className="text-2xl font-bold text-center mb-4">📝 الأنشطة</h2>

      {/* حقل إدخال اسم النشاط */}
      <input
        type="text"
        className="p-2 border bg-white rounded mb-4 w-full"
        placeholder="أدخل اسم النشاط"
        value={activityName}
        onChange={(e) => setActivityName(e.target.value)}
      />

      {/* زر إضافة النشاط */}
      <button
        onClick={handleAddActivity}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        <FaPlus />
        إضافة النشاط
      </button>

      {/* عرض قائمة النشاطات */}
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">النشاطات المضافة:</h3>
        <ul className="space-y-2">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-white p-2 rounded shadow"
              >
                <span className="text-lg">{activity.name}</span>
                <button
                onClick={() => handleDeleteActivity(activity.id)} // 👈 هنا كان الخطأ
                   className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                   <FaTrash />
                </button>

              </li>
            ))
          ) : (
            <li className="text-lg">لا توجد نشاطات مضافة بعد.</li>
          )}
        </ul>
      </div>
    </div>
  );
         
}










// "use client";
// import { useState } from "react";
// import { FaPlus, FaTrash } from "react-icons/fa";


// export default function Activities() {
//   const [activityName, setActivityName] = useState(""); // لتخزين اسم النشاط الجديد
//   const [activities, setActivities] = useState<string[]>([]); // لتخزين قائمة النشاطات المضافة

//   // دالة لإضافة النشاط
//   const handleAddActivity = () => {
//     if (activityName.trim() === "") {
//       alert("يرجى إدخال اسم النشاط");
//       return;
//     }
//     setActivities((prevActivities) => [...prevActivities, activityName]);
//     setActivityName(""); // إفراغ الحقل بعد الإضافة
//   };

//   // دالة لحذف النشاط حسب الفهرس
//   const handleDeleteActivity = (indexToDelete: number) => {
//     setActivities((prevActivities) =>
//       prevActivities.filter((_, index) => index !== indexToDelete)
//     );
//   };

//   return (
//     <div className="max-w-6xl mx-auto bg-gray-50 shadow md:p-8" dir="rtl">
//       <h2 className="text-2xl font-bold text-center mb-4">📝 الأنشطة</h2>

//       {/* حقل إدخال اسم النشاط */}
//       <input
//         type="text"
//         className="p-2 border bg-white rounded mb-4 w-full"
//         placeholder="أدخل اسم النشاط"
//         value={activityName}
//         onChange={(e) => setActivityName(e.target.value)}
//       />

//       {/* زر إضافة النشاط */}
//       <button
//         onClick={handleAddActivity}
//         className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//       >
//         <FaPlus />
//         إضافة النشاط
//       </button>

//       {/* عرض قائمة النشاطات */}
//       <div className="mt-6">
//         <h3 className="text-xl font-bold mb-2">النشاطات المضافة:</h3>
//         <ul className="space-y-2">
//           {activities.length > 0 ? (
//             activities.map((activity, index) => (
//               <li
//                 key={index}
//                 className="flex justify-between items-center bg-white p-2 rounded shadow"
//               >
//                 <span className="text-lg">{activity}</span>
//                 <button
//                   onClick={() => handleDeleteActivity(index)}
//                   className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//                 >
//                   <FaTrash />
//                 </button>
//               </li>
//             ))
//           ) : (
//             <li className="text-lg">لا توجد نشاطات مضافة بعد.</li>
//           )}
//         </ul>
//       </div>
//     </div>
//   );
// }






