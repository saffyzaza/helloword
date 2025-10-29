"use client";

import '../globals.css';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';

import Image from 'next/image';
import { FiAward, FiFileText, FiCalendar, FiMonitor, FiPhone, FiMail, FiFacebook, FiHelpCircle } from 'react-icons/fi';
import GuideComponent from '@/guide/page';

export default function Homepage() {
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showGuide, setShowGuide] = useState(false); // 修复：添加 showGuide 状态

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = window.localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      // 添加页面加载动画
      setTimeout(() => setIsLoaded(true), 100);
    }
  }, []);

  return (
    <div className={`flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 w-full overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 md:p-6">
            <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-3xl shadow-xl">
              {/* 装饰性元素 */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute bottom-20 left-10 w-32 h-32 bg-red-200 rounded-full opacity-20 blur-xl"></div>
              
              <div className="flex flex-col md:flex-row md:gap-8 items-center relative z-10">
                <div className="w-full md:w-5/12 transform hover:scale-105 transition-transform duration-500">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-red-400 rounded-lg opacity-30 blur-md"></div>
                    <Image
                      src="/ksu1.jpg"
                      alt="รับสมัครนักศึกษาปริญญาตรีเทียบโอน" 
                      width={500} 
                      height={700}
                      className="rounded-lg shadow-lg relative z-10 w-full h-auto"
                      priority
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-7/12 text-center md:text-left mt-6 md:mt-0">
                  <span className="inline-block border-2 border-blue-600 text-blue-600 bg-blue-50 rounded-full px-4 py-1 text-sm font-semibold mb-4 animate-pulse">
                    หลักสูตรปริญญาตรี
                  </span>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 leading-tight mb-2">
                    ภาคพิเศษ
                  </h1>
                  
                  <h2 className="text-red-600 text-5xl sm:text-6xl md:text-7xl font-extrabold mb-4 animate-pulse">
                    สำหรับ
                  </h2>
                  
                  <p className="text-base sm:text-lg text-gray-700 max-w-md mx-auto md:mx-0 leading-relaxed">
                    ผู้ที่จบ ปวส. หรือ ผู้ที่จบปริญญาตรีแล้ว<br/>
                    และต้องการเรียนปริญญาตรี
                  </p>
                </div>
              </div>

              {/* 申请按钮区域 */}
              <div className="mt-6 md:mt-8 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center text-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md">
                <h3 className="text-xl font-bold mb-4 md:mb-0 text-center md:text-left">
                  สนใจสมัครเรียนออนไลน์
                </h3>
                <a href="https://ce.ksu.ac.th" rel="noopener noreferrer">
                  <button className="bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold px-8 py-3 rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                    คลิกที่นี่
                  </button>
                </a>
              </div>

              {/* 特点卡片区域 */}
              <div className="mt-6 md:mt-8 grid grid-cols-2 gap-3 sm:gap-4 text-center">
                <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className="p-3 bg-blue-100 rounded-full mb-3">
                    <FiAward className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">วุฒิ ปวส. / ป.ตรี</p>
                </div>
                
                <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className="p-3 bg-blue-100 rounded-full mb-3">
                    <FiFileText className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">เทียบโอนรายวิชาได้</p>
                </div>
                
                <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className="p-3 bg-blue-100 rounded-full mb-3">
                    <FiCalendar className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">เรียนวันเสาร์/อาทิตย์</p>
                </div>
                
                <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className="p-3 bg-blue-100 rounded-full mb-3">
                    <FiMonitor className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">เรียนในห้องเรียน / Online</p>
                </div>
              </div>
              
              {/* 课程查看按钮区域 */}
              <div className="mt-6 md:mt-8 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center text-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md">
                <h3 className="text-xl font-bold mb-4 md:mb-0 text-center md:text-left">
                  เทียบวิชาในระบบออนไลน์ สาขาวิชาวิศวกรรมคอมพิวเตอร์
                </h3>
                <a href="/CourseViewer" rel="noopener noreferrer">
                  <button className="bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold px-8 py-3 rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                    คลิกที่นี่
                  </button>
                </a>
              </div>
            </div>
            
            {/* 联系信息区域 */}
            <div className="mt-6 mb-8 text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 md:p-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">ติดต่อสอบถาม</h1>
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-gray-700">
                <div className="flex items-center gap-2">
                  <FiPhone className="text-blue-600" />
                  <span>0-4415-2000 ต่อ 1234</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMail className="text-blue-600" />
                  <span>ksu@example.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiFacebook className="text-blue-600" />
                  <span>คณะวิศวกรรมศาสตร์และเทคโนโลยีอุตสาหกรรม</span>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                มหาวิทยาลัยกาฬสินธุ์
              </p>
            </div>
          </div>
        </main>
      </div>
      
      {/* 添加帮助按钮 */}
      <button
        onClick={() => setShowGuide(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
      >
        <FiHelpCircle className="w-6 h-6" />
      </button>
      
      {/* Guide 组件 */}
      <GuideComponent isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
