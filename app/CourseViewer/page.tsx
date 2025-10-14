'use client';
import '../globals.css';
import React, { useState, useEffect } from 'react';
import { getCourseData } from '../components/DataCoures/supabaseDataService';
import CreditTransferApp from '../components/CreditTransfer/CreditTransferApp';

// --- นิยาม Type สำหรับข้อมูล ---
interface Category {
    id: number;
    name: string;
}

interface Subcategory {
    id: number;
    category_id: number;
    name: string;
}

interface Course {
    id: number;
    subcategory_id: number;
    code: string;
    name: string;
    credit?: string;
    type?: string;
    description?: string;
}

export default function CourseViewer() {
    // --- State สำหรับการดึงข้อมูล ---
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [coursesCE, setCoursesCE] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // --- State สำหรับจัดการการแสดงผล ---
    const [view, setView] = useState<{ type: string; id: number | null }>({ type: 'overview', id: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(new Set());
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- ดึงข้อมูลจาก Supabase เมื่อ Component โหลด ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getCourseData();
                setCategories(data.categories);
                setSubcategories(data.subcategories);
                setCoursesCE(data.coursesCE);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- ฟังก์ชันสำหรับจัดการ UI ---

    const toggleDescription = (courseId: number) => {
        setExpandedDescriptions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(courseId)) {
                newSet.delete(courseId);
            } else {
                newSet.add(courseId);
            }
            return newSet;
        });
    };

    const handleViewChange = (type: string, id: number | null) => {
        setView({ type, id });
        setSearchTerm(''); // รีเซ็ตการค้นหา
        setExpandedDescriptions(new Set()); // รีเซ็ตการเปิดดูคำอธิบาย
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsSidebarOpen(false); // ปิด Sidebar บนมือถือเมื่อเลือกเมนู
        }
    };

    // --- ส่วนแสดงผลระหว่างโหลดหรือเมื่อเกิดข้อผิดพลาด ---
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">กำลังโหลดข้อมูล...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen">เกิดข้อผิดพลาด: {error}</div>;
    }

    // --- Render Content based on view state ---
    const renderContent = () => {
        switch (view.type) {
            case 'category':
                const category = categories.find(c => c.id === view.id);
                const relevantSubcategories = subcategories.filter(s => s.category_id === view.id);
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">รายการกลุ่มวิชา: {category?.name}</h2>
                        <div className="overflow-hidden bg-white rounded-lg shadow-md">
                            <table className="w-full text-left">
                                <thead className="text-white bg-blue-600">
                                    <tr>
                                        <th className="p-4 font-bold">รหัสกลุ่ม</th>
                                        <th className="p-4 font-bold">ชื่อกลุ่มวิชา</th>
                                        <th className="p-4 font-bold">จำนวนรายวิชา</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relevantSubcategories.map((sub, index) => {
                                        const courseCount = coursesCE.filter(c => c.subcategory_id === sub.id).length;
                                        if (courseCount === 0) return null;
                                        return (
                                            <tr key={sub.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                                <td className="p-4">{category?.id}.{index + 1}</td>
                                                <td className="p-4">{sub.name}</td>
                                                <td className="p-4">{courseCount}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'subcategory':
                const subcategory = subcategories.find(s => s.id === view.id);
                const subcategoryCourses = coursesCE.filter(c => c.subcategory_id === view.id);
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">รายการรายวิชา: {subcategory?.name}</h2>
                        <div className="overflow-hidden bg-white rounded-lg shadow-md">
                           <table className="w-full text-left">
                                <thead className="text-white bg-blue-600">
                                    <tr>
                                        <th className="p-4 font-bold">ลำดับ</th>
                                        <th className="p-4 font-bold">รหัสวิชา</th>
                                        <th className="p-4 font-bold">ชื่อรายวิชา</th>
                                        <th className="p-4 font-bold">ประเภท</th>
                                        <th className="p-4 font-bold">หน่วยกิต</th>
                                        <th className="p-4 font-bold">รายละเอียด</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subcategoryCourses.map((course, index) => (
                                        <React.Fragment key={course.id}>
                                            <tr className="border-b last:border-b-0 hover:bg-gray-50">
                                                <td className="p-4">{index + 1}</td>
                                                <td className="p-4">{course.code}</td>
                                                <td className="p-4">{course.name}</td>
                                                <td className="p-4">{course.type}</td>
                                                <td className="p-4">{course.credit}</td>
                                                <td className="p-4 text-center">
                                                    <button onClick={() => toggleDescription(course.id)} className="px-3 py-1 text-sm font-semibold text-white bg-indigo-500 rounded-md shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                        {expandedDescriptions.has(course.id) ? 'ซ่อน' : 'แสดง'}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedDescriptions.has(course.id) && (
                                                <tr className="bg-indigo-50">
                                                    <td colSpan={6} className="p-4 text-sm text-gray-800">
                                                        <strong className="text-indigo-800">คำอธิบายรายวิชา:</strong> {course.description}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            
            case 'overview':
            default:
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">ภาพรวมโครงสร้างหลักสูตร</h2>
                        <div className="overflow-hidden bg-white rounded-lg shadow-md">
                            <table className="w-full text-left">
                                <thead className="text-white bg-indigo-600">
                                    <tr>
                                        <th className="p-4 font-bold">ลำดับ</th>
                                        <th className="p-4 font-bold">ชื่อหมวดวิชา</th>
                                        <th className="p-4 font-bold">หน่วยกิต (บังคับ)</th>
                                        <th className="p-4 font-bold">หน่วยกิต (เลือก)</th>
                                        <th className="p-4 font-bold">รวม</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat, index) => (
                                        <tr key={cat.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                            <td className="p-4">{index + 1}</td>
                                            <td className="p-4">{cat.name}</td>
                                            <td className="p-4">{cat.id === 1 ? '9' : (cat.id === 2 ? '72' : '0')}</td>
                                            <td className="p-4">{cat.id === 1 ? '21' : (cat.id === 2 ? '18' : '6')}</td>
                                            <td className="p-4">{cat.id === 1 ? '30' : (cat.id === 2 ? '90' : '6')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
        }
    };
    
    // --- Global search results ---
    const globalFilteredCourses = searchTerm 
        ? coursesCE.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.code.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];

    return (
        <div className="relative flex min-h-screen font-sans">
            {/* Overlay for mobile */}
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"></div>}

            {/* --- Sidebar --- */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-80 flex-shrink-0 bg-white border-r border-gray-200 p-5 shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-blue-700">
                        สาขาวิชาวิศวกรรมคอมพิวเตอร์
                    </h3>
                    <button className="p-1 md:hidden" onClick={() => setIsSidebarOpen(false)}>
                       <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <nav className="mt-5">
                    <ul>
                        {categories.map(cat => {
                            const subs = subcategories.filter(s => s.category_id === cat.id);
                            const courseCount = coursesCE.filter(c => subs.some(s => s.id === c.subcategory_id)).length;
                            const isActive = !searchTerm && view.type === 'category' && view.id === cat.id;
                            
                            return (
                                <li key={cat.id} className="my-1">
                                    <a href="#" onClick={() => handleViewChange('category', cat.id)} className={`flex items-center w-full p-2.5 text-sm rounded-md transition-colors ${isActive ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}>
                                        <span className="mr-3">📁</span>
                                        {cat.name} ({courseCount})
                                    </a>
                                    <ul className="pl-4 mt-1">
                                        {subs.map(sub => {
                                            const subCourseCount = coursesCE.filter(c => c.subcategory_id === sub.id).length;
                                            if (subCourseCount === 0) return null;
                                            const isSubActive = !searchTerm && view.type === 'subcategory' && view.id === sub.id;
                                            return (
                                                <li key={sub.id} className="my-1">
                                                    <a href="#" onClick={(e) => { e.stopPropagation(); handleViewChange('subcategory', sub.id); }} className={`flex items-center w-full p-2.5 text-sm rounded-md transition-colors ${isSubActive ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}>
                                                        <span className="mr-3">📄</span>
                                                        {sub.name} ({subCourseCount})
                                                    </a>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </li>
                            );
                        })}
                    </ul>
                    <div className='mt-6 flex flex-wrap gap-2'>
                        <button onClick={() => handleViewChange('overview', null)} className="p-2 text-sm text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300">ภาพรวม</button>
                        <button onClick={() => window.location.href="/Homepage"} className="p-2 text-sm text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300">กลับหน้าแรก</button>
                        <button onClick={() => window.location.href="/EditprofileUsers"} className="p-2 text-sm text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300">โปรไฟล์</button>
                    </div>
                </nav>
            </aside>

            {/* --- Main Content --- */}
            <main className="flex-grow p-6 bg-gray-50">
                <div className="flex items-center mb-6 md:hidden">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <span className="ml-3 font-semibold text-gray-700">เมนู</span>
                </div>

                <div className="search-bar mb-6 flex items-center">
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="ค้นหารายวิชาทั้งหมดในหลักสูตร..." className="w-full p-3 text-base text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                    <img className='ml-2 h-14 w-auto hidden sm:block' src="/EN.jpg" alt="Logo" />
                </div>
                
                <div id="content-display">
                    {searchTerm ? (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">ผลการค้นหาสำหรับ: "{searchTerm}"</h2>
                            <div className="overflow-hidden bg-white rounded-lg shadow-md">
                                <table className="w-full text-left">
                                    <thead className="text-white bg-blue-600">
                                        <tr>
                                            <th className="p-4 font-bold">รหัสวิชา</th>
                                            <th className="p-4 font-bold">ชื่อรายวิชา</th>
                                            <th className="p-4 font-bold">กลุ่มวิชา</th>
                                            <th className="p-4 font-bold">หน่วยกิต</th>
                                            <th className="p-4 font-bold text-center">รายละเอียด</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {globalFilteredCourses.length > 0 ? (
                                            globalFilteredCourses.map(course => {
                                                const sub = subcategories.find(s => s.id === course.subcategory_id);
                                                return (
                                                    <React.Fragment key={course.id}>
                                                        <tr className="border-b last:border-b-0 hover:bg-gray-50">
                                                            <td className="p-4">{course.code}</td>
                                                            <td className="p-4">{course.name}</td>
                                                            <td className="p-4 text-sm text-gray-600">{sub ? sub.name : 'N/A'}</td>
                                                            <td className="p-4">{course.credit}</td>
                                                            <td className="p-4 text-center">
                                                                <button onClick={() => toggleDescription(course.id)} className="px-3 py-1 text-sm font-semibold text-white bg-indigo-500 rounded-md shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                                    {expandedDescriptions.has(course.id) ? 'ซ่อน' : 'แสดง'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                        {expandedDescriptions.has(course.id) && (
                                                            <tr className="bg-indigo-50">
                                                                <td colSpan={5} className="p-4 text-sm text-gray-800">
                                                                    <strong className="text-indigo-800">คำอธิบายรายวิชา:</strong> {course.description}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-4 text-center text-gray-500">ไม่พบรายวิชาที่ตรงกับคำค้นหา</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        renderContent()
                    )}
                </div>
                
                {/* --- THIS IS THE CORRECTED PART --- */}
                <div className="mt-8">
                  {/* We now pass the 'coursesCE' state as a prop. */}
                  {/* We also check that loading is done and data exists before rendering. */}
                  {!loading && coursesCE && coursesCE.length > 0 && (
                      <CreditTransferApp coursesCE={coursesCE} />
                  )}
                </div>

            </main>
        </div>
    );
}