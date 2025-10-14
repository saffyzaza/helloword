"use client";

import '../globals.css';
import React, { useState, useEffect, useMemo } from 'react';
import { FiEdit, FiUser, FiAtSign, FiSearch, FiArrowRightCircle, FiChevronDown, FiTrash } from 'react-icons/fi';
import { supabase } from '@/lib/supabaseClient';
import ChangePasswordModal from '@/components/ChangePasswordModal';

// --- SVG Icon Components ---
const PencilIcon = FiEdit;
const AtSignIcon = FiAtSign;
const UserCircleIcon = FiUser;
const SearchIcon = FiSearch;
const ArrowRightCircleIcon = FiArrowRightCircle;
const ChevronDownIcon = FiChevronDown;
const TrashIcon = FiTrash;

// --- Interfaces ---
interface User {
    id: string;
    fullName: string;
    studentId: string;
    email: string;
    username: string;
    password: string;
    description?: Record<string, any>;
}

interface EditStudentModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: User) => void;
}


interface TransferCardProps {
    transfer: any;
    transferKey: string;
    onDelete: (key: string) => void;
}

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}


// --- Child Components ---

const EditStudentModal = ({ user, isOpen, onClose, onSave }: EditStudentModalProps) => {
    const [formData, setFormData] = useState(user ?? {} as User);
    // เปลี่ยนชื่อ state ให้สื่อถึงการยืนยันรหัสผ่าน
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setFormData(user ?? {} as User);
        setError('');
        setPasswordConfirm('');
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev: User) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!user || !user.studentId) {
            setError('ไม่พบข้อมูลผู้ใช้หรือรหัสนักศึกษา');
            return;
        }

        // --- ส่วนที่แก้ไขตามโจทย์ ---
        // 1. ดึงรหัสผ่านล่าสุดจาก Supabase โดยใช้ studentId เป็นเงื่อนไข
        const { data, error: fetchError } = await supabase
            .from('users')
            .select('password')
            .eq('studentId', user.studentId) // ค้นหาด้วย studentId
            .single();

        if (fetchError || !data) {
            setError('เกิดข้อผิดพลาดในการตรวจสอบข้อมูลผู้ใช้');
            console.error(fetchError);
            return;
        }

        // 2. เปรียบเทียบรหัสผ่านที่กรอกกับรหัสผ่านที่ดึงมา
        if (passwordConfirm !== data.password) {
            setError('รหัสผ่านไม่ถูกต้อง!');
            return;
        }

        // 3. ถ้าถูกต้อง ก็บันทึกข้อมูล
        await onSave(formData);
        onClose();
    };

    return (
        <div className="modal-overlay fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="modal-content bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">แก้ไขข้อมูลนักศึกษา</h3>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-600 mb-1">ชื่อ-สกุล</label>
                            <input type="text" id="fullName" value={formData.fullName || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"/>
                        </div>

                        {/* --- ส่วนของรหัสนักศึกษา ถูกซ่อนตามที่ต้องการ --- */}
                        {/* <div>
                            <label htmlFor="studentId" className="block text-sm font-medium text-slate-600 mb-1">รหัสนักศึกษา</label>
                            <input type="text" id="studentId" value={formData.studentId || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"/>
                        </div>
                        */}
                        
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">อีเมล</label>
                            <input type="email" id="email" value={formData.email || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"/>
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-600 mb-1">ชื่อผู้ใช้</label>
                            <input type="text" id="username" value={formData.username || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"/>
                        </div>
                        <div className="pt-2">
                            <label htmlFor="password-confirm" className="block text-sm font-medium text-slate-600 mb-1">ยืนยันรหัสผ่านเพื่อบันทึก</label>
                            <input 
                                type="password" 
                                id="password-confirm" 
                                value={passwordConfirm} 
                                onChange={(e) => setPasswordConfirm(e.target.value)} 
                                required 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition" 
                                placeholder="กรุณากรอกรหัสผ่านปัจจุบัน"
                            />
                            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors">ยกเลิก</button>
                        <button type="submit" className="py-2 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow">บันทึก</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TransferCard = ({ transfer, transferKey, onDelete }: TransferCardProps) => {
    const [expanded, setExpanded] = useState(false);
    const [isConfirmingDelete, setConfirmingDelete] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isConfirmingDelete) {
            timeout = setTimeout(() => setConfirmingDelete(false), 3000);
        }
        return () => clearTimeout(timeout);
    }, [isConfirmingDelete]);

    const handleToggleDetails = () => setExpanded(prev => !prev);
    
    const handleDeleteClick = () => {
        if (isConfirmingDelete) {
            onDelete(transferKey);
        } else {
            setConfirmingDelete(true);
        }
    };

    const date = new Date(transfer.timestamp);
    const formattedDate = date.toLocaleString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
    const sourceDisplay = (transfer.sourceCourseName && transfer.sourceCourseName.trim() !== '') ? `${transfer.source} - ${transfer.sourceCourseName}` : transfer.source;
    const targetName = transfer.targetCourseName || transfer.targetName;
    const targetDisplay = (targetName && targetName.trim() !== '') ? `${transfer.target} - ${targetName}` : transfer.target;

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-slate-600 text-base">
                            <span className="font-semibold">{sourceDisplay}</span>
                            <ArrowRightCircleIcon size={20} />
                            <span className="font-bold text-indigo-600">{targetDisplay}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">ทำรายการเมื่อ: {formattedDate}</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                        <button onClick={handleToggleDetails} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors py-2 px-4 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1">
                            <span>{expanded ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}</span>
                            <ChevronDownIcon style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} size={16} />
                        </button>
                        <button onClick={handleDeleteClick} className={`text-sm font-semibold transition-colors py-2 px-3 rounded-lg flex items-center gap-1.5 ${isConfirmingDelete ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                            <TrashIcon size={16} />
                            <span>{isConfirmingDelete ? 'ยืนยัน' : 'ลบ'}</span>
                        </button>
                    </div>
                </div>
                {expanded && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-2">รายละเอียดรายวิชาต้นทาง</p>
                            <p className="font-semibold text-slate-800">{sourceDisplay}</p>
                            <p className="text-slate-600 text-sm leading-relaxed mt-1">{transfer.sourceDescription}</p>
                        </div>
                        <div className="my-6 h-px bg-slate-100"></div>
                        <div>
                            <p className="font-semibold text-slate-600 mb-2">เหตุผลการอนุมัติ:</p>
                            <p className="text-slate-500 text-sm leading-relaxed border-l-4 border-indigo-200 pl-4">{transfer.reason}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    return (
        <div className="mt-8 flex items-center justify-center gap-2">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-lg disabled:text-slate-400 disabled:cursor-not-allowed text-slate-600 hover:bg-slate-200">
                ก่อนหน้า
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => onPageChange(page)} className={`w-8 h-8 rounded-lg ${page === currentPage ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-200'}`}>
                    {page}
                </button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-lg disabled:text-slate-400 disabled:cursor-not-allowed text-slate-600 hover:bg-slate-200">
                ถัดไป
            </button>
        </div>
    );
};

// --- Main App Component ---
export default function StudentProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchUser = async () => {
            // --- EDITED SECTION ---
            // Fetch user from localStorage as set by the custom login page
            const storedUserJSON = localStorage.getItem('user');
            
            if (!storedUserJSON) {
                // If no user in localStorage, redirect to login
                window.location.href = '/login';
                return;
            }

            try {
                const storedUser = JSON.parse(storedUserJSON);
                
                // Use studentId from localStorage to fetch the full user profile
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('studentId', storedUser.studentId) // Look up by studentId
                    .single();

                if (userError || !userData) {
                    setError('ไม่พบข้อมูลผู้ใช้ในระบบ');
                    setUser(null);
                } else {
                    setUser(userData);
                }
            } catch (e) {
                setError('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
                console.error("Failed to parse user from localStorage or fetch from Supabase", e);
                // Optionally, clear broken localStorage and redirect
                // localStorage.removeItem('user');
                // window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);
    
    const allTransfers = useMemo(() => {
        if (!user || !user.description) return [];
        return Object.entries(user.description ?? {}).map(([key, value]) => ({ ...value, key }));
    }, [user]);

    const filteredTransfers = useMemo(() => {
        return allTransfers.filter(transfer => {
            const term = searchTerm.toLowerCase();
            const sourceDisplay = (transfer.sourceCourseName || '').toLowerCase();
            const targetDisplay = (transfer.targetCourseName || transfer.targetName || '').toLowerCase();
            const source = typeof transfer.source === 'string' ? transfer.source.toLowerCase() : '';
            const target = typeof transfer.target === 'string' ? transfer.target.toLowerCase() : '';
            return source.includes(term) ||
                   sourceDisplay.includes(term) ||
                   target.includes(term) ||
                   targetDisplay.includes(term);
        });
    }, [allTransfers, searchTerm]);

    const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage);
    
    const paginatedTransfers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTransfers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTransfers, currentPage, itemsPerPage]);
    
    const handleSaveUser = async (updatedData: User) => {
        if (!user) return;
        const { id, ...updatePayload } = updatedData;
        const { data, error } = await supabase
            .from('users')
            .update(updatePayload)
            .eq('id', user.id) // Still need the database 'id' for the update query
            .select()
            .single();

        if (error) {
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            console.error(error);
        } else {
            setUser(data);
        }
    };

    const handleDeleteTransfer = async (transferKey: string) => {
        if (!user) return;
        const newDescription = { ...(user.description ?? {}) };
        delete newDescription[transferKey];

        const { data, error } = await supabase
            .from('users')
            .update({ description: newDescription })
            .eq('id', user.id)
            .select()
            .single();
        
        if (error) {
            alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            console.error(error);
        } else {
            setUser(data);
        }
    };
    
    const getInitials = (name = '') => {
        const nameParts = name.split(' ');
        return (nameParts.length > 1) 
            ? nameParts[0].charAt(0) + nameParts[1].charAt(0)
            : nameParts[0].charAt(0) || '';
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">กำลังโหลดข้อมูล...</div>;
    if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
    if (!user) return <div className="flex justify-center items-center min-h-screen">ไม่พบข้อมูลผู้ใช้</div>;
    
    return (
        <main className="bg-slate-100 text-slate-800 min-h-screen">
            <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-slate-900">ข้อมูลนักศึกษา</h1>
                    <p className="text-slate-500 mt-2">รายละเอียดและประวัติการเทียบโอนรายวิชา</p>
                </header>

                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg mb-12 relative">
                    <button onClick={() => setModalOpen(true)} className="absolute top-4 right-4 text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50">
                        <PencilIcon />
                    </button>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {user?.fullName && (
                            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-indigo-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-md">
                                {getInitials(user.fullName)}
                            </div>
                        )}
                        <div className="text-center sm:text-left">
    {user?.fullName && <h2 className="text-3xl font-bold text-indigo-700">{user.fullName}</h2>}
    {user?.studentId && <p className="text-slate-500 mt-1">รหัสนักศึกษา: {user.studentId}</p>}
    <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-sm">
        {user?.email && <div className="flex items-center gap-2 text-slate-600"><AtSignIcon /><span>{user.email}</span></div>}
        {user?.username && <div className="flex items-center gap-2 text-slate-600"><UserCircleIcon /><span>ชื่อผู้ใช้: {user.username}</span></div>}
        <button onClick={() => window.location.href="/Homepage"} className='text-indigo-600 hover:underline font-semibold'>Home</button>

        {/* --- ADD THIS BUTTON --- */}
        <button 
            onClick={() => setChangePasswordModalOpen(true)} 
            className='text-slate-500 hover:text-indigo-600 hover:underline font-semibold'
        >
            เปลี่ยนรหัสผ่าน
        </button>
        
    </div>
</div>
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold mb-4 text-slate-800 text-center sm:text-left">ประวัติการเทียบโอนรายวิชา</h3>
                    <div className="mb-4 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <SearchIcon />
                        </div>
                        <input
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="ค้นหาด้วยรหัส หรือชื่อวิชา..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-6 min-h-[200px]">
                        {paginatedTransfers.length > 0 ? (
                            paginatedTransfers.map(transfer => (
                                <TransferCard key={transfer.key} transfer={transfer} transferKey={transfer.key} onDelete={handleDeleteTransfer} />
                            ))
                        ) : (
                            <div className="text-center text-slate-500 col-span-full bg-white p-8 rounded-2xl shadow-lg">
                                <p>ไม่พบข้อมูลที่ตรงกับการค้นหา</p>
                            </div>
                        )}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </div>

            <EditStudentModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} user={user} onSave={handleSaveUser} />
            <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)} user={user} />
        </main>
    );
}
