"use client";

import '../globals.css';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Import supabase client

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const input = username.trim().toLowerCase();

    try {
      // สร้าง query เพื่อค้นหาผู้ใช้ใน Supabase
      // เราจะค้นหาโดยใช้เงื่อนไข or สำหรับ username, email, หรือ studentId
      const { data: foundUser, error: queryError } = await supabase
        .from('users') // ชื่อตารางใน Supabase
        .select('*')
        .eq('password', password) // ตรวจสอบรหัสผ่าน (ไม่ปลอดภัย)
        .eq('role', role)         // ตรวจสอบ role
        .or(`username.eq.${input},email.eq.${input},studentId.eq.${input}`)
        .single(); // .single() เพื่อให้ได้ผลลัพธ์เป็น object เดียว หรือ null

      if (queryError && queryError.code !== 'PGRST116') {
        // PGRST116 หมายถึงไม่พบข้อมูล ซึ่งเราจัดการได้ ไม่ใช่ error จริง
        console.error('Supabase query error:', queryError);
        throw new Error(queryError.message);
      }

      if (foundUser) {
        // หากเจอผู้ใช้: ทำการ Login
        console.log('Login successful for:', foundUser.fullName);

        const userToStore = {
          username: foundUser.username,
          email: foundUser.email,
          role: foundUser.role,
          fullName: foundUser.fullName,
          studentId: foundUser.studentId || '',
        };

        // เก็บข้อมูลลง localStorage
        window.localStorage.setItem('user', JSON.stringify(userToStore));

        // ไปยังหน้า Homepage
        router.push('/Homepage');
      } else {
        // หากไม่เจอ: แสดงข้อความผิดพลาด
        setError('ชื่อผู้ใช้, อีเมล/รหัสประจำตัว หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้ง');
      console.error('Login error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form className="bg-white p-8 rounded-2xl shadow-md w-80" onSubmit={handleLogin}>
        <h2 className="text-2xl font-bold mb-4 text-center">เข้าสู่ระบบ</h2>
        <div className="mb-4">
          <label className="block mb-1">ชื่อผู้ใช้, อีเมล หรือรหัสประจำตัว</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">รหัสผ่าน</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">ประเภทผู้ใช้</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={role}
            onChange={e => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="student">นักเรียน/นักศึกษา</option>
            <option value="teacher">อาจารย์</option>
          </select>
        </div>
        {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'กำลังโหลด...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  );
}
