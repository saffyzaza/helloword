"use client";

import './globals.css'
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-md text-center">
        <img className='h-20 w-auto mx-auto' src="/logo_ksu.png" alt="KSU Logo"/>
        <p className="mb-6 mt-4">ระบบเข้าสู่ระบบสำหรับนักเรียน/นักศึกษา และอาจารย์</p>
        <Link href="/login">
          <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">เข้าสู่ระบบ</button>
        </Link>
      </div>
    </main>
  );
}


