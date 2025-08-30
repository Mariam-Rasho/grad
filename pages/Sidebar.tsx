"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import url from '../components/url'
interface SidebarProps {
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ setActiveTab, isOpen, onClose }: SidebarProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // جلب دور المستخدم من localStorage
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setUserRole(parsed.role || "employee");
    }
  }, []);

  // جلب عدد الطلبات المعلقة عند التحميل
  const fetchPendingCount = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${url}/api/Pending`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const count = data?.data?.filter((o: any) => o.status === "pending")?.length || 0;
        setPendingCount(count);
      })
      .catch((err) => console.error("Error fetching pending count:", err));
  };

  useEffect(() => {
    fetchPendingCount();

    // الاستماع لحدث تحديث العدادات من صفحة الحجوزات
    const handler = () => fetchPendingCount();
    window.addEventListener("updatePending", handler);
    return () => window.removeEventListener("updatePending", handler);
  }, []);

  return (
    <aside
      className={`
        fixed top-0 right-0 w-64 bg-gray-800 text-white shadow-lg z-40 h-screen p-4 overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${!isOpen ? "translate-x-full md:translate-x-0" : "translate-x-0"}
      `}
    >
      {/* زر إغلاق في الشاشات الصغيرة */}
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 left-4 text-white bg-red-600 px-2 py-1 rounded"
      >
        إغلاق
      </button>

      <h2 className="text-2xl font-bold mb-8 text-right">القائمة</h2>

      <nav className="flex flex-col gap-2 text-right">
        {userRole === "admin" && (
          <button
            onClick={() => setActiveTab("employees")}
            className="hover:bg-gray-700 p-2 rounded text-right"
          >
            الموظفين
          </button>
        )}
        <button
          onClick={() => setActiveTab("users")}
          className="hover:bg-gray-700 p-2 rounded text-right"
        >
          المستخدمين
        </button>
        <button
          onClick={() => setActiveTab("locations")}
          className="hover:bg-gray-700 p-2 rounded text-right"
        >
          المواقع السياحية
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className="hover:bg-gray-700 p-2 rounded text-right"
        >
          الرحلات الجماعية
        </button>
        <button
          onClick={() => setActiveTab("governorates")}
          className="hover:bg-gray-700 p-2 rounded text-right"
        >
          المحافظات
        </button>
        <button
          onClick={() => setActiveTab("activities")}
          className="hover:bg-gray-700 p-2 rounded text-right"
        >
          النشاطات
        </button>
        <button
          onClick={() => setActiveTab("challenges")}
          className="hover:bg-gray-700 p-2 rounded text-right"
        >
          التحديات
        </button>
        <button
          onClick={() => setActiveTab("suggestions")}
          className="hover:bg-gray-700 p-2 rounded text-right"
        >
          الاقتراحات
        </button>
        <button
          onClick={() => setActiveTab("restaurants")}
          className="hover:bg-gray-700 p-2 rounded text-right"
        >
          المطاعم
        </button>
        <button
          onClick={() => setActiveTab("hotels")}
          className="hover:bg-gray-700 p-2 rounded text-right"
        >
          الفنادق
        </button>
        <button
        
          onClick={() => setActiveTab("reservations")}
          className="relative hover:bg-gray-700 p-2 rounded text-right flex justify-between items-center"
        >
          
          {/* البادج يظهر فقط إذا العدد أكبر من صفر */}
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full text-left ">
              {pendingCount}
            </span>
          )} الحجوزات
        </button>
        <button
          onClick={() => setActiveTab("statistics")}
          className="hover:bg-gray-700 p-2 rounded text-right"
        >
          الإحصاءات
        </button>
        <button
          onClick={() => setActiveTab("account")}
          className="hover:bg-gray-700 p-2 rounded text-right"
        >
          معلومات الحساب
        </button>

        {/* زر تسجيل الخروج */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          className="hover:bg-gray-700 p-2 rounded text-right"
        >
          تسجيل الخروج
        </button>
      </nav>
    </aside>
  );
}










// // components/Sidebar.tsx
// "use client";
// import Link from "next/link";




// interface SidebarProps {
//   setActiveTab: (tab: string) => void;
//   isOpen?: boolean;
//   onClose?: () => void;
// }

// export default function Sidebar({ setActiveTab, isOpen = true, onClose }: SidebarProps) {
//   return (
//     <aside
//       className={`
//         fixed top-0 right-0 w-64 bg-gray-800 text-white shadow-lg z-40 h-screen p-4 overflow-y-auto
//         transform transition-transform duration-300 ease-in-out
//         ${!isOpen ? "translate-x-full md:translate-x-0" : "translate-x-0"}
//       `}
//     >
//       {/* زر إغلاق في الموبايل */}
//       {onClose && (
//         <button
//           onClick={onClose}
//           className="md:hidden absolute top-4 left-4 text-white bg-red-600 px-2 py-1 rounded"
//         >
//           إغلاق
//         </button>
//       )}
//   <h2 className="text-2xl font-bold mb-8 text-right">القائمة</h2>
//   <nav className="flex flex-col ">

