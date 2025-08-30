"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { FaUserPlus, FaTrash, FaEdit } from "react-icons/fa";
import url from '../components/url'

interface Employee {
  id: number;
  name: string;
  email: string;
  password: string;
  permissions?: string[];
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [permissionsVisibleId, setPermissionsVisibleId] = useState<number | null>(null);
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const allPermissions = ["عرض", "تعديل", "حذف", "إنشاء"];

  useEffect(() => {
    const
     fetchEmployees = async () => {
      try {
        const response = await axios.get(`${url}/api/showAllEmployee`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        setEmployees(response.data.data);
      } catch (error) {
        console.error("فشل في جلب الموظفين:", error);
        Swal.fire("خطأ", "حدث خطأ أثناء جلب الموظفين", "error");
      }
    };
    fetchEmployees();
  }, []);

  const handleAddEmployee = async () => {
    const { value: formValues } = await Swal.fire({
      title: "إضافة موظف جديد",
      html:
        '<input id="name" class="swal2-input" placeholder="الاسم">' +
        '<input id="email" class="swal2-input" placeholder="البريد الإلكتروني">' +
        '<input id="password" class="swal2-input" placeholder="كلمة السر">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "إضافة",
      preConfirm: () => {
        const name = (document.getElementById("name") as HTMLInputElement).value;
        const email = (document.getElementById("email") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;
        if (!name || !email || !password) {
          Swal.showValidationMessage("الرجاء ملء جميع الحقول");
          return;
        }
        return { name, email, password };
      },
    });

    if (formValues) {
      try {
        const response = await axios.post(
          `${url}/api/addEmployee`,
          formValues,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        setEmployees(prev => [...prev, response.data.data]);
        Swal.fire("تم", "تمت إضافة الموظف بنجاح", "success");
      } catch (error) {
        console.error("فشل في إضافة الموظف:", error);
        Swal.fire("خطأ", "حدث خطأ أثناء إضافة الموظف", "error");
      }
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    const confirm = await Swal.fire({
      title: "تأكيد الحذف",
      text: "هل تريد بالتأكيد حذف هذا الموظف؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذفه",
      cancelButtonText: "إلغاء",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${url}/api/deleteEmployee/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        Swal.fire("تم الحذف!", "تم حذف الموظف.", "success");
      } catch (error) {
        console.error("فشل في حذف الموظف:", error);
        Swal.fire("خطأ", "حدث خطأ أثناء حذف الموظف", "error");
      }
    }
  };

  const handleEditEmployee = async (employee: Employee) => {
    const { value: formValues } = await Swal.fire({
      title: "تعديل بيانات الموظف",
      html:
        `<input id="name" class="swal2-input" value="${employee.name}" placeholder="الاسم">` +
        `<input id="email" class="swal2-input" value="${employee.email}" placeholder="البريد الإلكتروني">` +
        `<input id="password" class="swal2-input" placeholder="كلمة السر الجديدة (اختياري)">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "حفظ",
      preConfirm: () => {
        const name = (document.getElementById("name") as HTMLInputElement).value;
        const email = (document.getElementById("email") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;
  
        if (!name || !email) {
          Swal.showValidationMessage("الرجاء ملء الاسم والبريد الإلكتروني");
          return;
        }
  
        return { name, email, password };
      },
    });
  
    if (formValues) {
      const payload: any = {
        name: formValues.name,
        email: formValues.email,
      };
  
      // أرسل كلمة السر فقط إذا كانت مملوءة
      if (formValues.password) {
        payload.password = formValues.password;
      }
  
      try {
        const response = await axios.put(
          `${url}/api/updateEmployee/${employee.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
  
        setEmployees(prev =>
          prev.map(emp =>
            emp.id === employee.id ? { ...emp, ...payload } : emp
          )
        );
  
        Swal.fire("تم", "تم تعديل بيانات الموظف بنجاح", "success");
      } catch (error) {
        console.error("فشل في تعديل الموظف:", error);
        Swal.fire("خطأ", "حدث خطأ أثناء تعديل الموظف", "error");
      }
    }
  };
  

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 shadow md:p-8" dir="rtl">
      <div className="relative mb-6">
        <button
          onClick={handleAddEmployee}
          className="absolute top-0 left-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded"
        >
          <FaUserPlus />
          إضافة موظف
        </button>
        <h1 className="text-3xl font-bold text-right">قائمة الموظفين</h1>
      </div>

      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {employees.map(emp => (
          <div key={emp.id} className="bg-gray-100 p-4 rounded-lg flex flex-col gap-3 shadow-md">
            <div className="flex flex-row justify-between items-center cursor-pointer">
              <div className="text-right">
                <h2 className="text-xl font-semibold mb-2">{emp.name}</h2>
                <p className="text-sm">{emp.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditEmployee(emp)}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white p-2 rounded"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteEmployee(emp.id)}
                  className="bg-red-600 hover:bg-red-800 text-white p-2 rounded"
                >
                  <FaTrash />
                </button>
              </div>
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
// import { FaUserPlus, FaTrash, FaEdit } from "react-icons/fa";

// interface Employee {
//   id: number;
//   name: string;
//   email: string;
//   password: number;
//   permissions: string[];
// }

// const initialEmployees: Employee[] = [
//   { id: 1, name: "خالد عبد الله", email: "khaled@example.com", password: 12345, permissions: ["عرض", "تعديل"] },
//   { id: 2, name: "منى العلي", email: "mona@example.com", password: 1234567, permissions: ["عرض"] },
// ];

// const allPermissions = ["عرض", "تعديل", "حذف", "إنشاء"];

// export default function Employees() {
//   const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
//   const [permissionsVisibleId, setPermissionsVisibleId] = useState<number | null>(null);
//   const [tempPermissions, setTempPermissions] = useState<string[]>([]);

//   const handleAddEmployee = () => {
//     Swal.fire({
//       title: "إضافة موظف جديد",
//       html: `
//         <input id="name" class="swal2-input" placeholder="الاسم">
//         <input id="email" class="swal2-input" placeholder="البريد الإلكتروني">
//         <input id="password" class="swal2-input" placeholder="كلمة السر">
//       `,
//       showCancelButton: true,
//       confirmButtonText: "إضافة",
//       cancelButtonText: "إلغاء",
//       preConfirm: () => {
//         const name = (document.getElementById("name") as HTMLInputElement).value;
//         const email = (document.getElementById("email") as HTMLInputElement).value;
//         const password = (document.getElementById("password") as HTMLInputElement).value;
//         if (!name || !email || !password) {
//           Swal.showValidationMessage("الرجاء ملء جميع الحقول");
//           return;
//         }
//         return { name, email, password };
//       }
//     }).then(result => {
//       if (result.isConfirmed && result.value) {
//         const newEmployee: Employee = {
//           id: Date.now(),
//           name: result.value.name,
//           email: result.value.email,
//           password: result.value.password,
//           permissions: [],
//         };
//         setEmployees(prev => [...prev, newEmployee]);
//         Swal.fire("!تمت الإضافة", "تم إضافة الموظف بنجاح", "success");
//       }
//     });
//   };

//   const handleDeleteEmployee = (id: number) => {
//     Swal.fire({
//       title: "تأكيد الحذف",
//       text: "هل تريد بالتأكيد حذف هذا الموظف؟",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "نعم، احذفه",
//       cancelButtonText: "إلغاء",
//     }).then(result => {
//       if (result.isConfirmed) {
//         setEmployees(prev => prev.filter(emp => emp.id !== id));
//         if (selectedEmployeeId === id) setSelectedEmployeeId(null);
//         if (permissionsVisibleId === id) setPermissionsVisibleId(null);
//         Swal.fire("تم الحذف!", "تم حذف الموظف.", "success");
//       }
//     });
//   };

//   const handleEditEmployee = (employee: Employee) => {
//     Swal.fire({
//       title: "تعديل بيانات الموظف",
//       html: `
//         <input id="name" class="swal2-input" value="${employee.name}" placeholder="الاسم">
//         <input id="email" class="swal2-input" value="${employee.email}" placeholder="البريد الإلكتروني">
//         <input id="password" class="swal2-input" value="${employee.password}" placeholder="كلمة السر">
//       `,
//       showCancelButton: true,
//       confirmButtonText: "حفظ",
//       cancelButtonText: "إلغاء",
//       preConfirm: () => {
//         const name = (document.getElementById("name") as HTMLInputElement).value;
//         const email = (document.getElementById("email") as HTMLInputElement).value;
//         const password = (document.getElementById("password") as HTMLInputElement).value;
//         if (!name || !email || !password) {
//           Swal.showValidationMessage("الرجاء ملء جميع الحقول");
//           return;
//         }
//         return { name, email, password };
//       }
//     }).then(result => {
//       if (result.isConfirmed && result.value) {
//         setEmployees(prev =>
//           prev.map(emp =>
//             emp.id === employee.id
//               ? {
//                   ...emp,
//                   name: result.value.name,
//                   email: result.value.email,
//                   password: result.value.password,
//                 }
//               : emp
//           )
//         );
//         Swal.fire("تم التحديث!", "تم تعديل بيانات الموظف.", "success");
//       }
//     });
//   };

//   return (
//     <div className=" max-w-6xl mx-auto bg-gray-50 shadow md:p-8" dir="rtl" >
//       <div className="relative mb-6">
//         <button
//           onClick={handleAddEmployee}
//           className="absolute top-0 left-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded"
//         >
//           <FaUserPlus />
//           إضافة موظف
//         </button>
//         <h1 className="text-3xl font-bold text-right">قائمة الموظفين</h1>
//       </div>

//       <div className="flex flex-col gap-6 max-w-4xl mx-auto">
//         {employees.map(emp => (
//           <div key={emp.id} className="bg-gray-100 p-4 rounded-lg flex flex-col gap-3 shadow-md">
//             <div className="flex flex-row justify-between items-center cursor-pointer"
//               onClick={() => {
//                 if (selectedEmployeeId === emp.id) {
//                   setSelectedEmployeeId(null);
//                   setPermissionsVisibleId(null);
//                 } else {
//                   setSelectedEmployeeId(emp.id);
//                   setPermissionsVisibleId(null);
//                 }
//               }}
//             >
//               <div className="text-right">
//                 <h2 className="text-xl font-semibold mb-2">{emp.name}</h2>
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     if (permissionsVisibleId === emp.id) {
//                       setPermissionsVisibleId(null);
//                     } else {
//                       setPermissionsVisibleId(emp.id);
//                       setTempPermissions(emp.permissions);
//                     }
//                   }}
//                   className="bg-purple-600 hover:bg-purple-800 text-white p-2 rounded text-sm"
//                 >
//                   صلاحيات
//                 </button>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleEditEmployee(emp);
//                   }}
//                   className="bg-yellow-500 hover:bg-yellow-700 text-white p-2 rounded"
//                 >
//                   <FaEdit />
//                 </button>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleDeleteEmployee(emp.id);
//                   }}
//                   className="bg-red-600 hover:bg-red-800 text-white p-2 rounded"
//                 >
//                   <FaTrash />
//                 </button>
//               </div>
//             </div>

//             {selectedEmployeeId === emp.id && (
//               <div className="bg-white rounded-lg shadow-md p-6 text-right mr-2 animate-fade-in">
//                 <p><strong>البريد الإلكتروني: </strong> {emp.email} </p>
//               </div>
//             )}

//             {permissionsVisibleId === emp.id && (
//               <div className="bg-white p-4 rounded-md mt-2 shadow text-right">
//                 <h3 className="font-semibold mb-2">الصلاحيات</h3>
//                 <div className="flex flex-col gap-2">
//                   {allPermissions.map(permission => (
//                     <label key={permission} className="flex flex-row-reverse items-center justify-end gap-2">
//                       <input
//                         type="checkbox"
//                         checked={tempPermissions.includes(permission)}
//                         onChange={() => {
//                           if (tempPermissions.includes(permission)) {
//                             setTempPermissions(tempPermissions.filter(p => p !== permission));
//                           } else {
//                             setTempPermissions([...tempPermissions, permission]);
//                           }
//                         }}
//                       />
//                       <span>{permission}</span>
//                     </label>
//                   ))}
//                 </div>
//                 <div className="mt-4 flex justify-end gap-2">
//                   <button
//                     className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
//                     onClick={() => setPermissionsVisibleId(null)} // إلغاء التعديل بدون حفظ
//                   >
//                     إلغاء
//                   </button>
//                   <button
//                     className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
//                     onClick={() => {
//                       setEmployees(prev =>
//                         prev.map(empItem =>
//                           empItem.id === emp.id ? { ...empItem, permissions: tempPermissions } : empItem
//                         )
//                       );
//                       setPermissionsVisibleId(null);
//                     }}
//                   >
//                     حفظ
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
