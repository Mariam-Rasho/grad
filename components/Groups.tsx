"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import url from '../components/url'
interface Attachment {
  id: number;
  name: string;
  price: number;
}

interface GroupTrip {
  id: number;
  destination: string;
  siteId?: number;          // ✅ معرف الموقع السياحي
  siteName?: string;        // ✅ اسم الموقع السياحي
  startTime: string;
  endTime: string;
  details: string;
  personCount: number;
  costPerPerson: number;
    discountPercentage?: number | null; // ✅ حقل نسبة العرض
  mainImageUrl: string;
  imageUrls: string[];
  attachments?: Attachment[];
  
}
/////////////////////
interface TouristSite {
  id: number;
  name: string;
}

function formatDateTime(datetimeStr: string): string {
  const date = new Date(datetimeStr);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function Groups() {
  const [groupTrips, setGroupTrips] = useState<GroupTrip[]>([]);
  const [touristSites, setTouristSites] = useState<TouristSite[]>([]);  const token = localStorage.getItem("token");

  // جلب المواقع السياحية///////////////////
  useEffect(() => {
    axios.get(`${url}/api/getAllTouristSitesWithDetails`)
      .then(res => setTouristSites(res.data.data || res.data))
      .catch(() => Swal.fire("خطأ", "فشل في جلب المواقع السياحية", "error"));
  }, []);

   // جلب الرحلات مع المرفقات عند التحميل
   useEffect(() => {
    axios.get(`${url}/api/getAllGroupTrips`)
      .then(async response => {
        const tripsFromApi = response.data.data || response.data;

        // جلب المرفقات لكل رحلة
        const tripsWithAttachments: GroupTrip[] = await Promise.all(
          tripsFromApi.map(async (trip: any) => {
            let attachments: Attachment[] = [];
            try {
              const attachResp = await axios.post(
                `${url}/api/getAttachment`,
                { group_trip_id: trip.id },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              attachments = attachResp.data.data.map((a: any) => ({
                name: a.name,
                price: Number(a.price),
                id: a.id, // اضفت id للمرفق لأن الحذف والتعديل يحتاجه
              }));
            } catch {
              attachments = [];
            }
              ////////////////
            const site = touristSites.find(s => s.id === trip.tourist_site_id); 
            
            return {
              id: trip.id,
              destination: trip.Destination_name,
              siteId: site?.id,///////////
              siteName: site?.name,/////////
              startTime: trip.start_time,
              endTime: trip.end_time,
              details: trip.Details,
              personCount: Number(trip.number_of_people),
              costPerPerson: Number(trip.cost),
              discountPercentage: trip.discount_percentage ? Number(trip.discount_percentage) : null, // ✅
              mainImageUrl: `${url}/storage/` + trip.image,
              imageUrls: (trip.gallery || []).map((img: string) => `${url}/storage/` + img),
              attachments,
            };
          })
        );

        setGroupTrips(tripsWithAttachments);
      })
      .catch(() => {
        Swal.fire("خطأ", "فشل في جلب الرحلات", "error");
      });
  }, [token]);

  const readFilesAsDataURLs = (files: File[]): Promise<string[]> => {
    return Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );
  };

  const handleAdd = () => {
    Swal.fire({
      title: "إضافة رحلة جديدة",
      html: `
        
        <div style="display: flex; flex-direction: column; gap: 8px;">
        <select id="add-site" class="swal2-select">
          <option value="" disabled selected hidden>اختر الموقع السياحي</option>
          ${touristSites.map(site => `<option value="${site.id}">${site.name}</option>`).join("")}
        </select>
          <input id="add-destination" class="swal2-input" placeholder="الوجهة">
          <input id="add-start" class="swal2-input" type="datetime-local">
          <input id="add-end" class="swal2-input" type="datetime-local">
          <textarea id="add-details" class="swal2-textarea" placeholder="تفاصيل الرحلة"></textarea>
          <input id="add-count" class="swal2-input" type="number" placeholder="عدد الأشخاص">
          <input id="add-cost" class="swal2-input" type="number" placeholder="الكلفة للشخص">
 <input id="add-discount" class="swal2-input" type="number" placeholder="نسبة العرض (%)" min="0" max="100">////////////
          <label class="swal2-label">📷 الصورة الرئيسية:</label>
          <input id="add-main-image" class="swal2-file" type="file" accept="image/*">

          <label class="swal2-label">🖼️ الصور الإضافية:</label>
          <input id="add-images" class="swal2-file" type="file" multiple accept="image/*">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "إضافة",
      cancelButtonText: "إلغاء",
      preConfirm: () => {
        const siteId = Number((document.getElementById("add-site") as HTMLSelectElement).value);
        const destination = (document.getElementById("add-destination") as HTMLInputElement).value;
        const startTime = (document.getElementById("add-start") as HTMLInputElement).value;
        const endTime = (document.getElementById("add-end") as HTMLInputElement).value;
        const details = (document.getElementById("add-details") as HTMLTextAreaElement).value;
        const personCount = Number((document.getElementById("add-count") as HTMLInputElement).value);
        const costPerPerson = Number((document.getElementById("add-cost") as HTMLInputElement).value);
        const discountPercentageRaw = (document.getElementById("add-discount") as HTMLInputElement).value;////////////
             const discountPercentage = discountPercentageRaw ? Number(discountPercentageRaw) : null;////////////

        const mainFile = (document.getElementById("add-main-image") as HTMLInputElement).files?.[0];
        const files = Array.from((document.getElementById("add-images") as HTMLInputElement).files || []);

        if (!siteId || !destination || !startTime || !endTime || !details || !personCount || !costPerPerson || !mainFile) {
          Swal.showValidationMessage("يرجى تعبئة جميع الحقول الأساسية واختيار صورة رئيسية");
          return;
        }
        //  return { destination, startTime, endTime, details, personCount, costPerPerson, discountPercentage, mainFile, files };
    //   },
    // }).then(async (result) => {
    //   if (result.isConfirmed && result.value) {
    //     const { destination, startTime, endTime, details, personCount, costPerPerson, discountPercentage, mainFile, files } = result.value;


        return Promise.all([
          Promise.resolve(siteId),////
          Promise.resolve(destination),
          Promise.resolve(startTime),
          Promise.resolve(endTime),
          Promise.resolve(details),
          Promise.resolve(personCount),
          Promise.resolve(costPerPerson),
          Promise.resolve(discountPercentage),//////////
          Promise.resolve(mainFile),
          Promise.resolve(files),
        ]);
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const [
          siteId,
          destination,
          startTime,
          endTime,
          details,
          personCount,
          costPerPerson,
          discountPercentage,//////////
          mainFile,
          files,
        ] = result.value;

        // إنشاء FormData لإرسال الملفات والنصوص
        const formData = new FormData();
        formData.append("tourist_site_id", siteId.toString());
        formData.append("Destination_name", destination);
        formData.append("start_time", startTime);
        formData.append("end_time", endTime);
        formData.append("Details", details);
        formData.append("number_of_people", personCount.toString());
        formData.append("cost", costPerPerson.toString());
        if (discountPercentage != null) formData.append("discount_percentage", discountPercentage.toString());///////
        formData.append("image", mainFile as File);
        (files as File[]).forEach((file) => formData.append("gallery[]", file));

        try {
          const response = await axios.post(`${url}/api/addGroupTrip`, formData, {
            headers: { "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
             },
          });

          const newTripFromApi = response.data.data;
          if (!siteId) {
            Swal.showValidationMessage("يرجى اختيار الموقع السياحي");
            return;
          }
          
          const site = touristSites.find(s => s.id === siteId);
          if (!site) {
            Swal.showValidationMessage("الموقع السياحي غير موجود");
            return;
          }
          
          const newTrip: GroupTrip = {
            id: newTripFromApi.id,
            destination: newTripFromApi.Destination_name,
            siteId,//////////
            siteName: site.name,///////
            startTime: newTripFromApi.start_time,
            endTime: newTripFromApi.end_time,
            details: newTripFromApi.Details,
            personCount: Number(newTripFromApi.number_of_people),
            costPerPerson: Number(newTripFromApi.cost),
            discountPercentage: newTripFromApi.discount_percentage ? Number(newTripFromApi.discount_percentage) : null,/////////
            mainImageUrl: `${url}/storage/` + newTripFromApi.image,
            imageUrls: (newTripFromApi.gallery || []).map((img: string) => `${url}/storage/` + img),
            attachments: [],
          };

          setGroupTrips((prev) => [...prev, newTrip]);
          Swal.fire("تمت الإضافة", "", "success");
        } catch (error: any) {
          console.error("API Error:", error.response || error.message || error);
          Swal.fire("خطأ", "فشل في إضافة الرحلة: " + (error.response?.data?.message || error.message), "error");
        }
        
      }
    });
  };
///////////////////////

    // إضافة مرفق عن طريق API
  const handleAddAttachment = (tripId: number) => {
    Swal.fire({
      title: "إضافة مرفق",
      html: `
        <input id="new-attachment-name" class="swal2-input" placeholder="اسم المرفق">
        <input id="new-attachment-price" class="swal2-input" type="number" placeholder="سعر المرفق">
      `,
      showCancelButton: true,
      confirmButtonText: "إضافة",
      cancelButtonText: "إلغاء",
      preConfirm: () => {
        const name = (document.getElementById("new-attachment-name") as HTMLInputElement).value;
        const priceRaw = (document.getElementById("new-attachment-price") as HTMLInputElement).value;
        const price = Number(priceRaw);
        if (!name || !priceRaw) {
          Swal.showValidationMessage("الرجاء تعبئة كل الحقول");
          return;
        }
        return { name, price };
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const response = await axios.post(
            `${url}/api/addAttachment`,
            {
              name: result.value.name,
              price: result.value.price,
              group_trip_id: tripId,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const newAttachment = response.data.data;
          console.log(newAttachment); // تأكد أنه يحتوي على id
          setGroupTrips(prev =>
            prev.map(trip =>
              trip.id === tripId
                ? {
                    ...trip,
                    attachments: [...(trip.attachments || []), {
                      name: newAttachment.name,
                      price: Number(newAttachment.price),
                      id: newAttachment.id,
                    }],
                  }
                : trip
            )
          );

          Swal.fire("تمت إضافة المرفق", "", "success");
        } catch {
          Swal.fire("خطأ", "فشل في إضافة المرفق", "error");
        }
      }
    });
  };

  const handleDeleteExtraImage = async (tripId: number, imageUrl: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("خطأ", "يرجى تسجيل الدخول أولاً", "error");
      return;
    }
  
    const currentTrip = groupTrips.find((t) => t.id === tripId);
    if (!currentTrip) {
      Swal.fire("خطأ", "تعذر العثور على الرحلة", "error");
      return;
    }
  
    // تحقق من عدد الصور قبل الحذف
    if (currentTrip.imageUrls.length <= 1) {
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
      await axios.delete(`${url}/api/deleteGalleryImageGroupTrip/${tripId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        data: {
          image_path: imagePath,
        },
      });
  
      setGroupTrips((prev) =>
        prev.map((t) =>
          t.id === tripId
            ? { ...t, imageUrls: t.imageUrls.filter((url) => url !== imageUrl) }
            : t
        )
      );
  
      Swal.fire("تم الحذف!", "تم حذف الصورة بنجاح", "success");
    } catch (error) {
      console.error("فشل في حذف الصورة:", error);
      Swal.fire("خطأ", "فشل في حذف الصورة من الخادم", "error");
    }
  };
  
//////////////
  // حذف مرفق عن طريق API مع تأكيد
  const handleDeleteAttachment = (tripId: number, index: number) => {
    const trip = groupTrips.find(t => t.id === tripId);
    if (!trip || !trip.attachments) return;

    const attachment = trip.attachments[index];

    Swal.fire({
      title: "هل أنت متأكد من حذف المرفق؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${url}/api/deleteAttachment/${attachment.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setGroupTrips(prev =>
            prev.map(t =>
              t.id === tripId
                ? { ...t, attachments: t.attachments?.filter((_, i) => i !== index) }
                : t
            )
          );

          Swal.fire("تم الحذف", "تم حذف المرفق بنجاح", "success");
        } catch {
          Swal.fire("خطأ", "فشل في حذف المرفق", "error");
        }
      }
    });
  };

  // تعديل مرفق مع API
  const handleEditAttachment = (tripId: number, index: number, att: Attachment) => {
    Swal.fire({
      title: "تعديل المرفق",
      html: `
        <input id="edit-name" class="swal2-input" value="${att.name}">
        <input id="edit-price" class="swal2-input" type="number" value="${att.price}">
      `,
      preConfirm: () => {
        const name = (document.getElementById("edit-name") as HTMLInputElement).value;
        const price = Number((document.getElementById("edit-price") as HTMLInputElement).value);
        if (!name || !price) {
          Swal.showValidationMessage("جميع الحقول مطلوبة");
          return;
        }
        return { name, price };
      },
      showCancelButton: true,
      confirmButtonText: "حفظ",
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          await axios.put(
            `${url}/api/updateAttachment/${att.id}`,
            {
              name: result.value.name,
              price: result.value.price,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setGroupTrips(prev =>
            prev.map(trip =>
              trip.id === tripId
                ? {
                    ...trip,
                    attachments: trip.attachments?.map((a, i) =>
                      i === index ? { ...a, name: result.value.name, price: result.value.price } : a
                    ),
                  }
                : trip
            )
          );

          Swal.fire("تم التعديل", "", "success");
        } catch {
          Swal.fire("خطأ", "فشل في تعديل المرفق", "error");
        }
      }
    });
  };
