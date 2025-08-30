"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie, Line } from "react-chartjs-2";
import Swal from "sweetalert2";
import url from '../components/url'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,  
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

type TopTrip = { group_trip_id: number; count: number };
type OverviewResponse = {
  monthly: Record<string, number>;
  days_of_week: number[];
  seasons: { winter: number; spring: number; summer: number; autumn: number };
  top_trips: TopTrip[];
};
type ForecastPoint = { month: string; forecast: number };
type ForecastResponse = { horizon: number; forecast: ForecastPoint[] };

type MonthlyRevenueResponse = { monthly_revenue: Record<string, number> };
type YearlyRevenueItem = { year: number; revenue: number };
type YearlyRevenueResponse = { yearly_revenue: YearlyRevenueItem[] };
type TotalRevenueResponse = { total_revenue: number };

interface GroupTrip {
  id: number;
  destination: string;
}

const mainTabs = [
  { key: "reservations", label: "إحصاءات الحجوزات" },
  { key: "revenue", label: "الإيرادات" },
];

const reservationTabs = [
  { key: "monthly", label: "الحجوزات الشهرية" },
  { key: "weekly", label: "حسب أيام الأسبوع" },
  { key: "seasonal", label: "حسب الفصول" },
  { key: "topTrips", label: "أكثر الرحلات إقبالاً" },
  { key: "forecast", label: "التوقعات القادمة" },
];

const revenueTabs = [
  { key: "monthly", label: "الإيرادات الشهرية" },
  { key: "yearly", label: "الإيرادات السنوية" },
  { key: "total", label: "الإيرادات الكلية" },
];

