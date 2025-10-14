'use client';
import '../../globals.css';
import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Library, ArrowRightLeft, UserCheck, BarChart3 } from 'lucide-react';
import { getDashboardStats, DashboardStats } from '../../components/DataCoures/DashboardService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Interface สำหรับ Props ของ StatCard ---
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  colorClass: string;
}

// --- Component สำหรับการ์ดแสดงสถิติ (พร้อมกำหนด Type) ---
const StatCard = ({ title, value, icon, colorClass }: StatCardProps) => (
    <div className={`p-6 bg-white rounded-2xl shadow-lg flex items-center space-x-4 border-l-4 ${colorClass}`}>
        <div className={`p-3 rounded-full bg-opacity-20 ${colorClass.replace('border-', 'bg-')}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

// --- หน้า Dashboard หลัก ---
export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await getDashboardStats();
                setStats(data);
            } catch (err: any) {
                setError("ไม่สามารถดึงข้อมูล Dashboard ได้: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-100">กำลังโหลดข้อมูล Dashboard...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-700">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <main className="container mx-auto p-4 sm:p-8">
                {/* --- Header --- */}
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-800 flex items-center">
                        <BarChart3 className="w-10 h-10 mr-3 text-indigo-600"/>
                        Dashboard ภาพรวมระบบ
                    </h1>
                    <p className="text-gray-500 mt-1">สรุปข้อมูลสำคัญของระบบเทียบโอนหน่วยกิต</p>
                </div>

                {/* --- ส่วนของการ์ดสถิติ --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard 
                        title="ผู้ใช้งานทั้งหมด" 
                        value={stats?.userCount ?? 0} 
                        icon={<Users className="w-6 h-6 text-blue-600"/>} 
                        colorClass="border-blue-500"
                    />
                    <StatCard 
                        title="ผู้ที่เคยเทียบโอน" 
                        value={stats?.usersWhoTransferredCount ?? 0} 
                        icon={<UserCheck className="w-6 h-6 text-green-600"/>} 
                        colorClass="border-green-500"
                    />
                    <StatCard 
                        title="จำนวนรายวิชาทั้งหมด" 
                        value={stats?.courseCount ?? 0} 
                        icon={<BookOpen className="w-6 h-6 text-yellow-600"/>} 
                        colorClass="border-yellow-500"
                    />
                    <StatCard 
                        title="จำนวนหมวดวิชา" 
                        value={stats?.categoryCount ?? 0} 
                        icon={<Library className="w-6 h-6 text-purple-600"/>} 
                        colorClass="border-purple-500"
                    />
                     <StatCard 
                        title="จำนวนกลุ่มวิชา" 
                        value={stats?.subcategoryCount ?? 0} 
                        icon={<Library className="w-6 h-6 text-pink-600"/>} 
                        colorClass="border-pink-500"
                    />
                </div>

                {/* --- กราฟแสดงข้อมูลการเทียบโอน --- */}
                {stats?.transferDetails && stats.transferDetails.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">กราฟสรุปการเทียบโอน</h2>
                        <div className="bg-white rounded-2xl shadow-lg p-4 h-96">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={stats.transferDetails}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="fullName" angle={-15} textAnchor="end" height={60} interval={0} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="transferCount" fill="#4f46e5" name="จำนวนวิชาที่เทียบโอน" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* --- ตารางข้อมูลการเทียบโอน --- */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <ArrowRightLeft className="w-6 h-6 mr-2 text-gray-700"/>
                        สถิติการเทียบโอนรายบุคคล
                    </h2>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 font-semibold text-gray-600">ชื่อ-สกุล</th>
                                        <th className="p-4 font-semibold text-gray-600">รหัสนักศึกษา</th>
                                        <th className="p-4 font-semibold text-gray-600 text-center">จำนวนวิชาที่เทียบโอน</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.transferDetails && stats.transferDetails.length > 0 ? (
                                        stats.transferDetails.map((user, index) => (
                                            <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-medium text-gray-800">{user.fullName}</td>
                                                <td className="p-4 text-gray-600 font-mono">{user.studentId}</td>
                                                <td className="p-4 text-center">
                                                    <span className="px-3 py-1 text-sm font-bold text-indigo-700 bg-indigo-100 rounded-full">
                                                        {user.transferCount}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-gray-500">
                                                ยังไม่มีข้อมูลการเทียบโอน
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

