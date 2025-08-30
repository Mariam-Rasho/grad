"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import url from '../components/url'

interface Governorate {
  id: number;
  name: string;
  description: string;
  imageUrls: string[];
  coverImage?: string;
}

export default function Governorates() {
  const [governorates, setGovernorates] = useState<Governorate[]>([]);

  useEffect(() => {
    const fetchGovernorates = async () => {
      try {
        const response = await axios.get(`${url}/api/showAllGovernorates`);
        const dataFromApi = response.data.data;

        const mappedGovernorates = dataFromApi.map((gov: any) => ({
          id: gov.id,
          name: gov.name,
          description: gov.description,
          coverImage: gov.image_url || undefined,
          imageUrls: gov.gallery_urls || [],
        }));

        setGovernorates(mappedGovernorates);
      } catch (error) {
        console.error("حدث خطأ أثناء جلب المحافظات:", error);
        Swal.fire("خطأ", "فشل في تحميل المحافظات", "error");
      }
    };

    fetchGovernorates();
  }, []);

  const readFilesAsDataURLs = (files: FileList | File[]): Promise<string[]> => {
    return Promise.all(
      Array.from(files).map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    );
  };

  const handleAdd = () => {
    Swal.fire({
      title: "إضافة محافظة",
      html: `
        <input id="governorate-name" class="swal2-input" placeholder="اسم المحافظة">
        <textarea id="governorate-description" class="swal2-textarea" placeholder="تفاصيل المحافظة"></textarea>
        <div style="text-align: right; margin: 10px 0;">
          <label style="font-weight: bold;">صورة الغلاف:</label><br>
          <input type="file" id="governorate-cover-image" accept="image/*" class="swal2-file">
        </div>
        <div style="text-align: right; margin: 10px 0;">
          <label style="font-weight: bold;">صور إضافية:</label><br>
          <input type="file" id="governorate-images" multiple accept="image/*" class="swal2-file">
        </div>
      `,
      confirmButtonText: "إضافة",
      showCancelButton: true,
      cancelButtonText: "إلغاء",
      preConfirm: () => {
        const name = (document.getElementById("governorate-name") as HTMLInputElement).value;
        const description = (document.getElementById("governorate-description") as HTMLTextAreaElement).value;
        const coverFile = (document.getElementById("governorate-cover-image") as HTMLInputElement).files?.[0];
        const files = (document.getElementById("governorate-images") as HTMLInputElement).files;

        if (!name || !description || !coverFile || !files || files.length === 0) {
          Swal.showValidationMessage("يرجى تعبئة جميع الحقول وتحميل صورة غلاف وصورة/صور");
          return;
        }

        return { name, description, coverFile, files };
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("خطأ", "يرجى تسجيل الدخول أولاً", "error");
          return;
        }

        const { name, description, coverFile, files } = result.value;
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("image", coverFile);

        Array.from(files as FileList).forEach((file: File) => {
          formData.append("gallery[]", file);
        });

        try {
          const response = await axios.post(
            `${url}/api/storeGovernorate`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const newGovFromApi = response.data.data;

          const newGovernorate: Governorate = {
            id: newGovFromApi.id,
            name: newGovFromApi.name,
            description: newGovFromApi.description,
            coverImage: `${url}/storage/${newGovFromApi.image}`,
            imageUrls: newGovFromApi.gallery.map(
              (img: string) => `${url}/storage/${img}`
            ),
          };

          setGovernorates((prev) => [...prev, newGovernorate]);
          Swal.fire("!تمت الإضافة", ".تمت إضافة المحافظة بنجاح", "success");
        } catch (error: any) {
          Swal.fire("خطأ", error.response?.data?.message || "فشل في إرسال البيانات", "error");
        }
      }
    });
  };
////////////////
  const handleEdit = (gov: Governorate) => {
    Swal.fire({
      title: "تعديل المحافظة",
      html: `
        <input id="governorate-name" class="swal2-input" value="${gov.name}" placeholder="اسم المحافظة">
        <textarea id="governorate-description" class="swal2-textarea" placeholder="تفاصيل المحافظة">${gov.description}</textarea>
        <div style="text-align: right; margin: 10px 0;">
          <label style="font-weight: bold;">تغيير صورة الغلاف:</label><br>
          <input type="file" id="governorate-cover-image" accept="image/*" class="swal2-file">
        </div>
        <div style="text-align: right; margin: 10px 0;">
          <label style="font-weight: bold;">إضافة صور جديدة:</label><br>
          <input type="file" id="governorate-images" multiple accept="image/*" class="swal2-file">
        </div>
      `,
      confirmButtonText: "حفظ",
      showCancelButton: true,
      cancelButtonText: "إلغاء",
      preConfirm: async () => {
        const name = (document.getElementById("governorate-name") as HTMLInputElement).value;
        const description = (document.getElementById("governorate-description") as HTMLTextAreaElement).value;
        const coverFile = (document.getElementById("governorate-cover-image") as HTMLInputElement).files?.[0];
        const files = (document.getElementById("governorate-images") as HTMLInputElement).files;
  
        if (!name || !description) {
          Swal.showValidationMessage("يرجى تعبئة الاسم والتفاصيل");
          return;
        }
  
        return { name, description, coverFile, files };
      }
    }).then(async (result) => {
      if (!result.isConfirmed || !result.value) return;
  
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("خطأ", "يرجى تسجيل الدخول أولاً", "error");
        return;
      }
  
      const { name, description, coverFile, files } = result.value;
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
  
      if (coverFile) {
        formData.append("image", coverFile);
      }
  
      if (files && files.length > 0) {
        Array.from(files as FileList).forEach((file: File) => {
          formData.append("gallery[]", file);
        });
      }
  
      try {
        const response = await axios.post(`${url}/api/updateGovernorate/${gov.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
  
        const updatedGov = response.data.data;
  
        const updatedGovernorate: Governorate = {
          id: updatedGov.id,
          name: updatedGov.name,
          description: updatedGov.description,
          coverImage: `${url}/storage/${updatedGov.image}`,
          imageUrls: updatedGov.gallery.map((img: string) => `${url}/storage/${img}`),
        };
  
        setGovernorates((prev) =>
          prev.map((g) => (g.id === gov.id ? updatedGovernorate : g))
        );
  
        Swal.fire("تم التحديث", "تم تعديل المحافظة بنجاح", "success");
      } catch (error: any) {
        console.error("فشل التعديل:", error);
        Swal.fire("خطأ", error.response?.data?.message || "فشل في تعديل المحافظة", "error");
      }
    });
  };
  

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire("خطأ", "يرجى تسجيل الدخول أولاً", "error");
      return;
    }

    const confirmed = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استعادة هذه المحافظة!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء",
    });

    if (confirmed.isConfirmed) {
      try {
        await axios.delete(`${url}/api/deleteGovernorate/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        setGovernorates((prev) => prev.filter((gov) => gov.id !== id));

        Swal.fire("تم الحذف!", "تم حذف المحافظة بنجاح", "success");
      } catch (error) {
        console.error("خطأ أثناء الحذف:", error);
        Swal.fire("خطأ", "فشل في حذف المحافظة", "error");
      }
    }
  };

  const handleDeleteImage = async (govId: number, imageUrl: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("خطأ", "يرجى تسجيل الدخول أولاً", "error");
      return;
    }
  
    const currentGov = governorates.find((g) => g.id === govId);
    if (!currentGov) {
      Swal.fire("خطأ", "تعذر العثور على المحافظة", "error");
      return;
    }
  
    // تحقق من عدد الصور قبل الحذف
    if (currentGov.imageUrls.length <= 1) {
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
        `${url}/api/deleteGalleryImage/${govId}`,
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
  
      setGovernorates((prev) =>
        prev.map((g) =>
          g.id === govId
            ? { ...g, imageUrls: g.imageUrls.filter((url) => url !== imageUrl) }
            : g
        )
      );
  
      Swal.fire("تم الحذف!", "تم حذف الصورة بنجاح", "success");
    } catch (error) {
      console.error("فشل في حذف الصورة:", error);
      Swal.fire("خطأ", "فشل في حذف الصورة من الخادم", "error");
    }
  };
  
    

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 shadow md:p-8" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">قائمة المحافظات</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded"
        >
          <FaPlus />
          إضافة محافظة
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {governorates.map((gov) => (
          <div key={gov.id} className="bg-white rounded shadow p-4">
            {gov.coverImage && (
              <img
                src={gov.coverImage}
                alt={`${gov.name}-cover`}
                className="w-48 h-32 object-cover rounded mb-2"
              />
            )}

{gov.imageUrls.length > 0 && (
  <div className="flex gap-2 overflow-x-auto max-w-full mb-2">
    {gov.imageUrls.map((url, i) => (
      <div key={i} className="relative group flex-shrink-0 w-48 h-32">
        <img
          src={url}
          alt={`${gov.name}-${i}`}
          className="w-full h-full object-cover rounded"
        />
        <button
          onClick={() => handleDeleteImage(gov.id, url)}
          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
        >
          <FaTrash />
        </button>
      </div>
    ))}
  </div>
)}


            <h2 className="text-xl font-bold mt-2">{gov.name}</h2>
            <p className="text-gray-700">{gov.description}</p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => handleEdit(gov)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDelete(gov.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}





 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 // "use client";

// import { useState } from "react";
// import Swal from "sweetalert2";
// import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

// interface Governorate {
//   id: number;
//   name: string;
//   description: string;
//   imageUrls: string[]; // صور متعددة
//   coverImage?: string; // صورة فردية (غلاف)
// }

// const initialGovernorates: Governorate[] = [
//   {
//     id: 1,
//     name: "محافظة دمشق",
//     description: "عاصمة سوريا وتتمتع بتاريخ عريق.",
//     imageUrls: ["/damas.jfif"],
//     coverImage: "/damas.jfif",
//   },
//   {
//     id: 2,
//     name: "محافظة حلب",
//     description: "تشتهر بقلعتها وأسواقها التقليدية.",
//     imageUrls: ["/damas.jfif", "/damas.jfif"],
//     coverImage: "/damas.jfif",
//   },
// ];

// export default function Governorates() {
//   const [governorates, setGovernorates] = useState<Governorate[]>(initialGovernorates);

//   const readFilesAsDataURLs = (files: FileList | File[]): Promise<string[]> => {
//     return Promise.all(
//       Array.from(files).map((file) => {
//         return new Promise<string>((resolve, reject) => {
//           const reader = new FileReader();
//           reader.onload = () => resolve(reader.result as string);
//           reader.onerror = reject;
//           reader.readAsDataURL(file);
//         });
//       })
//     );
//   };

//   const handleAdd = () => {
//     Swal.fire({
//       title: "إضافة محافظة",
//       html: `
//         <input id="governorate-name" class="swal2-input" placeholder="اسم المحافظة">
//         <textarea id="governorate-description" class="swal2-textarea" placeholder="تفاصيل المحافظة"></textarea>

//         <div style="text-align: right; margin: 10px 0;">
//           <label style="font-weight: bold;">صورة الغلاف:</label><br>
//           <input type="file" id="governorate-cover-image" accept="image/*" class="swal2-file">
//         </div>

//         <div style="text-align: right; margin: 10px 0;">
//           <label style="font-weight: bold;">صور إضافية:</label><br>
//           <input type="file" id="governorate-images" multiple accept="image/*" class="swal2-file">
//         </div>
//       `,
//       confirmButtonText: "إضافة",
//       showCancelButton: true,
//       cancelButtonText: "إلغاء",
//       preConfirm: () => {
//         const name = (document.getElementById("governorate-name") as HTMLInputElement).value;
//         const description = (document.getElementById("governorate-description") as HTMLTextAreaElement).value;
//         const coverFile = (document.getElementById("governorate-cover-image") as HTMLInputElement).files?.[0];
//         const files = (document.getElementById("governorate-images") as HTMLInputElement).files;

//         if (!name || !description || !coverFile || !files || files.length === 0) {
//           Swal.showValidationMessage("يرجى تعبئة جميع الحقول وتحميل صورة غلاف وصورة/صور");
//           return;
//         }

//         return Promise.all([
//           readFilesAsDataURLs([coverFile]),
//           readFilesAsDataURLs(files),
//         ]).then(([cover, images]) => ({
//           name,
//           description,
//           coverImage: cover[0],
//           imageUrls: images,
//         }));
//       },
//     }).then((result) => {
//       if (result.isConfirmed && result.value) {
//         const newGov: Governorate = {
//           id: Date.now(),
//           ...result.value,
//         };
//         setGovernorates((prev) => [...prev, newGov]);
//         Swal.fire("!تمت الإضافة", ".تمت إضافة المحافظة بنجاح", "success");
//       }
//     });
//   };

//   const handleEdit = (gov: Governorate) => {
//     Swal.fire({
//       title: "تعديل المحافظة",
//       html: `
//         <input id="governorate-name" class="swal2-input" value="${gov.name}" placeholder="اسم المحافظة">
//         <textarea id="governorate-description" class="swal2-textarea" placeholder="تفاصيل المحافظة">${gov.description}</textarea>

//         <div style="text-align: right; margin: 10px 0;">
//           <label style="font-weight: bold;">تغيير صورة الغلاف:</label><br>
//           <input type="file" id="governorate-cover-image" accept="image/*" class="swal2-file">
//         </div>

//         <div style="text-align: right; margin: 10px 0;">
//           <label style="font-weight: bold;">إضافة صور جديدة:</label><br>
//           <input type="file" id="governorate-images" multiple accept="image/*" class="swal2-file">
//         </div>
//       `,
//       confirmButtonText: "حفظ",
//       showCancelButton: true,
//       cancelButtonText: "إلغاء",
//       preConfirm: async () => {
//         const name = (document.getElementById("governorate-name") as HTMLInputElement).value;
//         const description = (document.getElementById("governorate-description") as HTMLTextAreaElement).value;
//         const coverFile = (document.getElementById("governorate-cover-image") as HTMLInputElement).files?.[0];
//         const files = (document.getElementById("governorate-images") as HTMLInputElement).files;

//         if (!name || !description) {
//           Swal.showValidationMessage("يرجى تعبئة الاسم والتفاصيل");
//           return;
//         }

//         const updates: Partial<Governorate> = { name, description };

//         if (coverFile) {
//           const [coverImage] = await readFilesAsDataURLs([coverFile]);
//           updates.coverImage = coverImage;
//         }

//         if (files && files.length > 0) {
//           const imageUrls = await readFilesAsDataURLs(files);
//           updates.imageUrls = [...gov.imageUrls, ...imageUrls];
//         } else {
//           updates.imageUrls = gov.imageUrls;
//         }

//         return updates;
//       },
//     }).then((result) => {
//       if (result.isConfirmed && result.value) {
//         setGovernorates((prev) =>
//           prev.map((g) => (g.id === gov.id ? { ...g, ...result.value } : g))
//         );
//         Swal.fire("!تم التحديث", ".تم تعديل بيانات المحافظة", "success");
//       }
//     });
//   };

//   const handleDelete = (id: number) => {
//     Swal.fire({
//       title: "هل أنت متأكد؟",
//       text: "!لن تتمكن من استعادة هذه المحافظة",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "نعم، احذفها",
//       cancelButtonText: "إلغاء",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setGovernorates((prev) => prev.filter((gov) => gov.id !== id));
//         Swal.fire("!تم الحذف", ".تم حذف المحافظة", "success");
//       }
//     });
//   };

//   const handleDeleteImage = (govId: number, imageIndex: number) => {
//     setGovernorates((prev) =>
//       prev.map((g) =>
//         g.id === govId
//           ? { ...g, imageUrls: g.imageUrls.filter((_, i) => i !== imageIndex) }
//           : g
//       )
//     );
//   };

//   return (
//     <div className="max-w-6xl mx-auto bg-gray-50 shadow md:p-8" dir="rtl">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">قائمة المحافظات</h1>
//         <button
//           onClick={handleAdd}
//           className="flex items-center gap-2 bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded"
//         >
//           <FaPlus />
//           إضافة محافظة
//         </button>
//       </div>

//       <div className="flex flex-col gap-8">
//   {governorates.map((gov) => (
//     <div key={gov.id} className="bg-white rounded shadow p-4">
//       {/* صورة الغلاف */}
//       {gov.coverImage && (
//         <img
//           src={gov.coverImage}
//           alt={`${gov.name}-cover`}
//           className="w-48 h-32 object-cover rounded mb-2"
//         />
//       )}

//       {/* الصور الإضافية */}
//       {gov.imageUrls.length > 0 && (
//         <div className="flex gap-2 overflow-x-auto max-w-full mb-2">
//           {gov.imageUrls.map((url, i) => (
//             <div key={i} className="relative group flex-shrink-0 w-48 h-32">
//               <img
//                 src={url}
//                 alt={`${gov.name}-${i}`}
//                 className="w-full h-full object-cover rounded"
//               />
//               <button
//                 onClick={() => handleDeleteImage(gov.id, i)}
//                 className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
//               >
//                 <FaTrash />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* اسم المحافظة أسفل الصور */}
//       <h2 className="text-xl font-bold mt-2">{gov.name}</h2>

//       {/* وصف المحافظة */}
//       <p className="text-gray-700">{gov.description}</p>

//       {/* أزرار التحكم */}
//       <div className="flex justify-end gap-2 mt-4">
//         <button
//           onClick={() => handleEdit(gov)}
//           className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
//         >
//           <FaEdit />
//         </button>
//         <button
//           onClick={() => handleDelete(gov.id)}
//           className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
//         >
//           <FaTrash />
//         </button>
//       </div>
//     </div>
//   ))}
// </div>


//     </div>
//   );
// }




