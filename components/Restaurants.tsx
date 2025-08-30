"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import url from '../components/url'
interface Restaurant {
  id: number;
  name: string;
  status: string;
  address: string;
  tourist_site_id: number;
}

interface TouristSite {
  id: number;
  name: string;
}



export default function Restaurant() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [touristSites, setTouristSites] = useState<TouristSite[]>([]);
  const [formData, setFormData] = useState<Omit<Restaurant, "id">>({
    name: "",
    status: "",
    address: "",
    tourist_site_id: 0,
  });
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [loading, setLoading] = useState(false); // ✅ حالة التحميل
  const [token, setToken] = useState<string | null>(null);

  // ✅ جلب التوكن عند تحميل الصفحة
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("خطأ", "الرجاء تسجيل الدخول أولاً.", "error");
      return;
    }
    setToken(token);
    fetchRestaurants(token);
    fetchTouristSites(token);
  }, []);

  // 🔹 جلب المطاعم
  const fetchRestaurants = async (authToken: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/showAllRestaurant`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setRestaurants(res.data.data || []);
    } catch (error) {
      Swal.fire("خطأ", "فشل في جلب المطاعم", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 جلب المواقع السياحية
  const fetchTouristSites = async (authToken: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/getAllTouristSitesWithDetails`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setTouristSites(res.data.data || []);
    } catch (error) {
      Swal.fire("خطأ", "فشل في جلب المواقع السياحية", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 إضافة أو تعديل
  const handleAddOrUpdate = async () => {
    if (!formData.name.trim() || !token) return;

    setLoading(true);
    try {
      if (isEditing !== null) {
        await axios.put(`${url}/api/updateRestaurant/${isEditing}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("نجاح", "تم تعديل المطعم بنجاح", "success");
      } else {
        await axios.post(`${url}/api/addRestaurant`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("نجاح", "تمت إضافة المطعم بنجاح", "success");
      }
      setFormData({ name: "", status: "", address: "", tourist_site_id: 0 });
      setIsEditing(null);
      fetchRestaurants(token);
    } catch (error) {
      Swal.fire("خطأ", "حدثت مشكلة أثناء الحفظ", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 عند التعديل
  const handleEdit = (restaurant: Restaurant) => {
    setFormData({
      name: restaurant.name,
      status: restaurant.status,
      address: restaurant.address,
      tourist_site_id: restaurant.tourist_site_id,
    });
    setIsEditing(restaurant.id);
  };

  // 🔹 عند الحذف
  // 🔹 عند الحذف
const handleDelete = async (id: number) => {
  if (!token) return;

  Swal.fire({
    title: "هل أنت متأكد؟",
    text: "لن تتمكن من التراجع عن هذا الإجراء",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "نعم، احذف",
    cancelButtonText: "إلغاء",
  }).then(async (result) => {
    if (result.isConfirmed) {
      setLoading(true);
      try {
        await axios.delete(`${url}/api/deleteRestaurant/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("!تم الحذف", "تم حذف المطعم بنجاح", "success");
        fetchRestaurants(token);
      } catch (error) {
        Swal.fire("خطأ", "فشل في حذف المطعم", "error");
      } finally {
        setLoading(false);
      }
    }
  });
};

  return (
    <div
      className="max-w-3xl mx-auto p-4 md:p-8 bg-white shadow rounded-lg"
      dir="rtl"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
         إدارة المطاعم
      </h2>

      {/* ✅ Loader */}
      {loading && (
        <div className="text-center my-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 mx-auto"></div>
          <p className="text-blue-600 mt-2">جارٍ التحميل...</p>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <input
          type="text"
          name="name"
          placeholder="اسم المطعم"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 rounded w-full max-w-md"
        />
        <input
          type="text"
          name="address"
          placeholder="العنوان"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="border p-2 rounded w-full max-w-md"
        />
        <input
          type="text"
          name="status"
          placeholder="الحالة"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="border p-2 rounded w-full max-w-md"
        />
        <select
          name="tourist_site_id"
          value={formData.tourist_site_id}
          onChange={(e) =>
            setFormData({ ...formData, tourist_site_id: Number(e.target.value) })
          }
          className="border p-2 rounded w-full max-w-md text-gray-500"
        >
          <option value={0} disabled>
            اختر الموقع السياحي
          </option>
          {touristSites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAddOrUpdate}
        disabled={loading}
        className={`w-full md:w-auto px-6 py-2 rounded text-white font-semibold transition ${
          isEditing !== null
            ? "bg-green-600 hover:bg-green-700"
            : "bg-blue-600 hover:bg-blue-700"
        } flex items-center justify-center gap-2`}
      >
        {isEditing !== null ? (
          <>
            <FaEdit /> حفظ التعديلات
          </>
        ) : (
          <>
            <FaPlus /> إضافة مطعم
          </>
        )}
      </button>

      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4"> قائمة المطاعم</h3>
        {restaurants.length === 0 ? (
          <p className="text-gray-500">لا توجد مطاعم مضافة بعد.</p>
        ) : (
          <div className="space-y-4">
            {restaurants.map((r) => {
              const site = touristSites.find((s) => s.id === r.tourist_site_id);
              return (
                <div
                  key={r.id}
                  className="p-4 rounded bg-gray-50 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <div>
                    <p>
                      <strong>اسم المطعم:</strong> {r.name}
                    </p>
                    <p>
                      <strong>العنوان:</strong> {r.address}
                    </p>
                    <p>
                      <strong>الموقع السياحي:</strong> {site?.name || "غير محدد"}
                    </p>
                    <p className="text-sm font-medium text-blue-600">
                      <strong>الحالة:</strong> {r.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(r)}
                      disabled={loading}
                      className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded flex items-center gap-1"
                    >
                      <FaEdit /> تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded flex items-center gap-1"
                    >
                      <FaTrash /> حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}







// "use client";
// import { useState } from "react";
// import { FaPlus, FaTrash } from "react-icons/fa";

// export default function Attachments() {
//   const [attachmentName, setAttachmentName] = useState(""); // لتخزين اسم المرفق الجديد
//   const [attachmentPrice, setAttachmentPrice] = useState(""); // لتخزين سعر المرفق
//   const [attachments, setAttachments] = useState<{ name: string; price: number }[]>([]); // لتخزين قائمة المرفقات

//   // دالة لإضافة المرفق
//   const handleAddAttachment = () => {
//     if (attachmentName.trim() === "" || attachmentPrice.trim() === "") {
//       alert("يرجى إدخال اسم المرفق والسعر");
//       return;
//     }
//     const price = parseFloat(attachmentPrice);
//     if (isNaN(price) || price <= 0) {
//       alert("يرجى إدخال سعر صحيح");
//       return;
//     }
//     setAttachments((prev) => [...prev, { name: attachmentName, price }]);
//     setAttachmentName("");
//     setAttachmentPrice("");
//   };

//   // دالة لحذف مرفق معين
//   const handleDeleteAttachment = (indexToDelete: number) => {
//     setAttachments((prev) => prev.filter((_, index) => index !== indexToDelete));
//   };

//   return (
//     <div className="max-w-6xl mx-auto bg-gray-50 shadow md:p-8" dir="rtl">
//       <h2 className="text-2xl font-bold text-center mb-4">📌 مرفقات الرحلة</h2>

//       {/* <h2 className="text-2xl font-bold text-blue-700 mb-4">📎 مرفقات الرحلة</h2> */}

//       {/* حقل إدخال اسم المرفق */}
//       <input
//         type="text"
//         className="p-2 border bg-white rounded mb-4 w-full"
//         placeholder="أدخل اسم المرفق"
//         value={attachmentName}
//         onChange={(e) => setAttachmentName(e.target.value)}
//       />

//       {/* حقل إدخال سعر المرفق */}
//       <input
//         type="number"
//         className="p-2 border bg-white rounded mb-4 w-full"
//         placeholder="أدخل سعر المرفق"
//         value={attachmentPrice}
//         onChange={(e) => setAttachmentPrice(e.target.value)}
//       />

//       {/* زر إضافة المرفق */}
//       <button
//         onClick={handleAddAttachment}
//         className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//       >
//         <FaPlus />
//         إضافة المرفق
//       </button>

//       {/* عرض قائمة المرفقات */}
//       <div className="mt-6">
//         <h3 className="text-xl font-bold mb-2">المرفقات المضافة:</h3>
//         <ul className="space-y-2">
//           {attachments.length > 0 ? (
//             attachments.map((attachment, index) => (
//               <li
//                 key={index}
//                 className="flex justify-between items-center bg-white p-2 rounded shadow"
//               >
//                 <span className="text-lg">
//                   {attachment.name} - {attachment.price} ل.س
//                 </span>
//                 <button
//                   onClick={() => handleDeleteAttachment(index)}
//                   className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
//                 >
//                   <FaTrash />
//                 </button>
//               </li>
//             ))
//           ) : (
//             <li className="text-lg">لا توجد مرفقات مضافة بعد.</li>
//           )}
//         </ul>
//       </div>
//     </div>
//   );
// }

