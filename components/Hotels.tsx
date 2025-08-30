"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import url from '../components/url'
interface Hotel {
  id: number;
  name: string;
  status: string;
  address: string;
  tourist_site_id: number;
  tourist_site_name?: string;
}

interface TouristSite {
  id: number;
  name: string;
}


export default function Hotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [touristSites, setTouristSites] = useState<TouristSite[]>([]);
  const [formData, setFormData] = useState<Omit<Hotel, "id">>({
    name: "",
    status: "",
    address: "",
    tourist_site_id: 0,
  });
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // ✅ جلب التوكن عند تحميل الصفحة
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("خطأ", "الرجاء تسجيل الدخول أولاً.", "error");
      return;
    }
    setToken(token);
    fetchHotels(token);
    fetchTouristSites(token);
  }, []);

  // 🔹 جلب الفنادق
  const fetchHotels = async (token: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/showAllHotel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels(res.data.data || []);
    } catch (error) {
      Swal.fire("خطأ", "فشل في جلب الفنادق", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 جلب المواقع السياحية
  const fetchTouristSites = async (token: string) => {
    try {
      const res = await axios.get(`${url}/api/getAllTouristSitesWithDetails`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTouristSites(res.data.data || []);
    } catch (error) {
      Swal.fire("خطأ", "فشل في جلب المواقع السياحية", "error");
    }
  };

  // 🔹 إضافة أو تعديل
  const handleAddOrUpdate = async () => {
    if (!formData.name.trim() || !token) return;

    setLoading(true);
    try {
      if (isEditing !== null) {
        await axios.put(`${url}/api/updateHotel/${isEditing}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("نجاح", "تم تعديل الفندق بنجاح", "success");
      } else {
        await axios.post(`${url}/api/addHotel`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("نجاح", "تمت إضافة الفندق بنجاح", "success");
      }
      setFormData({ name: "", status: "", address: "", tourist_site_id: 0 });
      setIsEditing(null);
      fetchHotels(token);
    } catch (error) {
      Swal.fire("خطأ", "حدثت مشكلة أثناء الحفظ", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 عند التعديل
  const handleEdit = (hotel: Hotel) => {
    setFormData({
      name: hotel.name,
      status: hotel.status,
      address: hotel.address,
      tourist_site_id: hotel.tourist_site_id,
    });
    setIsEditing(hotel.id);
  };

  // 🔹 عند الحذف (مع Swal)
  const handleDelete = async (id: number) => {
    if (!token) return;

    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await axios.delete(`${url}/api/deleteHotel/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("تم الحذف", "تم حذف الفندق بنجاح", "success");
      fetchHotels(token);
    } catch (error) {
      Swal.fire("خطأ", "فشل في حذف الفندق", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-3xl mx-auto p-4 md:p-8 bg-white shadow rounded-lg"
      dir="rtl"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
         إدارة الفنادق
      </h2>

      {/* ✅ Loader */}
      {loading && (
        <div className="text-center my-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 mx-auto"></div>
          <p className="text-blue-600 mt-2">جارٍ التحميل...</p>
        </div>
      )}

      {/* ✅ الفورم */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          name="name"
          placeholder="اسم الفندق"
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

      {/* ✅ زر الإضافة / التعديل */}
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
            <FaPlus /> إضافة فندق
          </>
        )}
      </button>

      {/* ✅ عرض الفنادق */}
      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4"> قائمة الفنادق</h3>
        {hotels.length === 0 ? (
          <p className="text-gray-500">لا توجد فنادق مضافة بعد.</p>
        ) : (
          <div className="space-y-4">
            {hotels.map((h) => (
              <div
                key={h.id}
                className="p-4 rounded bg-gray-50 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div>
                  <p>
                    <strong>اسم الفندق:</strong> {h.name}
                  </p>
                  <p>
                    <strong>العنوان:</strong> {h.address}
                  </p>
                  <p>
                    <strong>الموقع السياحي:</strong>{" "}
                    {h.tourist_site_name || "غير محدد"}
                  </p>
                  <p className="text-sm font-medium text-blue-600">
                    <strong>الحالة:</strong> {h.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(h)}
                    disabled={loading}
                    className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded flex items-center gap-1"
                  >
                    <FaEdit /> تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(h.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded flex items-center gap-1"
                  >
                    <FaTrash /> حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
