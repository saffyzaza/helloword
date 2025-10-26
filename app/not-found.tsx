"use client";

import './globals.css'
import React from 'react';
import Link from 'next/link';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg mx-auto">
        {/* 404 数字 */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-300">404</h1>
        </div>

        {/* 错误信息 */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          หน้านี้ไม่พบ
        </h2>
        
        <p className="text-gray-600 mb-8">
          ขออภัย หน้าที่คุณกำลังมองหาไม่สามารถพบได้
        </p>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/Homepage"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiHome className="w-4 h-4" />
            กลับไปหน้าแรก
          </Link>
          
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            ย้อนกลับ
          </button>
        </div>
      </div>
    </div>
  );
}