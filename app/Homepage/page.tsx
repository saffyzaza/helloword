"use client";

import '../globals.css';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Image from 'next/image';
import { FiAward, FiFileText, FiCalendar, FiMonitor } from 'react-icons/fi';

export default function Homepage() {
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = window.localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  return (
    <div className="flex h-screen bg-"> 
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        
        <main className="flex-1 w-full flex flex-col justify-center items-center p-3 sm:p-4 overflow-y-auto">
          <div>
            
            <div className="w-full max-w-6xl">
              
            {/* ปรับแก้: ลด Padding สำหรับจอเล็ก (p-4) และเพิ่มขึ้นสำหรับจอใหญ่ (sm:p-6) */}
            <div className="bg-transparent p-4 sm:p-6 md:p-8 rounded-2xl">
                <div className='mt-80'>
                  
                </div>
              <div className="flex flex-col md:flex-row md:gap-8 items-center">

                <div className="w-full md:w-5/12 mt-50 md:mt-0 ">
                  <Image
                    src="/ksu1.jpg"
                    alt="รับสมัครนักศึกษาปริญญาตรีเทียบโอน" 
                    width={500} 
                    height={700}
                    className="rounded-lg shadow-md"
                    priority
                  />
                </div>

                <div className="w-full md:w-7/12 text-center md:text-left">
                  <span className="inline-block border border-blue-600 text-blue-600 rounded-full px-4 py-1 text-sm font-semibold mb-4 mt-5">
                    หลักสูตรปริญญาตรี
                  </span>
                  {/* ปรับแก้: ลดขนาด Font สำหรับจอเล็กสุด (text-3xl) */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
                    ภาคพิเศษ
                  </h1>
                  {/* ปรับแก้: ลดขนาด Font สำหรับจอเล็กสุด (text-5xl) */}
                  <h2 className="text-red-600 text-5xl sm:text-6xl md:text-7xl font-extrabold mb-4">
                    สำหรับ
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto md:mx-0">
                    ผู้ที่จบ ปวส. หรือ ผู้ที่จบปริญญาตรีแล้ว<br/>
                    และต้องการเรียนปริญญาตรี
                  </p>
                </div>
              </div>

              {/* ปรับแก้: ลดระยะห่างด้านบนสำหรับจอเล็ก (mt-8) */}
              <div className="mt-8 md:mt-10  rounded-lg p-6 flex flex-col md:flex-row justify-between items-center text-gray-800 bg-blue-50">
                <h3 className="text-xl font-bold mb-4 md:mb-0 text-center md:text-left">
                  สนใจสมัครเรียนออนไลน์
                </h3>
                <a href="https://ce.ksu.ac.th" rel="noopener noreferrer">
                  <button className="bg-red-700 text-white font-semibold px-6 py-2 rounded-full hover:bg-red-900 transition hover:shadow-lg">
                    คลิกที่นี่
                  </button>
                </a>
              </div>

              {/* ปรับแก้: ลดระยะห่างด้านบนสำหรับจอเล็ก (mt-8) */}
              <div className="mt-8 md:mt-10 grid grid-cols-2 gap-3 sm:gap-4 text-center">
                <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center hover:shadow-md hover:-translate-y-1 transition-all">
                  <FiAward className="h-8 w-8 sm:h-10 sm:w-10 mb-2 text-blue-600" />
                  <p className="text-sm font-semibold text-gray-700">วุฒิ ปวส. / ป.ตรี</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center hover:shadow-md hover:-translate-y-1 transition-all">
                  <FiFileText className="h-8 w-8 sm:h-10 sm:w-10 mb-2 text-blue-600" />
                  <p className="text-sm font-semibold text-gray-700">เทียบโอนรายวิชาได้</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center hover:shadow-md hover:-translate-y-1 transition-all">
                  <FiCalendar className="h-8 w-8 sm:h-10 sm:w-10 mb-2 text-blue-600" />
                  <p className="text-sm font-semibold text-gray-700">เรียนวันเสาร์/อาทิตย์</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center hover:shadow-md hover:-translate-y-1 transition-all">
                  <FiMonitor className="h-8 w-8 sm:h-10 sm:w-10 mb-2 text-blue-600" />
                  <p className="text-sm font-semibold text-gray-700">เรียนในห้องเรียน / Online</p>
                </div>
              </div>
              <div className="mt-8 md:mt-10  rounded-lg p-6 flex flex-col md:flex-row justify-between items-center text-gray-800 bg-blue-50">
                <h3 className="text-xl font-bold mb-4 md:mb-0 text-center md:text-left">
                  เทียบวิชาในระบบออนไลน์ สาขาวิชาวิศวกรรมคอมพิวเตอร์
                </h3>
                <a href="/CourseViewer" rel="noopener noreferrer">
                  <button className="bg-red-700 text-white font-semibold px-6 py-2 rounded-full hover:bg-red-900 transition hover:shadow-lg">
                    คลิกที่นี่
                  </button>
                </a>
                <div>
                  
                </div>
              </div>
              
            </div>
            <div className="mt-4 text-center">
              
              <h1>ติดต่อสอบถาม</h1>
              <h2>งานรับนักศึกษาและประชาสัมพันธ์</h2>
              <h2>คณะวิทยาการสารสนเทศและการสื่อสาร</h2>
              <h2>มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตสกลนคร</h2>
              <h2>โทร 0-4415-2000 ต่อ 1234</h2>
              <h2>อีเมล: ksu@example.com</h2>
              <h2>Facebook: คณะวิศวกรรมศาสตร์และเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยกาฬสินธุ์ </h2>
            </div>
            
          </div>
          </div>
          
        </main>
        
        
      </div>
    </div>
  );
}