//////////////////////////تعديل رحلة


const handleEditTrip = (trip: GroupTrip) => {
  Swal.fire({
    title: "تعديل الرحلة",
    html: `
    <select id="edit-site" class="swal2-select">
        <option value="" disabled hidden>اختر الموقع السياحي</option>
        ${touristSites.map(site => `<option value="${site.id}" ${trip.siteId === site.id ? "selected" : ""}>${site.name}</option>`).join("")}
      </select>
      <input id="trip-destination" class="swal2-input" value="${trip.destination}" placeholder="الوجهة">
      <input id="trip-start" class="swal2-input" type="datetime-local" value="${trip.startTime}">
      <input id="trip-end" class="swal2-input" type="datetime-local" value="${trip.endTime}">
      <textarea id="trip-details" class="swal2-textarea" placeholder="تفاصيل">${trip.details}</textarea>
      <input id="trip-count" class="swal2-input" type="number" value="${trip.personCount}" placeholder="عدد الأشخاص">
      <input id="trip-cost" class="swal2-input" type="number" value="${trip.costPerPerson}" placeholder="الكلفة للشخص">
<input id="trip-discount" class="swal2-input" type="number" min="0" max="100" placeholder="نسبة العرض (%)" value="${trip.discountPercentage ?? ""}">/////
      <div style="text-align: right; margin: 10px 0;">
        <label style="font-weight: bold;">📷 تغيير الصورة الرئيسية:</label><br>
        <input type="file" id="trip-main-image" accept="image/*" class="swal2-file">
      </div>

      <div style="text-align: right; margin: 10px 0;">
        <label style="font-weight: bold;">🖼️ إضافة صور جديدة:</label><br>
        <input type="file" id="trip-gallery" multiple accept="image/*" class="swal2-file">
      </div>
    `,
    confirmButtonText: "حفظ التعديلات",
    showCancelButton: true,
    cancelButtonText: "إلغاء",
    preConfirm: async () => {
      const siteId = Number((document.getElementById("edit-site") as HTMLSelectElement).value);
      const destination = (document.getElementById("trip-destination") as HTMLInputElement).value;
      const startTime = (document.getElementById("trip-start") as HTMLInputElement).value;
      const endTime = (document.getElementById("trip-end") as HTMLInputElement).value;
      const details = (document.getElementById("trip-details") as HTMLTextAreaElement).value;
      const personCount = Number((document.getElementById("trip-count") as HTMLInputElement).value);
      const costPerPerson = Number((document.getElementById("trip-cost") as HTMLInputElement).value);
      const mainFile = (document.getElementById("trip-main-image") as HTMLInputElement).files?.[0];
      const galleryFiles = (document.getElementById("trip-gallery") as HTMLInputElement).files;
      const discountPercentageRaw = (document.getElementById("trip-discount") as HTMLInputElement).value;////////
               const discountPercentage = discountPercentageRaw ? Number(discountPercentageRaw) : null;///////////
      if (!siteId || !destination || !startTime || !endTime || !details || personCount <= 0 || costPerPerson <= 0) {
        Swal.showValidationMessage("يرجى تعبئة كافة الحقول بشكل صحيح");
        return;
      }

      return { siteId ,destination, startTime, endTime, details, personCount, costPerPerson,discountPercentage, mainFile, galleryFiles };
    }
  }).then(async (result) => {
    if (!result.isConfirmed || !result.value) return;

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("خطأ", "يرجى تسجيل الدخول أولاً", "error");
      return;
    }

    const {
      siteId,
      destination,
      startTime,
      endTime,
      details,
      personCount,
      costPerPerson,
      discountPercentage,
      mainFile,
      galleryFiles
    } = result.value;

    const formData = new FormData();
    formData.append("tourist_site_id", siteId.toString());
    formData.append("Destination_name", destination);
    formData.append("start_time", startTime);
    formData.append("end_time", endTime);
    formData.append("Details", details);
    formData.append("number_of_people", personCount.toString());
    formData.append("cost", costPerPerson.toString());
    if (discountPercentage != null) formData.append("discount_percentage", discountPercentage.toString());////////

    if (mainFile) {
      formData.append("image", mainFile);
    }

    if (galleryFiles && galleryFiles.length > 0) {
      Array.from(galleryFiles as FileList).forEach((file: File) => {
        formData.append("gallery[]", file);
      });
    }

    try {
      const response = await axios.post(`${url}/api/updateGroupTrip/${trip.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      const updated = response.data.data;
      // const site = touristSites.find(s => s.id === siteId);
      if (!siteId) {
        Swal.showValidationMessage("يرجى اختيار الموقع السياحي");
        return;
      }
      
      const site = touristSites.find(s => s.id === siteId);
      if (!site) {
        Swal.showValidationMessage("الموقع السياحي غير موجود");
        return;
      }
      const updatedTrip: GroupTrip = {
        ...trip,
        siteId,
        siteName: site.name,
        destination: updated.Destination_name,
        startTime: updated.start_time,
        endTime: updated.end_time,
        details: updated.Details,
        personCount: updated.number_of_people,
        costPerPerson: updated.cost,
        discountPercentage: updated.discount_percentage ? Number(updated.discount_percentage) : null,//////
        mainImageUrl: `${url}/storage/${updated.image}`,
        imageUrls: updated.gallery.map((img: string) => `${url}/storage/${img}`),
      };

      setGroupTrips((prev) => prev.map((t) => (t.id === trip.id ? updatedTrip : t)));

      Swal.fire("تم التحديث", "تم تعديل الرحلة بنجاح", "success");
    } catch (error: any) {
      console.error("خطأ:", error);
      Swal.fire("خطأ", error.response?.data?.message || "فشل في تعديل الرحلة", "error");
    }
  });
};



  const handleDeleteTrip = async (id: number) => {
    try {
      await axios.delete(`${url}/api/deleteGroupTrip/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });


      setGroupTrips((prev) => prev.filter((trip) => trip.id !== id));
      Swal.fire("تم الحذف", "", "success");
    } catch (error: any) {
      console.error("API Delete Error:", error.response || error.message || error);
      Swal.fire("خطأ", "فشل في حذف الرحلة: " + (error.response?.data?.message || error.message), "error");
    }
  };

  // الباقي من الكود كما هو بدون تعديل
  // ...

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 shadow md:p-8" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">الرحلات الجماعية</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded"
        >
          <FaPlus />
          إضافة رحلة
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {groupTrips.map((trip) => (
          <div key={trip.id} className="bg-gray-100 p-4 rounded shadow">
            <div className="mb-3">
              <img src={trip.mainImageUrl} alt="main" className="w-48 h-32 object-cover rounded my-2" />
            </div>

            {trip.imageUrls.length > 0 && (
              <div className="flex gap-2 overflow-x-auto max-w-full mb-2">
                {trip.imageUrls.map((url, i) => (
                  <div key={i} className="relative group flex-shrink-0 w-48 h-32">
                    <img src={url} alt={`img-${i}`} className="w-full h-full object-cover rounded" />
                    <button
                      onClick={() => handleDeleteExtraImage(trip.id, url)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
              {trip.siteName && (
            <h3 className="text-lg font-semibold text-blue-600">{trip.siteName}</h3>
             )}
            <h2 className="text-xl font-bold mt-2">{trip.destination}</h2>
            <p><strong>من:</strong> {formatDateTime(trip.startTime)}</p>
            <p><strong>إلى:</strong> {formatDateTime(trip.endTime)}</p>
            <p>{trip.details}</p>
            <p>👥 عدد الأشخاص: {trip.personCount}</p>
            <p> الكلفة للشخص: {trip.costPerPerson} ل.س</p>
            {trip.discountPercentage != null && (
              <>
                <p> العرض: {trip.discountPercentage}%</p>
                <p> الكلفة بعد الخصم: {(trip.costPerPerson * (1 - trip.discountPercentage / 100)).toFixed(2)} ل.س</p>
              </>
            )}

            <button
              onClick={() => handleAddAttachment(trip.id)}
              className="mt-2 flex items-center gap-1 text-blue-600 font-bold hover:underline text-sm"
            >
              <FaPlus className="text-xs " />
              مرفق
            </button>

            {(trip.attachments?.length ?? 0) > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold">🧳 المرفقات:</h3>
                {(trip.attachments ?? []).map((att, i) => (
                  <div key={i} className="flex items-center justify-between bg-white p-2 my-1 rounded shadow-sm">
                    <span>{att.name} - {att.price} ل.س</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAttachment(trip.id, i, att)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white p-1 rounded"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteAttachment(trip.id, i)}
                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEditTrip(trip)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded flex items-center gap-1"
              >
                <FaEdit />
                تعديل الرحلة
              </button>
              <button
                onClick={() => handleDeleteTrip(trip.id)}
                className="bg-red-600 hover:bg-red-800 text-white py-1 px-3 rounded flex items-center gap-1"
              >
                <FaTrash />
                حذف الرحلة
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
      );
 }
