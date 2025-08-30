
// // components/UserList.tsx
// "use client";

// import { useState } from "react";
// import Swal from "sweetalert2";

// interface User {
//   id: number;
//   name: string;
//   email: string;
//   isBanned: boolean;
//   phone: string;
//   address: string;
//   nationalId: string;
//   pointNumber:number;
//   idImageUrl: string;

// }

// const initialUsers: User[] = [
//   {
//     id: 1,
//     name: "أحمد محمد",
//     email: "ahmed@example.com",
//     isBanned: false,
//     phone: "0599999999",
//     address: "الرياض، المملكة العربية السعودية",
//     nationalId: "1234567890",
//     pointNumber: 2,
//     idImageUrl: "https://via.placeholder.com/150", // رابط وهمي لصورة الهوية
//   },
//   {
//     id: 2,
//     name: "سارة علي",
//     email: "sara@example.com",
//     isBanned: false,
//     phone: "0588888888",
//     address: "جدة، المملكة العربية السعودية",
//     nationalId: "0987654321",
//     pointNumber: 0,
//     idImageUrl: "https://via.placeholder.com/150",
//   },
//   {
//     id: 3,
//     name: "خالد يوسف",
//     email: "khaled@example.com",
//     isBanned: false,
//     phone: "0577777777",
//     address: "الدمام، المملكة العربية السعودية",
//     nationalId: "5678901234",
//     pointNumber: 3,
//     idImageUrl: "https://via.placeholder.com/150",
//   },
// ];

// export default function UserList() {
//   const [users, setUsers] = useState(initialUsers);
//   const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

//   const handleToggleBan = async (id: number, currentStatus: boolean) => {
//     if (!currentStatus) {
//       const result = await Swal.fire({
//         title: "تأكيد الحظر",
//         text: "هل أنت متأكد أنك تريد حظر هذا المستخدم؟",
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonColor: "#d33",
//         cancelButtonColor: "#3085d6",
//         confirmButtonText: "نعم، احظره",
//         cancelButtonText: "إلغاء"
//       });

//       if (!result.isConfirmed) return;
//     }

//     setUsers(prev =>
//       prev.map(user =>
//         user.id === id ? { ...user, isBanned: !user.isBanned } : user
//       )
//     );

//     Swal.fire({
//       title: !currentStatus ? "!تم الحظر" : "!تم إلغاء الحظر",
//       text: !currentStatus ? ".تم حظر المستخدم بنجاح" : ".تم إلغاء الحظر بنجاح",
//       icon: "success",
//       timer: 2000,
//       showConfirmButton: false,
//       position: "center",
//       width: "400px",
//       padding: "1.5rem",
//     });
//   };

//   const handleSelectUser = (id: number) => {
//     setSelectedUserId(prevId => (prevId === id ? null : id));
//   };

//   return (
//     <div className="max-w-6xl mx-auto bg-gray-50 shadow md:p-8" >
//       <h1 className="text-3xl font-bold mb-6 text-right">قائمة المستخدمين</h1>
//       <ul className="flex flex-col gap-4 text-right">
//         {users.map(user => (
//           <li key={user.id} className="flex flex-col items-end">

//           <div className="w-full bg-gray-100 p-4 rounded hover:bg-gray-200 flex flex-col gap-2">
//             <div className="flex flex-row-reverse justify-between items-center cursor-pointer"
//             onClick={() => {
//               if (selectedUserId === user.id) {
//                 setSelectedUserId(null);
//               } else {
//                 setSelectedUserId(user.id);
                     
//               }
//             }}
//             >

//               <button
//                 onClick={() => handleSelectUser(user.id)}
//                 className={`text-lg ${user.isBanned ? "text-gray-400" : "text-black"} hover:underline font-semibold cursor-pointer`}
//               >
//                 {user.name}
//               </button>
//               <button
//                 onClick={() => handleToggleBan(user.id, user.isBanned)}
//                 className={`py-1 px-4 rounded ${
//                   user.isBanned
//                     ? "bg-green-500 hover:bg-green-700 text-white"
//                     : "bg-red-500 hover:bg-red-700 text-white"
//                 }`}
//               >
//                 {user.isBanned ? "إلغاء الحظر" : "حظر"}
//               </button>
//             </div>
        
//             {selectedUserId === user.id && (
//               <div className="bg-gray-100 rounded-lg shadow-md p-4 text-right w-full animate-fade-in space-y-2">
//                 <p> {user.email} <strong> :البريد الإلكتروني</strong></p>
//                 <p><strong>رقم الهاتف:</strong> {user.phone}</p>
//                 <p><strong>العنوان:</strong> {user.address}</p>
//                 <p><strong>الرقم الوطني:</strong> {user.nationalId}</p>
//                 <p><strong>عدد النقاط :</strong> {user.pointNumber}</p>
//                 <div>
//                   <p className="font-semibold">:صورة الهوية</p>
//                   <img
//                     src={user.idImageUrl}
//                     alt="صورة الهوية"
//                     className="w-40 h-auto mt-1 rounded border shadow"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
//         </li>
        
//         ))}
//       </ul>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import url from '../components/url'