//     <button onClick={() => setActiveTab("employees")} 
//     className="hover:bg-gray-700 p-2 rounded text-right">الموظفين</button>

//     <button onClick={() => setActiveTab("users")} 
//     className="hover:bg-gray-700 p-2 rounded text-right">المستخدمين</button>

//     <button onClick={() => setActiveTab("locations")} 
//     className="hover:bg-gray-700 p-2 rounded text-right">المواقع السياحية</button>

    

//     {/* <Link href="/group" className="hover:bg-gray-700 p-2 rounded text-right"> الرحلات الجماعية</Link> */}
//     <button onClick={() => setActiveTab("groups")} 
//     className="hover:bg-gray-700 p-2 rounded text-right">الرحلات الجماعية</button>


//     <button onClick={() => setActiveTab("governorates")} 
//     className="hover:bg-gray-700 p-2 rounded text-right">المحافظات</button>

//     {/* <Link href="/activities" className="hover:bg-gray-700 p-2 rounded text-right"> النشاطات</Link> */}
//     <button onClick={() => setActiveTab("activities")} 
//     className="hover:bg-gray-700 p-2 rounded text-right">النشاطات</button>

// <button onClick={() => setActiveTab("attachments")} 
//     className="hover:bg-gray-700 p-2 rounded text-right">المرفقات</button>

//     {/* <Link href="/challenges" className="hover:bg-gray-700 p-2 rounded text-right"> التحديات</Link> */}
//     <button onClick={() => setActiveTab("challenges")} 
//     className="hover:bg-gray-700 p-2 rounded text-right">التحديات</button>


//     {/* <Link href="/suggestions" className="hover:bg-gray-700 p-2 rounded text-right"> الاقتراحات</Link> */}
//     <button onClick={() => setActiveTab("suggestions")} 
//     className="hover:bg-gray-700 p-2 rounded text-right">الاقتراحات</button>



//     <Link href="/orders" className="hover:bg-gray-700 p-2 rounded text-right">الحجوزات</Link>
//     {/* <Link href="/points" className="hover:bg-gray-700 p-2 rounded text-right">سياسة النقاط</Link> */}
//     <Link href="/statistics" className="hover:bg-gray-700 p-2 rounded text-right">الاحصاءات</Link>
//     <Link href="/perm" className="hover:bg-gray-700 p-2 rounded text-right">الصلاحيات</Link>


//     {/* <Link href="/account" className="hover:bg-gray-700 p-2 rounded text-right">معلومات الحساب</Link> */}
//     <button onClick={() => setActiveTab("account")} 
//     className="hover:bg-gray-700 p-2 rounded text-right">معلومات الحساب</button>
//   </nav>
// </aside>
//  ); 
//  }

// //  overflow-y-auto  و gap-1 2 4


// {/* // "use client";

// // import Link from "next/link";

// // interface SidebarProps {
// //   setActiveTab: (tab: string) => void;
// // }
// // export default function Sidebar({ setActiveTab }: SidebarProps) {
// //   return (
// //     <aside className="h-screen w-64 bg-gray-800 te  xt-white fixed left-0 top-0 flex flex-col p-4">
// //       <h2 className="text-2xl font-bold mb-8">القائمة</h2>
// //       <nav className="flex flex-col gap-4">
// //         <button
// //           onClick={() => setActiveTab("users")}
// //           className="hover:bg-gray-700 p-2 rounded text-right"
// //         >
// //           عرض المستخدمين
// //         </button>

// //         {/* يمكنك إضافة روابط أخرى هنا مثل الموظفين، المواقع السياحية... الخ */}
// //       </nav>
// //     </aside>
// //   );
// // } */}