export default function Statistics() {
  const [activeMainTab, setActiveMainTab] = useState<"reservations" | "revenue">("reservations");
  const [activeReservationTab, setActiveReservationTab] = useState<"monthly" | "weekly" | "seasonal" | "topTrips" | "forecast">("monthly");
  const [activeRevenueTab, setActiveRevenueTab] = useState<"monthly" | "yearly" | "total">("monthly");

  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueResponse | null>(null);
  const [yearlyRevenue, setYearlyRevenue] = useState<YearlyRevenueResponse | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<TotalRevenueResponse | null>(null);
  const [groupTrips, setGroupTrips] = useState<GroupTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null); // ✅ تخزين التوكن هنا
  // setToken(localStorage.getItem("token"));

  

  // ✅ قراءة التوكن من localStorage فقط في المتصفح
  useEffect(() => {
    
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      console.log("🎯 Token from localStorage:", t); // 👈 هون
      setToken(t);
    }
  }, []);

  const trainModel = async () => {
    if (!token) return;
    try {
      await axios.post(`${url}/api/train`, {}, { headers: { Authorization: `Bearer ${token}` } });
      console.log("✅ تم تدريب النموذج بنجاح عند منتصف الليل");
    } catch (err: any) {
      console.error("❌ خطأ أثناء تدريب النموذج:", err.response?.data || err.message);
      Swal.fire("خطأ", `فشل تدريب النموذج:\n${err.response?.data?.message || err.message}`, "error");
    }
  };

  // جدولة تدريب النموذج عند منتصف الليل
  useEffect(() => {
    if (!token) return;
    let intervalId: number | undefined;
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    const timeoutId = window.setTimeout(async () => {
      await trainModel();
      intervalId = window.setInterval(trainModel, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [token]);

  // جلب البيانات من السيرفر
  useEffect(() => {
    if (token === null) return; // لسا ما قرينا التوكن
    if (!token) {
      Swal.fire("خطأ", "⚠️ الرجاء تسجيل الدخول أولاً.", "error");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        console.log("🚀 Sending requests with token:", token); // 👈 هون
        const [overviewRes, forecastRes, monthlyRevRes, yearlyRevRes, totalRevRes, tripsRes] = await Promise.all([
          axios.get<OverviewResponse>(`${url}/api/overview`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<ForecastResponse>(`${url}/api/forecast`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<MonthlyRevenueResponse>(`${url}/api/monthly`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<YearlyRevenueResponse>(`${url}/api/yearly`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<TotalRevenueResponse>(`${url}/api/total`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get<GroupTrip[]>(`${url}/api/getAllGroupTrips`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setOverview(overviewRes.data);
        setForecast(forecastRes.data);
        setMonthlyRevenue(monthlyRevRes.data);
        setYearlyRevenue(yearlyRevRes.data);
        setTotalRevenue(totalRevRes.data);
        setGroupTrips(Array.isArray(tripsRes.data) ? tripsRes.data : []); // ✅ تعديل: تأكيد أن tripsRes.data مصفوفة
      } catch (err: any) {
        console.error("فشل جلب البيانات:", err.response || err.message);
        Swal.fire("خطأ", `فشل في جلب البيانات:\n${err.response?.data?.message || err.message}`, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <div className="text-center text-lg">⏳ جارِ تحميل البيانات...</div>;
  if (!overview) return <div className="text-center text-red-500">⚠️ لم يتم جلب بيانات الإحصاءات</div>;

  // ==== إعداد الرسوم ====
  const monthlyLabels = monthlyRevenue ? Object.keys(monthlyRevenue.monthly_revenue).sort() : [];
  const monthlyValues = monthlyRevenue ? Object.values(monthlyRevenue.monthly_revenue) : [];

  const monthlyData = {
    labels: monthlyLabels,
    datasets: [
      { label: "عدد الحجوزات", data: overview.monthly ? Object.values(overview.monthly) : [], backgroundColor: "rgba(54, 162, 235, 0.7)" }
    ]
  };

  const weeklyData = {
    labels: ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
    datasets: [
      { label: "عدد الحجوزات", data: overview.days_of_week ?? [], backgroundColor: "rgba(255, 159, 64, 0.7)" }
    ]
  };

  const seasonalLabels = ["الشتاء","الربيع","الصيف","الخريف"];
  const seasonalValues = [overview.seasons.winter, overview.seasons.spring, overview.seasons.summer, overview.seasons.autumn];
  const seasonalData = {
    labels: seasonalLabels,
    datasets: [
      { data: seasonalValues, backgroundColor: ["rgba(54, 162, 235, 0.7)","rgba(75, 192, 192, 0.7)","rgba(255, 206, 86, 0.7)","rgba(153, 102, 255, 0.7)"] }
    ]
  };

  // ✅ استخدام Map للبحث السريع
  const tripsMap = new Map(groupTrips.map(g => [g.id, g.destination]));
  const topTripsLabels = overview.top_trips.map(t => tripsMap.get(t.group_trip_id) ?? `رحلة ${t.group_trip_id}`);
  const topTripsValues = overview.top_trips.map((t) => t.count);
  const topTripsData = { labels: topTripsLabels, datasets: [{ label: "عدد الحجوزات", data: topTripsValues, backgroundColor: "rgba(255, 99, 132, 0.7)" }] };

  const forecastLabels = forecast?.forecast?.map(f => f.month) ?? [];
  const forecastValues = forecast?.forecast?.map(f => f.forecast) ?? [];
  const forecastData = { labels: forecastLabels, datasets: [{ label: "الحجوزات المتوقعة", data: forecastValues, borderColor: "rgba(54, 162, 235, 1)", backgroundColor: "rgba(54, 162, 235, 0.3)", tension: 0.3, fill: true }] };

  const revenueMonthly = { labels: monthlyLabels, datasets: [{ label: "الإيرادات الشهرية (ل.س)", data: monthlyValues, backgroundColor: "rgba(54, 162, 235, 0.7)" }] };
  const revenueYearly = { labels: yearlyRevenue ? yearlyRevenue.yearly_revenue.map(y => String(y.year)) : [], datasets: [{ label: "الإيرادات السنوية (ل.س)", data: yearlyRevenue ? yearlyRevenue.yearly_revenue.map(y => y.revenue) : [], backgroundColor: "rgba(75, 192, 192, 0.7)" }] };
  const totalRevenueData = { labels: ["الإيرادات الكلية"], datasets: [{ label: "الإيرادات (ل.س)", data: totalRevenue ? [totalRevenue.total_revenue] : [], backgroundColor: "rgba(255, 206, 86, 0.7)" }] };

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6 mt-6" dir="rtl">
      {/* التبويبات الرئيسية */}
      <div className="flex gap-2 mb-6">
        {mainTabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveMainTab(tab.key as any)} className={`flex-1 p-3 rounded-lg font-semibold transition ${activeMainTab === tab.key ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{tab.label}</button>
        ))}
      </div>

      {/* قسم الحجوزات */}
      {activeMainTab === "reservations" && (
        <>
          <div className="flex gap-2 mb-6">
            {reservationTabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveReservationTab(tab.key as any)} className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${activeReservationTab === tab.key ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{tab.label}</button>
            ))}
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            {activeReservationTab === "monthly" && <Bar data={monthlyData} />}
            {activeReservationTab === "weekly" && <Bar data={weeklyData} />}
            {activeReservationTab === "seasonal" && <div className="w-[520px] h-[520px] mx-auto"><Pie data={seasonalData} options={{ maintainAspectRatio: false }} /></div>}
            {activeReservationTab === "topTrips" && <Bar data={topTripsData} />}
            {activeReservationTab === "forecast" && (forecastLabels.length ? <Line data={forecastData} /> : <div className="text-center text-gray-500">لا توجد بيانات توقعات متاحة حالياً</div>)}
          </div>
        </>
      )}

      {/* قسم الإيرادات */}
      {activeMainTab === "revenue" && (
        <>
          <div className="flex gap-2 mb-6">
            {revenueTabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveRevenueTab(tab.key as any)} className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${activeRevenueTab === tab.key ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{tab.label}</button>
            ))}
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            {activeRevenueTab === "monthly" && <Bar data={revenueMonthly} />}
            {activeRevenueTab === "yearly" && <Bar data={revenueYearly} />}
            {activeRevenueTab === "total" && <Bar data={totalRevenueData} />}
          </div>
        </>
      )}
    </div>
  );
}








// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import { Bar, Pie, Line } from "react-chartjs-2";
// import Swal from "sweetalert2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,  
//   Legend,
//   PointElement,
//   LineElement,
//   ArcElement,
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   PointElement,
//   LineElement,
//   ArcElement
// );

// type TopTrip = { group_trip_id: number; count: number };
// type OverviewResponse = {
//   monthly: Record<string, number>;
//   days_of_week: number[];
//   seasons: { winter: number; spring: number; summer: number; autumn: number };
//   top_trips: TopTrip[];
// };
// type ForecastPoint = { month: string; forecast: number };
// type ForecastResponse = { horizon: number; forecast: ForecastPoint[] };

// type MonthlyRevenueResponse = { monthly_revenue: Record<string, number> };
// type YearlyRevenueItem = { year: number; revenue: number };
// type YearlyRevenueResponse = { yearly_revenue: YearlyRevenueItem[] };
// type TotalRevenueResponse = { total_revenue: number };

// interface GroupTrip {
//   id: number;
//   destination: string;
// }

// const mainTabs = [
//   { key: "reservations", label: "إحصاءات الحجوزات" },
//   { key: "revenue", label: "الإيرادات" },
// ];

// const reservationTabs = [
//   { key: "monthly", label: "الحجوزات الشهرية" },
//   { key: "weekly", label: "حسب أيام الأسبوع" },
//   { key: "seasonal", label: "حسب الفصول" },
//   { key: "topTrips", label: "أكثر الرحلات إقبالاً" },
//   { key: "forecast", label: "التوقعات القادمة" },
// ];

// const revenueTabs = [
//   { key: "monthly", label: "الإيرادات الشهرية" },
//   { key: "yearly", label: "الإيرادات السنوية" },
//   { key: "total", label: "الإيرادات الكلية" },
// ];

// export default function Statistics() {
//   const [activeMainTab, setActiveMainTab] = useState<"reservations" | "revenue">("reservations");
//   const [activeReservationTab, setActiveReservationTab] = useState<"monthly" | "weekly" | "seasonal" | "topTrips" | "forecast">("monthly");
//   const [activeRevenueTab, setActiveRevenueTab] = useState<"monthly" | "yearly" | "total">("monthly");

//   const [overview, setOverview] = useState<OverviewResponse | null>(null);
//   const [forecast, setForecast] = useState<ForecastResponse | null>(null);
//   const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueResponse | null>(null);
//   const [yearlyRevenue, setYearlyRevenue] = useState<YearlyRevenueResponse | null>(null);
//   const [totalRevenue, setTotalRevenue] = useState<TotalRevenueResponse | null>(null);
//   const [groupTrips, setGroupTrips] = useState<GroupTrip[]>([]);
//   const [loading, setLoading] = useState(true);

//   const API_URL = "http://localhost:8000";
//   const token = localStorage.getItem("token");

//   const trainModel = async () => {
//     if (!token) return;
//     try {
//       await axios.post(`${API_URL}/api/train`, {}, { headers: { Authorization: `Bearer ${token}` } });
//       console.log("✅ تم تدريب النموذج بنجاح عند منتصف الليل");
//     } catch (err: any) {
//       console.error("❌ خطأ أثناء تدريب النموذج:", err.response?.data || err.message);
//       Swal.fire("خطأ", `فشل تدريب النموذج:\n${err.response?.data?.message || err.message}`, "error");
//     }
//   };

//   useEffect(() => {
//     if (!token) return;
//     let intervalId: number | undefined;
//     const now = new Date();
//     const nextMidnight = new Date(now);
//     nextMidnight.setHours(24, 0, 0, 0);
//     const msUntilMidnight = nextMidnight.getTime() - now.getTime();

//     const timeoutId = window.setTimeout(async () => {
//       await trainModel();
//       intervalId = window.setInterval(trainModel, 24 * 60 * 60 * 1000);
//     }, msUntilMidnight);

//     return () => {
//       window.clearTimeout(timeoutId);
//       if (intervalId) window.clearInterval(intervalId);
//     };
//   }, [token]);

//   useEffect(() => {
//     if (!token) {
//       Swal.fire("خطأ", "الرجاء تسجيل الدخول أولاً.", "error");
//       setLoading(false);
//       return;
//     }

//     const fetchData = async () => {
//       try {
//         const [overviewRes, forecastRes, monthlyRevRes, yearlyRevRes, totalRevRes, tripsRes] = await Promise.all([
//           axios.get<OverviewResponse>(`${API_URL}/api/overview`, { headers: { Authorization: `Bearer ${token}` } }),
//           axios.get<ForecastResponse>(`${API_URL}/api/forecast`, { headers: { Authorization: `Bearer ${token}` } }),
//           axios.get<MonthlyRevenueResponse>(`${API_URL}/api/monthly`, { headers: { Authorization: `Bearer ${token}` } }),
//           axios.get<YearlyRevenueResponse>(`${API_URL}/api/yearly`, { headers: { Authorization: `Bearer ${token}` } }),
//           axios.get<TotalRevenueResponse>(`${API_URL}/api/total`, { headers: { Authorization: `Bearer ${token}` } }),
//           axios.get<GroupTrip[]>(`${API_URL}/api/getAllGroupTrips`, { headers: { Authorization: `Bearer ${token}` } }),
//         ]);

//         setOverview(overviewRes.data);
//         setForecast(forecastRes.data);
//         setMonthlyRevenue(monthlyRevRes.data);
//         setYearlyRevenue(yearlyRevRes.data);
//         setTotalRevenue(totalRevRes.data);
//         setGroupTrips(tripsRes.data);
//       } catch (err: any) {
//         console.error("فشل جلب البيانات:", err.response || err.message);
//         Swal.fire("خطأ", `فشل في جلب البيانات:\n${err.response?.data?.message || err.message}`, "error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [token]);

//   if (loading) return <div className="text-center text-lg">⏳ جارِ تحميل البيانات...</div>;
//   if (!overview) return <div className="text-center text-red-500">⚠️ لم يتم جلب بيانات الإحصاءات</div>;

//   // ==== إعداد الرسوم ====
//   const monthlyLabels = monthlyRevenue ? Object.keys(monthlyRevenue.monthly_revenue).sort() : [];
//   const monthlyValues = monthlyRevenue ? Object.values(monthlyRevenue.monthly_revenue) : [];
//   const monthlyData = {
//      labels: monthlyLabels, datasets: [
//       { label: "عدد الحجوزات", data: overview.monthly ? Object.values(overview.monthly) : [], backgroundColor: "rgba(54, 162, 235, 0.7)" }] };
//       const weeklyData = { labels: ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"], datasets: [{ label: "عدد الحجوزات", data: overview.days_of_week || [], backgroundColor: "rgba(255, 159, 64, 0.7)" }] };
//   const seasonalLabels = ["الشتاء","الربيع","الصيف","الخريف"];
//   const seasonalValues = [overview.seasons.winter, overview.seasons.spring, overview.seasons.summer, overview.seasons.autumn];
//   const seasonalData = { labels: seasonalLabels, datasets: [{ data: seasonalValues, backgroundColor: ["rgba(54, 162, 235, 0.7)","rgba(75, 192, 192, 0.7)","rgba(255, 206, 86, 0.7)","rgba(153, 102, 255, 0.7)"] }] };
//   const topTripsLabels = overview.top_trips.map((t) => {
//     const trip = groupTrips.find(g => g.id === t.group_trip_id);
//     return trip ? trip.destination : `رحلة ${t.group_trip_id}`;
//   });
//   const topTripsValues = overview.top_trips.map((t) => t.count);
//   const topTripsData = { labels: topTripsLabels, datasets: [{ label: "عدد الحجوزات", data: topTripsValues, backgroundColor: "rgba(255, 99, 132, 0.7)" }] };
//   const forecastLabels = forecast?.forecast?.map(f => f.month) ?? [];
//   const forecastValues = forecast?.forecast?.map(f => f.forecast) ?? [];
//   const forecastData = { labels: forecastLabels, datasets: [{ label: "الحجوزات المتوقعة", data: forecastValues, borderColor: "rgba(54, 162, 235, 1)", backgroundColor: "rgba(54, 162, 235, 0.3)", tension: 0.3, fill: true }] };

//   const revenueMonthly = { labels: monthlyLabels, datasets: [{ label: "الإيرادات الشهرية (ل.س)", data: monthlyValues, backgroundColor: "rgba(54, 162, 235, 0.7)" }] };
//   const revenueYearly = { labels: yearlyRevenue ? yearlyRevenue.yearly_revenue.map(y => String(y.year)) : [], datasets: [{ label: "الإيرادات السنوية (ل.س)", data: yearlyRevenue ? yearlyRevenue.yearly_revenue.map(y => y.revenue) : [], backgroundColor: "rgba(75, 192, 192, 0.7)" }] };
//   const totalRevenueData = { labels: ["الإيرادات الكلية"], datasets: [{ label: "الإيرادات (ل.س)", data: totalRevenue ? [totalRevenue.total_revenue] : [], backgroundColor: "rgba(255, 206, 86, 0.7)" }] };

//   return (
//     <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6 mt-6" dir="rtl">
//       {/* التبويبات الرئيسية */}
//       <div className="flex gap-2 mb-6">
//         {mainTabs.map(tab => (
//           <button key={tab.key} onClick={() => setActiveMainTab(tab.key as any)} className={`flex-1 p-3 rounded-lg font-semibold transition ${activeMainTab === tab.key ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{tab.label}</button>
//         ))}
//       </div>

//       {/* قسم الحجوزات */}
//       {activeMainTab === "reservations" && (
//         <>
//           <div className="flex gap-2 mb-6">
//             {reservationTabs.map(tab => (
//               <button key={tab.key} onClick={() => setActiveReservationTab(tab.key as any)} className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${activeReservationTab === tab.key ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{tab.label}</button>
//             ))}
//           </div>
//           <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
//             {activeReservationTab === "monthly" && <Bar data={monthlyData} />}
//             {activeReservationTab === "weekly" && <Bar data={weeklyData} />}
//             {activeReservationTab === "seasonal" && <div className="w-[520px] h-[520px] mx-auto"><Pie data={seasonalData} options={{ maintainAspectRatio: false }} /></div>}
//             {activeReservationTab === "topTrips" && <Bar data={topTripsData} />}
//             {activeReservationTab === "forecast" && (forecastLabels.length ? <Line data={forecastData} /> : <div className="text-center text-gray-500">لا توجد بيانات توقعات متاحة حالياً</div>)}
//           </div>
//         </>
//       )}

//       {/* قسم الإيرادات */}
//       {activeMainTab === "revenue" && (
//         <>
//           <div className="flex gap-2 mb-6">
//             {revenueTabs.map(tab => (
//               <button key={tab.key} onClick={() => setActiveRevenueTab(tab.key as any)} className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${activeRevenueTab === tab.key ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{tab.label}</button>
//             ))}
//           </div>
//           <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
//             {activeRevenueTab === "monthly" && <Bar data={revenueMonthly} />}
//             {activeRevenueTab === "yearly" && <Bar data={revenueYearly} />}
//             {activeRevenueTab === "total" && <Bar data={totalRevenueData} />}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }











// "use client";

// import { useState } from "react";
// import { Bar, Pie, Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   PointElement,
//   LineElement,
//   ArcElement,
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   PointElement,
//   LineElement,
//   ArcElement
// );

// const mainTabs = [
//   { key: "reservations", label: " إحصاءات الحجوزات" },
//   { key: "revenue", label: " الإيرادات" },
// ];

// const reservationTabs = [
//   { key: "monthly", label: "الحجوزات الشهرية" },
//   { key: "weekly", label: "حسب أيام الأسبوع" },
//   { key: "seasonal", label: "حسب الفصول" },
//   { key: "topTrips", label: "أكثر الرحلات إقبالاً" },
//   { key: "forecast", label: "التوقعات القادمة" }, // 👈 أضفنا التبويب
// ];

// const revenueTabs = [
//   { key: "monthly", label: "الإيرادات الشهرية" },
//   { key: "yearly", label: "الإيرادات السنوية" },
//   { key: "total", label: "الإيرادات الكلية" },
// ];

// export default function Statistics() {
//   const [activeMainTab, setActiveMainTab] = useState("reservations");
//   const [activeReservationTab, setActiveReservationTab] = useState("monthly");
//   const [activeRevenueTab, setActiveRevenueTab] = useState("monthly");

//   // بيانات تجريبية
//   const monthlyData = {
//     labels: [
//       "يناير","فبراير","مارس","أبريل","مايو","يونيو",
//       "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",
//     ],
//     datasets: [
//       {
//         label: "الحجوزات المؤكدة",
//         data: [10, 15, 8, 20, 25, 30, 18, 22, 28, 35, 40, 50],
//         backgroundColor: "rgba(54, 162, 235, 0.7)",
//       },
//       {
//         label: "الحجوزات المدفوعة",
//         data: [5, 12, 7, 18, 22, 28, 15, 19, 24, 30, 36, 45],
//         backgroundColor: "rgba(75, 192, 192, 0.7)",
//       },
//     ],
//   };

//   const weeklyData = {
//     labels: ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
//     datasets: [
//       {
//         label: "عدد الحجوزات",
//         data: [12, 19, 10, 15, 22, 30, 25],
//         backgroundColor: "rgba(255, 159, 64, 0.7)",
//       },
//     ],
//   };

//   const seasonalData = {
//     labels: ["الشتاء", "الربيع", "الصيف", "الخريف"],
//     datasets: [
//       {
//         data: [40, 55, 80, 35],
//         backgroundColor: [
//           "rgba(54, 162, 235, 0.7)",
//           "rgba(75, 192, 192, 0.7)",
//           "rgba(255, 206, 86, 0.7)",
//           "rgba(153, 102, 255, 0.7)",
//         ],
//       },
//     ],
//   };

//   const topTripsData = {
//     labels: ["دمشق", "حلب", "اللاذقية", "طرطوس", "حمص"],
//     datasets: [
//       {
//         label: "عدد الحجوزات",
//         data: [60, 45, 30, 25, 20],
//         backgroundColor: "rgba(255, 99, 132, 0.7)",
//       },
//     ],
//   };

//   // 👇 بيانات التوقعات القادمة (Forecast)
//   const forecastData = {
//     labels: ["يناير 2025", "فبراير 2025", "مارس 2025", "أبريل 2025", "مايو 2025", "يونيو 2025"],
//     datasets: [
//       {
//         label: "الحجوزات المتوقعة",
//         data: [55, 60, 70, 80, 95, 110], // بيانات تجريبية
//         borderColor: "rgba(54, 162, 235, 1)",
//         backgroundColor: "rgba(54, 162, 235, 0.3)",
//         tension: 0.3,
//         fill: true,
//       },
//     ],
//   };

//   const revenueMonthly = {
//     labels: monthlyData.labels,
//     datasets: [
//       {
//         label: "الإيرادات الشهرية (ل.س)",
//         data: [1000,1200,800,1500,1700,2000,1800,1900,2100,2500,2800,3000],
//         backgroundColor: "rgba(54, 162, 235, 0.7)",
//       },
//     ],
//   };

//   const revenueYearly = {
//     labels: ["2021","2022","2023","2024"],
//     datasets: [
//       {
//         label: "الإيرادات السنوية (ل.س)",
//         data: [15000, 20000, 25000, 30000],
//         backgroundColor: "rgba(75, 192, 192, 0.7)",
//       },
//     ],
//   };

//   const totalRevenue = {
//     labels: ["الإيرادات الكلية"],
//     datasets: [
//       {
//         label: "الإيرادات (ل.س)",
//         data: [90000],
//         backgroundColor: "rgba(255, 206, 86, 0.7)",
//       },
//     ],
//   };

//   return (
//     <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6 mt-6" dir="rtl">
//       {/* التبويبات الرئيسية */}
//       <div className="flex gap-2 mb-6">
//         {mainTabs.map((tab) => (
//           <button
//             key={tab.key}
//             onClick={() => setActiveMainTab(tab.key)}
//             className={`flex-1 p-3 rounded-lg font-semibold transition ${
//               activeMainTab === tab.key
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* قسم الحجوزات */}
//       {activeMainTab === "reservations" && (
//         <>
//           <div className="flex gap-2 mb-6">
//             {reservationTabs.map((tab) => (
//               <button
//                 key={tab.key}
//                 onClick={() => setActiveReservationTab(tab.key)}
//                 className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${
//                   activeReservationTab === tab.key
//                     ? "bg-green-500 text-white"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 {tab.label}
//               </button>
//             ))}
//           </div>

//           <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
//             {activeReservationTab === "monthly" && <Bar data={monthlyData} />}
//             {activeReservationTab === "weekly" && <Bar data={weeklyData} />}
//             {activeReservationTab === "seasonal" && (
//               <div className="w-[500px] h-[500px] mx-auto">
//                 <Pie data={seasonalData} options={{ maintainAspectRatio: false }} />
//               </div>
//             )}
//             {activeReservationTab === "topTrips" && <Line data={topTripsData} />}
//             {activeReservationTab === "forecast" && <Line data={forecastData} />}
//           </div>
//         </>
//       )}

//       {/* قسم الإيرادات */}
//       {activeMainTab === "revenue" && (
//         <>
//           <div className="flex gap-2 mb-6">
//             {revenueTabs.map((tab) => (
//               <button
//                 key={tab.key}
//                 onClick={() => setActiveRevenueTab(tab.key)}
//                 className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${
//                   activeRevenueTab === tab.key
//                     ? "bg-purple-500 text-white"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 {tab.label}
//               </button>
//             ))}
//           </div>

//           <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
//             {activeRevenueTab === "monthly" && <Bar data={revenueMonthly} />}
//             {activeRevenueTab === "yearly" && <Bar data={revenueYearly} />}
//             {activeRevenueTab === "total" && <Bar data={totalRevenue} />}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }







