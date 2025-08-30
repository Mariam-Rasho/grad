import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
//import Sidebar from "./Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



// app/page.tsx أو wherever the Home component is
//"use client";


import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useState } from "react";
import Sidebar from "./Sidebar";
import { FaBars } from "react-icons/fa";
import User from "@/components/User";
import Employees from "@/components/Employees";
import Location from "@/components/Location";
import Governorates from "@/components/Governorates";
import Groups from "@/components/Groups";
import Activities from "@/components/Activities";
import Challenges from "@/components/Challenges";
import Account from "@/components/Account";
import Suggestions from "@/components/Suggestions";
import Restaurants from "@/components/Restaurants";
import Hotels from "@/components/Hotels";
import Reservation from "@/components/Reservation";
import Statistics from "@/components/Statistics";
export default function Home() {
  const [activeTab, setActiveTab] = useState("statistics");
  const [sidebarOpen, setSidebarOpen] = useState(false);


  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
    }
  }, []);
  

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* زر فتح القائمة في الشاشات الصغيرة */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-0 left-2 z-30 bg-gray-200 block-white px-4 py-2 rounded shadow-lg"
      >
        <FaBars />
      </button>

      {/* السايدبار */}
      <Sidebar
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* المحتوى الرئيسي */}
      <main className="flex-1 md:mr-64 overflow-y-auto p-6 bg-gray-50 mt-2">
        {activeTab === "users" ? (
          <User />
        ) : activeTab === "employees" ? (
          <Employees />
        ) : activeTab === "locations" ? (
          <Location />
        ) : activeTab === "groups" ? (
          <Groups />
        ) : activeTab === "governorates" ? (
          <Governorates />
        ) : activeTab === "activities" ? (
          <Activities />
        ) : activeTab === "challenges" ? (
          <Challenges />
        ) : activeTab === "suggestions" ? (
          <Suggestions />
        ) : activeTab === "restaurants" ? (
          <Restaurants />
        ) : activeTab === "hotels" ? (
          <Hotels />
        ) : activeTab === "reservations" ? (
          <Reservation />
        ) : activeTab === "statistics" ? (
          <Statistics />
      
        ) : activeTab === "account" ? (
          <Account />
        ) : (
          <div className="text-2xl text-center mt-20">اختر عنصرًا من القائمة</div>
        )}
      </main>
    </div>
  );
}
