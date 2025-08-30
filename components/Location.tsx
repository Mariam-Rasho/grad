"use client";

import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaMapMarkerAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import url from '../components/url'

interface LocationItem {
  id: number;
  name: string;
  description: string;
  imageUrls: string[];
  coverImageUrl: string;
  governorateId: number;
  governorateName: string;
  activities: { id: number; name: string }[];
}

interface Governorate {
  id: number;
  name: string;
}

interface Activity {
  id: number;
  name: string;
}

export default function Location() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("خطأ", "يجب تسجيل الدخول أولا", "error");
          return;
        }
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [resLocations, resGovs, resActs] = await Promise.all([
          axios.get(`${url}/api/getAllTouristSitesWithDetails`, config),
          axios.get(`${url}/api/showAllGovernorates`, config),
          axios.get(`${url}/api/getActivity`, config),
        ]);

        setGovernorates(resGovs.data.data);
        setActivities(resActs.data.data);

        const dataFromApi = resLocations.data.data;
        const mappedLocations = dataFromApi.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          coverImageUrl: item.image_url ?? "",
          imageUrls: Array.isArray(item.gallery_urls) ? item.gallery_urls : [],
          governorateId: item.governorate?.id ?? 0,
          governorateName: item.governorate,
          activities: Array.isArray(item.activities)
            ? item.activities.map((a: any) => ({ id: a.id, name: a.name }))
            : [],
        }));

        setLocations(mappedLocations);
      } catch (error) {
        console.error("فشل في تحميل البيانات:", error);
        Swal.fire("خطأ", "فشل في تحميل البيانات، تحقق من تسجيل الدخول", "error");
      }
    };

    fetchData();
  }, []);

  const handleAddOrEdit = (mode: "add" | "edit", loc?: LocationItem) => {
    let imageFiles: File[] = [];
    let coverImageFile: File | null = null;
  
    // النشاطات القديمة (من الـ loc إذا عم نعدل)
    let tempActivities: number[] = loc ? loc.activities.map(a => a.id) : [];
    let removedActivities: number[] = [];
  
    Swal.fire({
      title: mode === "add" ? "إضافة موقع جديد" : "تعديل الموقع",
      html: `
        <div style="display:flex;flex-direction:column;gap:10px;direction:rtl;text-align:right">
          <select id="location-governorate" class="swal2-select">
            <option value="" disabled ${loc ? "" : "selected"} hidden>اختر المحافظة</option>
            ${governorates
              .map(
                (g) =>
                  `<option value="${g.id}" ${
                    loc && loc.governorateId === g.id ? "selected" : ""
                  }>${g.name}</option>`
              )
              .join("")}
          </select>
          <input id="location-name" class="swal2-input" placeholder="اسم الموقع" value="${loc?.name || ""}">
          <textarea id="location-description" class="swal2-textarea" placeholder="تفاصيل الموقع">${loc?.description || ""}</textarea>
          <label>الصورة الرئيسية:</label>
          <input type="file" id="cover-image" class="swal2-file">
          <label>صور إضافية:</label>
          <input type="file" id="location-images" class="swal2-file" multiple>
          <div style="text-align:center;">
            <button type="button" id="activity-button" class="swal2-confirm swal2-styled" style="background:#3085d6; width:150px;">
              النشاطات
            </button>
          </div>
          <div id="activity-container" style="display:none;overflow:hidden;max-height:200px;opacity:1;margin-top:10px;border:1px solid #ccc;border-radius:8px;padding:10px;transition:0.3s;">
            ${activities
              .map(
                (a) =>
                  `<label><input type="checkbox" value="${a.id}" ${
                    tempActivities.includes(a.id) ? "checked" : ""
                  }> ${a.name}</label><br/>`
              )
              .join("")}
          </div>
        </div>
      `,
      didOpen: () => {
        document.getElementById("activity-button")?.addEventListener("click", () => {
          const container = document.getElementById("activity-container");
          if (container) container.style.display = container.style.display === "block" ? "none" : "block";
        });
  
        const checkboxes = document.querySelectorAll<HTMLInputElement>(
          "#activity-container input[type='checkbox']"
        );
  
        checkboxes.forEach((cb) => {
          cb.addEventListener("change", () => {
            const actId = +cb.value;
  
            if (cb.checked) {
              // إذا رجع يختار نشاط، نحذفه من لائحة الإزالة
              if (!tempActivities.includes(actId)) tempActivities.push(actId);
              removedActivities = removedActivities.filter((a) => a !== actId);
            } else {
              // إذا ألغى اختيار نشاط موجود سابقاً → ضيفه على remove
              tempActivities = tempActivities.filter((a) => a !== actId);
              if (!removedActivities.includes(actId)) removedActivities.push(actId);
            }
          });
        });
  
        document.getElementById("cover-image")?.addEventListener("change", (e: any) => {
          coverImageFile = e.target.files?.[0] || null;
        });
  
        document.getElementById("location-images")?.addEventListener("change", (e: any) => {
          imageFiles = Array.from(e.target.files || []);
        });
      },
      preConfirm: () => {
        const name = (document.getElementById("location-name") as HTMLInputElement).value.trim();
        const description = (document.getElementById("location-description") as HTMLTextAreaElement).value.trim();
        const governorateIdStr = (document.getElementById("location-governorate") as HTMLSelectElement).value;
        const governorateId = parseInt(governorateIdStr);
  
        if (!name || !description || isNaN(governorateId)) {
          Swal.showValidationMessage("يرجى تعبئة كل الحقول الأساسية");
          return;
        }
  
        return {
          name,
          description,
          governorateId,
          addActivities: tempActivities,     // النشاطات المراد إضافتها/الحفاظ عليها
          removeActivities: removedActivities, // النشاطات المراد إزالتها
        };
      },
      confirmButtonText: mode === "add" ? "إضافة" : "حفظ",
      cancelButtonText: "إلغاء",
      showCancelButton: true,
    })
    .then((r) => {
      if (r.isConfirmed && r.value) {
        const formData = new FormData();
        formData.append("name", r.value.name);
        formData.append("description", r.value.description);
        formData.append("governorate_id", r.value.governorateId.toString());
  
       if (mode === "add") {
  // في حالة الإضافة → لازم نرسل activities[]
  r.value.addActivities.forEach((actId: number) =>
    formData.append("activities[]", actId.toString())
  );
} else {
  // في حالة التعديل → نستخدم add_activities و remove_activities
  r.value.addActivities.forEach((actId: number) =>
    formData.append("add_activities[]", actId.toString())
  );

  r.value.removeActivities.forEach((actId: number) =>
    formData.append("remove_activities[]", actId.toString())
  );
}

        if (coverImageFile) {
          formData.append("image", coverImageFile);
        }
  
        if (imageFiles.length > 0) {
          imageFiles.forEach((file) => {
            formData.append("gallery[]", file);
          });
        }
  
        const urll =
          mode === "add"
            ? `${url}/api/storeSite`
            : `${url}/api/updateSite/${loc!.id}`;
  
        axios
          .post(urll, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then(() => {
            Swal.fire("تم!", mode === "add" ? "أضيف الموقع" : "تم التحديث", "success");
             window.location.reload();
          })
          .catch((err) => {
            console.error("فشل في العملية:", err.response?.data || err);
            Swal.fire("خطأ", err.response?.data?.message || "فشل في العملية", "error");
          });
      }
    });
  };
   
  const handleDeleteLocation = (id: number) =>
    Swal.fire({
      title: "تأكيد الحذف",
      text: "هل أنت متأكد؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم",
      cancelButtonText: "إلغاء",
    }).then((r) => {
      if (r.isConfirmed) {
        axios
          .delete(`${url}/api/deleteTouristSite/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then(() => {
            setLocations((prev) => prev.filter((l) => l.id !== id));
            Swal.fire("تم الحذف", "", "success");
          })
          .catch((err) => {
            console.error("فشل في الحذف:", err);
            Swal.fire("خطأ", "فشل في الحذف", "error");
          });
      }
    });

  const deleteGalleryImageTouristSite = async (locationId: number, imageUrl: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("خطأ", "يرجى تسجيل الدخول أولاً", "error");
      return;
    }

    const currentLocation = locations.find((l) => l.id === locationId);
    if (!currentLocation || currentLocation.imageUrls.length <= 1) {
      Swal.fire("تنبيه", "لا يمكن حذف الصورة. يجب أن تبقى صورة واحدة على الأقل.", "warning");
      return;
    }

    const confirmed = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف الصورة نهائيًا!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء",
    });

    if (!confirmed.isConfirmed) return;

    const imagePath = imageUrl.replace(`${url}/storage/`, "");

    try {
      await axios.delete(
        `${url}/api/deleteGalleryImageTouristSite/${locationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          data: {
            image_path: imagePath,
          },
        }
      );

      setLocations((prev) =>
        prev.map((l) =>
          l.id === locationId
            ? { ...l, imageUrls: l.imageUrls.filter((url) => url !== imageUrl) }
            : l
        )
      );

      Swal.fire("تم الحذف!", "تم حذف الصورة بنجاح", "success");
    } catch (error) {
      console.error("فشل في حذف الصورة:", error);
      Swal.fire("خطأ", "فشل في حذف الصورة من الخادم", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 p-8" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">قائمة المواقع السياحية</h1>
        <button
          onClick={() => handleAddOrEdit("add")}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-800 text-white py-2 px-4 rounded"
        >
          <FaPlus /> إضافة موقع
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {[...new Set(locations.map((l) => l.governorateName))].map((govName) => (
          <div key={govName}>
            <div className="flex flex-col gap-6">
              {locations
                .map((loc) => (
                  <div key={loc.id} className="bg-gray-100 rounded shadow p-4">
                    <img
                      src={loc.coverImageUrl}
                      alt={`${govName}-cover`}
                      width={400}
                      height={200}
                      className="w-48 h-32 object-cover rounded mb-2"
                    />

                    <div className="flex gap-2 overflow-x-auto max-w-full mb-2">
                      {loc.imageUrls.map((url, i) => (
                        <div key={i} className="relative group flex-shrink-0 w-48 h-32">
                          <img
                            src={url}
                            alt={`img-${i}`}
                            className="rounded object-cover w-full h-full"
                          />
                          <button
                            onClick={() => deleteGalleryImageTouristSite(loc.id, url)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>

                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FaMapMarkerAlt className="text-blue-600" />
                      {loc.governorateName}
                    </p>

                    <h3 className="text-xl font-semibold mb-1">{loc.name}</h3>
                    <p className="text-gray-600 mb-1">{loc.description}</p>
                    <p className="text-black-700 text-sm mt-1">
                      النشاطات: {loc.activities.map((a) => a.name).join(", ")}
                    </p>

                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => handleAddOrEdit("edit", loc)}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white p-2 rounded"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="bg-red-600 hover:bg-red-800 text-white p-2 rounded"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}





















