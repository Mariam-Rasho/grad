// pages/login.tsx
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import Image from 'next/image';
import axios from 'axios';
import Swal from 'sweetalert2';
import url from '../components/url'

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${url}/api/loginadmin`, {
        name,
        email,
        password,
      });

      const { status, data, message } = response.data;

      if (status === 1) {
        // حفظ التوكن وبيانات المستخدم في localStorage
        // ✅ تأكدنا إن التوكن يرجع من السيرفر (غالباً داخل data)
      console.log("🎯 Login response:", response.data);

      // ✅ حفظ التوكن
      localStorage.setItem("token", data.token); 
        // localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          id: data.id,
          name: data.name, // من حقل الإدخال
          email: data.email,
          role: data.role
          
        }));
      
        // ✅ بدون رسالة تنبيه
        router.push('/');
      }
       else {
        Swal.fire({
          icon: 'error',
          title: 'فشل تسجيل الدخول',
          text: message || 'الرجاء التحقق من البيانات المدخلة.',
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'حدث خطأ',
        text: error.response?.data?.message || 'فشل في الاتصال بالخادم.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 to-blue-400" dir="rtl">
      <div className="bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-3xl p-10 max-w-md w-full">
        
        {/* الشعار */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/Logo.jpg"
            alt="شعار الموقع"
            width={150}
            height={150}
            className="rounded-full"
          />
        </div>

        <h2 className="text-3xl font-extrabold text-blue-800 mb-6 text-center">تسجيل الدخول</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* الاسم الكامل */}
          <div className="relative">
            <FaUser className="absolute top-3 right-3 text-gray-400" />
            <input
              type="text"
              placeholder="الاسم الكامل"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* البريد الإلكتروني */}
          <div className="relative">
            <FaEnvelope className="absolute top-3 right-3 text-gray-400" />
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* كلمة المرور */}
          <div className="relative">
            <FaLock className="absolute top-3 right-3 text-gray-400" />
            <input
              type="password"
              placeholder="كلمة السر"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition duration-200 font-semibold"
          >
            {loading ? 'جاري التحقق...' : 'تسجيل دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}














// // pages/login.tsx
// import { useRouter } from 'next/router';
// import { useState } from 'react';
// import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
// import Image from 'next/image';

// export default function LoginPage() {
//   const router = useRouter();
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleLogin = (e: React.FormEvent) => {
//     e.preventDefault();
//     localStorage.setItem('user', JSON.stringify({ name, email, password }));
//     router.push('/');
//   };
// {/* <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-200 via-blue-200 to-purple-300" dir="rtl">
// <div className="bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-3xl p-10 max-w-md w-full flex flex-col items-center"> */}
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 to-blue-400" dir="rtl">
//       <div className="bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-3xl p-10 max-w-md w-full ">
       
//         {/* اللوغو */}
//         <div className="mb-6 flex justify-center ">
//           <Image
//             src="/logo.png" // تأكد من وضع صورة الشعار في مجلد public
//             alt="شعار الموقع"
//             width={150}
//             height={150}
//             className="rounded-full"
//           />
//         </div>
       
//         <h2 className="text-3xl font-extrabold text-blue-800 mb-6 text-center">تسجيل الدخول</h2>

//         <form onSubmit={handleLogin} className="space-y-5">
//           {/* الاسم */}
//           <div className="relative">
//             <FaUser className="absolute top-3 right-3 text-gray-400" />
//             <input
//               type="text"
//               placeholder="الاسم الكامل"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full pl-4 pr-10 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
//               required
//             />
//           </div>

//           {/* البريد الإلكتروني */}
//           <div className="relative">
//             <FaEnvelope className="absolute top-3 right-3 text-gray-400" />
//             <input
//               type="email"
//               placeholder="البريد الإلكتروني"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full pl-4 pr-10 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
//               required
//             />
//           </div>

//           {/* كلمة المرور */}
//           <div className="relative">
//             <FaLock className="absolute top-3 right-3 text-gray-400" />
//             <input
//               type="password"
//               placeholder="كلمة السر"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full pl-4 pr-10 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition duration-200 font-semibold"
//           >
//             تسجيل دخول
//           </button>
//         </form>

        
//       </div>
//     </div>
//   );
// }




