interface User {
  id: number;
  name: string;
  email: string;
  isBanned: boolean;
  phone: string;
  address: string;
  nationalId: string;
  pointNumber: number;
  idImageUrl: string;
  isWinner: boolean

}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // 🟢 جلب المستخدمين عند تحميل الصفحة
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire("خطأ", "الرجاء تسجيل الدخول أولاً.", "error");
      return;
    }

    axios.get(`${url}/api/getAllUser`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      const rawUsers = res.data.users?.original?.data;
      if (!Array.isArray(rawUsers)) {
        console.error("rawUsers ليست مصفوفة:", rawUsers);
        Swal.fire("خطأ", "بيانات المستخدمين غير صحيحة", "error");
        return;
      }

      const formattedUsers = rawUsers.map(user => ({
        id: user.id,
        name: user.FirstName,
        email: user.Email,
        isBanned: user.Block === 1,
        phone: user.Number,
        address: user.Address,
        nationalId: user.Nationalnumber,
        pointNumber: 0,
        idImageUrl: user.photo_url || "https://via.placeholder.com/150",
        isWinner: user.is_winner === true, // ✅ أضف هذا
      }));
      
      setUsers(formattedUsers);
    })
    .catch((err) => {
      console.error("فشل في تحميل المستخدمين:", err);
      Swal.fire("خطأ", "فشل في تحميل المستخدمين من الخادم", "error");
    });
  }, []);

  // 🔒 حظر أو فك الحظر
  const handleToggleBan = async (id: number, currentStatus: boolean) => {
    const action = currentStatus ? "unblock" : "block";
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire("خطأ", "الرجاء تسجيل الدخول أولاً.", "error");
      return;
    }

    const confirmText = currentStatus
      ? "هل أنت متأكد أنك تريد فك الحظر عن هذا المستخدم؟"
      : "هل أنت متأكد أنك تريد حظر هذا المستخدم؟";

    const result = await Swal.fire({
      title: currentStatus ? "تأكيد فك الحظر" : "تأكيد الحظر",
      text: confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: currentStatus ? "#3085d6" : "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: currentStatus ? "نعم، فك الحظر" : "نعم، احظره",
      cancelButtonText: "إلغاء"
    });

    if (!result.isConfirmed) return;

    try {
      await axios.post(`${url}/api/${action}User/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(prev =>
        prev.map(user =>
          user.id === id ? { ...user, isBanned: !user.isBanned } : user
        )
      );

      Swal.fire({
        title: currentStatus ? "!تم فك الحظر" : "!تم الحظر",
        text: currentStatus
          ? ".تم فك الحظر عن المستخدم بنجاح"
          : ".تم حظر المستخدم بنجاح",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        position: "center",
        width: "400px",
        padding: "1.5rem",
      });
    } catch (error) {
      console.error("فشل في تنفيذ العملية:", error);
      Swal.fire("خطأ", "حدث خطأ أثناء تنفيذ العملية", "error");
    }
  };

  const handleSelectUser = (id: number) => {
    setSelectedUserId(prevId => (prevId === id ? null : id));
  };

  return (
    
    <div  className="max-w-6xl mx-auto bg-gray-50 shadow md:p-8 ">
      <h1 className="text-3xl font-bold mb-6 text-right">قائمة المستخدمين</h1>
      <ul className="flex flex-col gap-4 text-right">
        {users.map(user => (
          <li key={user.id} className="flex flex-col items-end">
            <div className="w-full bg-gray-100 p-4 rounded hover:bg-gray-200 flex flex-col gap-2">
              <div
                className="flex flex-row-reverse justify-between items-center cursor-pointer"
                onClick={() => handleSelectUser(user.id)}
              >
                <button
                  className={`text-lg ${user.isBanned ? "text-gray-400" : "text-black"} hover:underline font-semibold`}
                >
                  <span className="flex items-center gap-2">
                 {user.isWinner && (
                 <span title="فائز بتحدي" className="text-yellow-500 text-xl">🏆</span>
                )}
                  {user.name}
                  </span>

                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // حتى لا يتم فتح تفاصيل المستخدم عند الضغط على زر الحظر
                    handleToggleBan(user.id, user.isBanned);
                  }}
                  className={`py-1 px-4 rounded ${
                    user.isBanned
                      ? "bg-green-500 hover:bg-green-700 text-white"
                      : "bg-red-500 hover:bg-red-700 text-white"
                  }`}
                >
                  {user.isBanned ? "إلغاء الحظر" : "حظر"}
                </button>
              </div>

              {selectedUserId === user.id && (
                <div className="bg-gray-100 rounded-lg shadow-md p-4 text-right w-full animate-fade-in space-y-2">
                  <p>{user.email} <strong>:البريد الإلكتروني</strong></p>
                  <p><strong>رقم الهاتف:</strong> {user.phone}</p>
                  <p><strong>العنوان:</strong> {user.address}</p>
                  <p><strong>الرقم الوطني:</strong> {user.nationalId}</p>
                  <p><strong>عدد النقاط :</strong> {user.pointNumber}</p>
                  <div>
                    <p className="font-semibold">:صورة الهوية</p>
                    <img
                      src={user.idImageUrl}
                      alt="صورة الهوية"
                      className="w-40 h-auto mt-1 rounded border shadow"
                    />
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
