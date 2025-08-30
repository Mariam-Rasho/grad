"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import url from "../components/url";

type Attachment = {
  id: number;
  name: string;
  price: number;
};

type InvoiceData = {
  id: number;
  created_at: string;
  status: string;
  is_paid: number;
  user: {
    FirstName: string;
    Number: string;
    Address: string;
  };
  group_trip: {
    Destination_name: string;
    cost: number;
    discount_percentage: number;
    final_price: number;
  };
  number_of_people: number;
  trip_cost: string;
  total_cost: string;
  attachments: Attachment[];
};

const tabs = [
  { key: "pending", label: " الطلبات المعلقة", color: "bg-yellow-100" },
  { key: "accepted", label: " الطلبات المقبولة", color: "bg-green-100" },
  { key: "rejected", label: " الطلبات المرفوضة", color: "bg-red-100" },
  { key: "paid", label: " الطلبات المدفوعة", color: "bg-blue-100" },
];

export default function Reservation() {
  const [orders, setOrders] = useState<InvoiceData[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    let apiEndpoint = "";

    switch (activeTab) {
      case "pending":
        apiEndpoint = `${url}/api/Pending`;
        break;
      case "accepted":
        apiEndpoint = `${url}/api/Accepted`;
        break;
      case "rejected":
        apiEndpoint = `${url}/api/Rejected`;
        break;
      case "paid":
        apiEndpoint = `${url}/api/Paid`;
        break;
      default:
        apiEndpoint = `${url}/api/Pending`;
    }

    axios
      .get(apiEndpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        console.log("API response:", res.data);
        setOrders(res.data?.data || res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching data:", err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const handleAccept = (invoice: InvoiceData) => {
    axios
      .post(
        `${url}/api/accept/${invoice.id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      .then(() => {
        fetchOrders();
        window.dispatchEvent(new Event("updatePending")); // ✅ تحديث السايد بار
      })
      .catch((err) => console.error("Error accepting:", err));
  };
  
  const handleReject = (invoice: InvoiceData) => {
    axios
      .post(
        `${url}/api/reject/${invoice.id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      .then(() => {
        fetchOrders();
        window.dispatchEvent(new Event("updatePending")); // ✅ تحديث السايد بار
      })
      .catch((err) => console.error("Error rejecting:", err));
  };
  

  if (loading) {
    return <p className="text-center text-gray-500">⏳ جاري التحميل...</p>;
  }

  // ✅ عدد الطلبات المعلقة فقط
  const pendingCount = orders.filter((inv) => inv.status === "pending").length;

  return (
    <div className="max-w-6xl mx-auto bg-white-50  rounded-lg p-8 mt-4" dir="rtl">
      {/* Tabs */}
      <div className="flex justify-between gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 p-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? `${tab.color} border-2 border-blue-500 text-blue-900`
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {tab.label}
            {/* ✅ العداد يظهر فقط عند الطلبات المعلقة */}
            {tab.key === "pending" && pendingCount > 0 && (
              <span className="ml-1 text-sm text-red-800 font-bold">
                  ({pendingCount})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {orders.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-500"
            >
              لا توجد طلبات حالياً.
            </motion.p>
          ) : (
            orders.map((invoice) => {
              const discountTotal =
                Number(invoice.trip_cost) * invoice.number_of_people -
                invoice.group_trip.final_price * invoice.number_of_people;

              // ✅ اجمالي المرفقات
              const attachmentsTotal = invoice.attachments?.reduce(
                (sum, att) => sum + (att.price || 0),
                0
              ) || 0;

              // ✅ المجموع مع المرفقات
              const totalWithAttachments =
                Number(invoice.total_cost) + attachmentsTotal;

              return (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className=" rounded-lg p-4 bg-gray-50 shadow-sm"
                >
                  <h3 className="text-lg font-bold text-blue-800 mb-2">
                    🧾 فاتورة {invoice.id}
                  </h3>
                  <p>تاريخ الإنشاء: {new Date(invoice.created_at).toLocaleDateString()}</p>

                  <h4 className="font-semibold mt-3 text-green-700">👤 بيانات العميل</h4>
                  <p>الاسم: {invoice.user.FirstName}</p>
                  <p>رقم الهاتف: {invoice.user.Number}</p>
                  <p>العنوان: {invoice.user.Address}</p>

                  <h4 className="font-semibold mt-3 text-purple-700">🗺 بيانات الرحلة</h4>
<p>الوجهة: {invoice.group_trip.Destination_name}</p>
<p>عدد الأشخاص: {invoice.number_of_people}</p>

{/* ✅ السعر الأساسي */}
<p>السعر للشخص: {invoice.trip_cost} ل.س</p>

{/* ✅ عرض بيانات الخصم فقط إذا موجود */}
{invoice.group_trip.discount_percentage > 0 ? (
  <>
    <p>نسبة الخصم: {invoice.group_trip.discount_percentage}%</p>
    
    <p>السعر بعد الخصم للشخص: {invoice.group_trip.final_price} ل.س</p>
    <p className="text-red-600 font-bold">
      إجمالي الخصم:{" "}
      {Number(invoice.trip_cost) * invoice.number_of_people -
        invoice.group_trip.final_price * invoice.number_of_people}{" "}
      ل.س
    </p>
  </>
) : null}

{/* ✅ المرفقات */}
{invoice.attachments && invoice.attachments.length > 0 && (
  <div className="mt-3">
    <h4 className="font-semibold text-black-700">📎 المرفقات</h4>
    <ul className="list-disc list-inside">
      {invoice.attachments.map((att) => (
        <li key={att.id}>
          {att.name} - <span className="">{att.price} ل.س</span>
        </li>
      ))}
    </ul>
    <p className="mt-1 text-sm text-gray-700 font-bold">
      إجمالي المرفقات:{" "}
      <span className="font-bold">
        {invoice.attachments.reduce(
          (sum, att) => sum + (att.price || 0),
          0
        )}{" "}
        ل.س
      </span>
    </p>
  </div>
)}

{/* ✅ المجموع الكلي */}
<p className="mt-3 text-lg font-bold text-black-700">
  المجموع الكلي:{" "}
  {invoice.group_trip.final_price * invoice.number_of_people +
    (invoice.attachments?.reduce((sum, att) => sum + (att.price || 0), 0) ||
      0)}{" "}
  ل.س
</p>

                  {activeTab === "pending" && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleAccept(invoice)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                      >
                        قبول
                      </button>
                      <button
                        onClick={() => handleReject(invoice)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                      >
                        رفض
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}












// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// type Order = {
//   id: number;
//   customer: string;
//   date: string;
//   total: string;
//   note: string;
// };

// type OrdersData = {
//   pending: Order[];
//   accepted: Order[];
//   rejected: Order[];
//   paid: Order[];
// };

// const initialOrders: OrdersData = {
//   pending: [
//     { id: 1, customer: "أحمد يوسف", date: "2025-08-07", total: "100$", note: "بانتظار الموافقة" },
//     { id: 2, customer: "منى الخطيب", date: "2025-08-08", total: "150$", note: "بانتظار الرد" },
//   ],
//   accepted: [
//     { id: 3, customer: "ليلى عمر", date: "2025-07-29", total: "200$", note: "تم القبول" },
//   ],
//   rejected: [
//     { id: 4, customer: "سامي علي", date: "2025-07-20", total: "120$", note: "رفض بسبب نقص المستندات" },
//   ],
//   paid: [
//     { id: 5, customer: "نورا حسن", date: "2025-08-01", total: "180$", note: "تم الدفع" },
//     { id: 6, customer: "خالد مراد", date: "2025-08-03", total: "220$", note: "تم الدفع ببطاقة فيزا" },
//   ],
// };

// type TabKey = keyof OrdersData;

// const tabs = [
//   { key: "pending", label: "🕓 الطلبات المعلقة", color: "bg-yellow-100" },
//   { key: "accepted", label: "✅ الطلبات المقبولة", color: "bg-green-100" },
//   { key: "rejected", label: "❌ الطلبات المرفوضة", color: "bg-red-100" },
//   { key: "paid", label: "💵 الطلبات المدفوعة", color: "bg-blue-100" },
// ];

// export default function Reservation() {
//   const [orders, setOrders] = useState<OrdersData>(initialOrders);
//   const [activeTab, setActiveTab] = useState<TabKey>("pending");

//   const handleAccept = (order: Order) => {
//     setOrders((prev) => ({
//       ...prev,
//       pending: prev.pending.filter((o) => o.id !== order.id),
//       accepted: [...prev.accepted, { ...order, note: "تم القبول ✅" }],
//     }));
//   };

//   const handleReject = (order: Order) => {
//     setOrders((prev) => ({
//       ...prev,
//       pending: prev.pending.filter((o) => o.id !== order.id),
//       rejected: [...prev.rejected, { ...order, note: "❌ تم الرفض" }],
//     }));
//   };

//   return (
//     <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6 mt-4" dir="rtl">
//       {/* Tabs */}
//       <div className="flex justify-between gap-2 mb-6 overflow-x-auto">
//         {tabs.map((tab) => (
//           <button
//             key={tab.key}
//             onClick={() => setActiveTab(tab.key as TabKey)}
//             className={`flex-1 p-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
//               activeTab === tab.key
//                 ? `${tab.color} border-2 border-blue-500 text-blue-900`
//                 : "bg-gray-100 hover:bg-gray-200 text-gray-700"
//             }`}
//           >
//             {tab.label} ({orders[tab.key as TabKey].length})
//           </button>
//         ))}
//       </div>

//       {/* Orders List */}
//       <div className="flex flex-col gap-4">
//         <AnimatePresence>
//           {orders[activeTab].length === 0 ? (
//             <motion.p
//               key="empty"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="text-center text-gray-500"
//             >
//               لا توجد طلبات حالياً في هذا القسم.
//             </motion.p>
//           ) : (
//             orders[activeTab].map((order) => (
//               <motion.div
//                 key={order.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, x: 100 }}
//                 transition={{ duration: 0.3 }}
//                 className="flex items-center justify-between border rounded-lg p-4 bg-gray-50 shadow-sm"
//               >
//                 <div>
//                   <h3 className="text-lg font-bold text-blue-800 mb-1">
//                     #{order.id} - {order.customer}
//                   </h3>
//                   <p className="text-sm text-gray-700">📅 {order.date}</p>
//                   <p className="text-sm text-gray-700">💵 {order.total}</p>
//                   <p className="text-sm text-gray-600 italic">📝 {order.note}</p>
//                 </div>

//                 {activeTab === "pending" && (
//   <div className="flex gap-2">
//     <button
//       onClick={() => handleAccept(order)}
//       className="bg-green-500 text-white w-10 h-10 flex items-center justify-center rounded hover:bg-green-600 transition"
//       title="قبول"
//     >
//       قبول
//     </button>
//     <button
//       onClick={() => handleReject(order)}
//       className="bg-red-500 text-white w-10 h-10 flex items-center justify-center rounded hover:bg-red-600 transition"
//       title="رفض"
//     >
//       رفض
//     </button>
//   </div>
// )}

//               </motion.div>
//             ))
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }










