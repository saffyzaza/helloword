'use client';
import '../../globals.css';
import React, { useState, useEffect, useCallback } from 'react';
import { getAdminData, updateUser, deleteUser, addCourse, updateCourse, deleteCourse, User, Course, Category, Subcategory, addCategory, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory, addUser } from '../../components/DataCoures/AdminService';
import { Users, Book, Edit, Trash2, PlusCircle, X, Save, Shield, Folder, FileText, AlertTriangle, CheckCircle, Info, Link as LinkIcon, ChevronDown, ChevronUp, Lock } from 'lucide-react';

// --- Type Definitions for Props ---
interface ToastProps { message: string; type: 'success' | 'error'; onDismiss: () => void; }
interface ConfirmationModalProps { message: string; onConfirm: () => void; onCancel: () => void; }
interface UserModalProps { user: Partial<User> | null; onClose: () => void; onSave: (user: Partial<User>) => void; }
interface CourseEditModalProps { course: Partial<Course> | null; categories: Category[]; subcategories: Subcategory[]; onClose: () => void; onSave: (course: Partial<Course>) => void; }
interface CategoryEditModalProps { category: Partial<Category> | null; onClose: () => void; onSave: (category: Partial<Category>) => void; }
interface SubcategoryEditModalProps { subcategory: Partial<Subcategory> | null; categories: Category[]; onClose: () => void; onSave: (subcategory: Partial<Subcategory>) => void; }


// --- Main Admin Page Component ---
export default function AdminPage() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'categories'>('users');
    const [data, setData] = useState<{ users: User[], courses: Course[], categories: Category[], subcategories: Subcategory[] }>({ users: [], courses: [], categories: [], subcategories: [] });
    
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ message: string, onConfirm: () => void } | null>(null);

    const [modal, setModal] = useState<string | null>(null);
    const [editingData, setEditingData] = useState<any>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [expandedUser, setExpandedUser] = useState<number | null>(null);

    // --- Authorization Check ---
    useEffect(() => {
        // In a real app, you would get the user from a proper auth context
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
            // Check for 'admin' role. In your case, it could be 'teacher'
            if (user.role === 'admin' || user.role === 'teacher') {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } else {
            setIsAuthorized(false);
        }
    }, []);

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        if (!isAuthorized) return; // Don't fetch data if not authorized
        try {
            setLoading(true);
            const adminData = await getAdminData();
            setData(adminData);
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [isAuthorized]);

    useEffect(() => {
        if (isAuthorized) {
            fetchData();
        }
    }, [isAuthorized, fetchData]);

    // --- UI Helpers ---
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const openModal = (modalName: string, data: any) => {
        setEditingData(data);
        setModal(modalName);
    };

    const closeModal = () => {
        setModal(null);
        setEditingData(null);
    };
    
    const openConfirmModal = (message: string, onConfirm: () => void) => {
        setConfirmModal({ message, onConfirm });
    };

    // --- Handlers ---
    const handleSave = async (type: string, dataToSave: any) => {
        try {
            const isNew = !dataToSave.id;
            switch(type) {
                case 'user': {
                    if (isNew) {
                        // FIX: Generate a temporary client-side ID to prevent null-id error
                        const newUserId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
                        const result = await addUser({ ...dataToSave, id: newUserId });
                        setData(d => ({ ...d, users: [...d.users, result] }));
                    } else {
                        const result = await updateUser(dataToSave.id, dataToSave);
                        setData(d => ({ ...d, users: d.users.map(u => u.id === result.id ? result : u) }));
                    }
                    break;
                }
                case 'course': {
                    if (isNew) {
                        // เพิ่มส่วนนี้เข้าไป: สร้าง ID ชั่วคราวสำหรับรายวิชาใหม่
                        const newCourseId = data.courses.length > 0 ? Math.max(...data.courses.map(c => c.id)) + 1 : 1;
                        const result = await addCourse({ ...dataToSave, id: newCourseId });
                        setData(d => ({...d, courses: [...d.courses, result]}));
                    } else {
                        const result = await updateCourse(dataToSave.id, dataToSave);
                        setData(d => ({...d, courses: d.courses.map(c => c.id === result.id ? result : c)}));
                    }
                    break;
                }
                case 'category': {
                    if (isNew) {
                        // เพิ่มส่วนนี้: สร้าง ID ชั่วคราวสำหรับ Category ใหม่
                        const newCatId = data.categories.length > 0 ? Math.max(...data.categories.map(c => c.id)) + 1 : 1;
                        const result = await addCategory({ ...dataToSave, id: newCatId });
                        setData(d => ({...d, categories: [...d.categories, result]}));
                    } else {
                        const result = await updateCategory(dataToSave.id, dataToSave);
                        setData(d => ({...d, categories: d.categories.map(c => c.id === result.id ? result : c)}));
                    }
                    break;
                }
                case 'subcategory': {
                    if (isNew) {
                        // เพิ่มส่วนนี้: สร้าง ID ชั่วคราวสำหรับ Subcategory ใหม่
                        const newSubcatId = data.subcategories.length > 0 ? Math.max(...data.subcategories.map(s => s.id)) + 1 : 1;
                        const result = await addSubcategory({ ...dataToSave, id: newSubcatId });
                        setData(d => ({...d, subcategories: [...d.subcategories, result]}));
                    } else {
                        const result = await updateSubcategory(dataToSave.id, dataToSave);
                        setData(d => ({...d, subcategories: d.subcategories.map(s => s.id === result.id ? result : s)}));
                    }
                    break;
                }
            }
            showToast('บันทึกข้อมูลสำเร็จ', 'success');
            closeModal();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };
    
    const handleDelete = (type: string, id: number) => {
        openConfirmModal('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?', async () => {
            try {
                switch(type) {
                    case 'user':
                        await deleteUser(id);
                        setData(d => ({...d, users: d.users.filter(u => u.id !== id)}));
                        break;
                    case 'course':
                        await deleteCourse(id);
                        setData(d => ({...d, courses: d.courses.filter(c => c.id !== id)}));
                        break;
                    case 'category':
                        await deleteCategory(id);
                        setData(d => ({...d, categories: d.categories.filter(c => c.id !== id)}));
                        break;
                    case 'subcategory':
                        await deleteSubcategory(id);
                        setData(d => ({...d, subcategories: d.subcategories.filter(s => s.id !== id)}));
                        break;
                }
                showToast('ลบข้อมูลสำเร็จ', 'success');
                setConfirmModal(null);
            } catch (err: any) {
                showToast(err.message, 'error');
                setConfirmModal(null);
            }
        });
    };
    
    const handleTransferDelete = (user: User, logKey: string) => {
        if (!user.description) return;
        openConfirmModal(`คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการเทียบโอน '${logKey}'?`, async () => {
            const newDescription = { ...user.description };
            delete newDescription[logKey];
            try {
                const savedUser = await updateUser(user.id, { ...user, description: newDescription });
                setData(d => ({...d, users: d.users.map(u => u.id === savedUser.id ? savedUser : u)}));
                showToast('ลบประวัติการเทียบโอนสำเร็จ', 'success');
                setConfirmModal(null);
            } catch (err: any) {
                showToast(err.message, 'error');
                setConfirmModal(null);
            }
        });
    };

    // --- Authorization Render ---
    if (isAuthorized === null) {
        return <div className="flex justify-center items-center min-h-screen">กำลังตรวจสอบสิทธิ์...</div>;
    }
    if (!isAuthorized) {
        return <AccessDenied />;
    }

    // --- Filtered Data ---
    const filteredUsers = data.users.filter(u => u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || u.studentId?.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredCourses = data.courses.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredCategories = data.categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const renderContent = () => {
        if (loading) return <SkeletonLoader type={activeTab} />;
        switch(activeTab) {
            case 'users': return <UserManagementTable users={filteredUsers} onEdit={(user) => openModal('user', user)} onDelete={(id) => handleDelete('user', id)} expandedUser={expandedUser} setExpandedUser={setExpandedUser} onTransferDelete={handleTransferDelete} />;
            case 'courses': return <CourseManagementTable courses={filteredCourses} onEdit={(course) => openModal('course', course)} onDelete={(id) => handleDelete('course', id)} />;
            case 'categories': return <CategoryManagement categories={filteredCategories} subcategories={data.subcategories} onEdit={(type, data) => openModal(type, data)} onDelete={handleDelete} onAddSubcategory={(catId) => openModal('subcategory', { name: '', category_id: catId })} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">หน้าจัดการสำหรับผู้ดูแลระบบ</h1>
                    <div className="flex items-center gap-4">
                        <p className="text-gray-500">จัดการข้อมูลผู้ใช้งาน, รายวิชา, และหมวดหมู่</p>
                        <a href="/EditprofileUsers/Dashboard" className="flex items-center gap-1 text-indigo-600 hover:underline text-sm"><LinkIcon size={14}/> ไปยัง Dashboard</a>
                    </div>
                </header>
                
                <div className="flex border-b border-gray-200 mb-6 flex-wrap">
                    <button onClick={() => setActiveTab('users')} className={`py-2 px-4 text-lg font-semibold ${activeTab === 'users' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>จัดการผู้ใช้ ({data.users.length})</button>
                    <button onClick={() => setActiveTab('courses')} className={`py-2 px-4 text-lg font-semibold ${activeTab === 'courses' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>จัดการรายวิชา ({data.courses.length})</button>
                    <button onClick={() => setActiveTab('categories')} className={`py-2 px-4 text-lg font-semibold ${activeTab === 'categories' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>จัดการหมวดหมู่</button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <input type="text" placeholder="ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-lg"/>
                    <div className="flex gap-2 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
                        {activeTab === 'users' && <button onClick={() => openModal('user', { fullName: '', studentId: '', email: '', password: '', role: 'student' })} className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"><PlusCircle size={20}/> เพิ่มผู้ใช้ใหม่</button>}
                        {activeTab === 'courses' && <button onClick={() => openModal('course', { name: '', code: '', credit: '', type: '', description: '', subcategory_id: 0 })} className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition"><PlusCircle size={20}/> เพิ่มวิชาใหม่</button>}
                        {activeTab === 'categories' && <button onClick={() => openModal('category', { name: '' })} className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700 transition"><PlusCircle size={20}/> เพิ่มหมวดหมู่ใหม่</button>}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md overflow-hidden">{renderContent()}</div>
            </div>

            {/* --- Modals and Toasts --- */}
            {modal === 'user' && <UserModal user={editingData} onClose={closeModal} onSave={(data) => handleSave('user', data)} />}
            {modal === 'course' && <CourseEditModal course={editingData} categories={data.categories} subcategories={data.subcategories} onClose={closeModal} onSave={(data) => handleSave('course', data)} />}
            {modal === 'category' && <CategoryEditModal category={editingData} onClose={closeModal} onSave={(data) => handleSave('category', data)} />}
            {modal === 'subcategory' && <SubcategoryEditModal subcategory={editingData} categories={data.categories} onClose={closeModal} onSave={(data) => handleSave('subcategory', data)} />}
            {confirmModal && <ConfirmationModal message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />}
            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        </div>
    );
}

// --- Reusable Components (Fully Implemented) ---

const AccessDenied = () => (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-center">
        <Lock size={64} className="text-red-500 mb-4" />
        <h1 className="text-4xl font-bold text-gray-800">Access Denied</h1>
        <p className="text-lg text-gray-600 mt-2">คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้</p>
        <p className="text-gray-500">กรุณาติดต่อผู้ดูแลระบบหากคุณเชื่อว่านี่เป็นข้อผิดพลาด</p>
        <a href="/" className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">กลับสู่หน้าหลัก</a>
    </div>
);

const UserManagementTable: React.FC<{users: User[], onEdit: (user: User) => void, onDelete: (id: number) => void, expandedUser: number | null, setExpandedUser: (id: number | null) => void, onTransferDelete: (user: User, logKey: string) => void}> = ({ users, onEdit, onDelete, expandedUser, setExpandedUser, onTransferDelete }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-gray-50 border-b">
                    <th className="p-4 w-12"></th>
                    <th className="p-4 font-semibold">ชื่อ-สกุล</th>
                    <th className="p-4 font-semibold">รหัสนักศึกษา</th>
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <React.Fragment key={user.id}>
                        <tr className="border-b hover:bg-gray-50">
                            <td className="p-4">
                                <button onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)} className="text-gray-500 hover:text-gray-800">
                                    {expandedUser === user.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </td>
                            <td className="p-4">{user.fullName}</td>
                            <td className="p-4">{user.studentId}</td>
                            <td className="p-4">{user.email}</td>
                            <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' || user.role === 'teacher' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span></td>
                            <td className="p-4 flex gap-2 justify-center">
                                <button onClick={() => onEdit(user)} className="text-blue-600 hover:text-blue-800"><Edit size={20}/></button>
                                <button onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-800"><Trash2 size={20}/></button>
                            </td>
                        </tr>
                        {expandedUser === user.id && (
                             <tr>
                                <td colSpan={6} className="p-4 bg-indigo-50">
                                    <h4 className="font-bold mb-2 text-indigo-800">ประวัติการเทียบโอน:</h4>
                                    {user.description && Object.keys(user.description).length > 0 ? (
                                        <ul className="list-disc pl-5 space-y-2 text-sm">
                                            {Object.entries(user.description).map(([key, value]: [string, any]) => (
                                                <li key={key} className="flex justify-between items-center">
                                                    <div>
                                                        <strong className="font-mono">{key}</strong>: {value.sourceCourseName || 'N/A'} ({value.sourceCourseCode || 'N/A'})
                                                        <p className="text-xs text-gray-500 italic">เหตุผล: {value.reason}</p>
                                                    </div>
                                                    <button onClick={() => onTransferDelete(user, key)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className="text-gray-500">ไม่มีข้อมูลการเทียบโอน</p>}
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    </div>
);

const CourseManagementTable: React.FC<{courses: Course[], onEdit: (course: Course) => void, onDelete: (id: number) => void}> = ({ courses, onEdit, onDelete }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-gray-50 border-b">
                    <th className="p-4 font-semibold">รหัสวิชา</th>
                    <th className="p-4 font-semibold">ชื่อวิชา</th>
                    <th className="p-4 font-semibold">หน่วยกิต</th>
                    <th className="p-4 font-semibold">ประเภท</th>
                    <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                {courses.map(course => (
                    <tr key={course.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-mono">{course.code}</td>
                        <td className="p-4">{course.name}</td>
                        <td className="p-4">{course.credit}</td>
                        <td className="p-4">{course.type}</td>
                        <td className="p-4 flex gap-2 justify-center">
                            <button onClick={() => onEdit(course)} className="text-blue-600 hover:text-blue-800"><Edit size={20}/></button>
                            <button onClick={() => onDelete(course.id)} className="text-red-600 hover:text-red-800"><Trash2 size={20}/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const CategoryManagement: React.FC<{categories: Category[], subcategories: Subcategory[], onEdit: (type: 'category' | 'subcategory', data: any) => void, onDelete: (type: string, id: number) => void, onAddSubcategory: (categoryId: number) => void}> = ({ categories, subcategories, onEdit, onDelete, onAddSubcategory }) => (
    <div className="space-y-6">
        {categories.map(cat => (
            <div key={cat.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                        <Folder className="text-purple-600"/>
                        <h3 className="text-xl font-bold text-gray-800">{cat.name}</h3>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => onAddSubcategory(cat.id)} className="text-green-600 hover:text-green-800"><PlusCircle size={20}/></button>
                        <button onClick={() => onEdit('category', cat)} className="text-blue-600 hover:text-blue-800"><Edit size={20}/></button>
                        <button onClick={() => onDelete('category', cat.id)} className="text-red-600 hover:text-red-800"><Trash2 size={20}/></button>
                    </div>
                </div>
                <ul className="pl-6 border-l-2 border-purple-200 space-y-2">
                    {subcategories.filter(sub => sub.category_id === cat.id).map(sub => (
                         <li key={sub.id} className="flex justify-between items-center p-2 rounded-md hover:bg-purple-100">
                             <div className="flex items-center gap-2">
                                <FileText size={16} className="text-gray-500"/>
                                <span>{sub.name}</span>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => onEdit('subcategory', sub)} className="text-blue-500 hover:text-blue-700"><Edit size={18}/></button>
                                <button onClick={() => onDelete('subcategory', sub.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                            </div>
                         </li>
                    ))}
                     <li className="p-2">
                        <button onClick={() => onAddSubcategory(cat.id)} className="text-sm text-green-600 hover:underline flex items-center gap-1">
                            <PlusCircle size={16}/> เพิ่มกลุ่มวิชาใหม่
                        </button>
                    </li>
                </ul>
            </div>
        ))}
    </div>
);

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState(user);
    const isNewUser = !user?.id;
    if (!formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{isNewUser ? 'สร้างบัญชีผู้ใช้ใหม่' : 'แก้ไขข้อมูลผู้ใช้'}</h2>
                    <button onClick={onClose}><X size={24}/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700">ชื่อ-สกุล</label><input type="text" name="fullName" value={formData.fullName || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                        <div><label className="block text-sm font-medium text-gray-700">รหัสนักศึกษา</label><input type="text" name="studentId" value={formData.studentId || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                        <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} disabled={!isNewUser} className={`w-full mt-1 p-2 border rounded-md ${!isNewUser ? 'bg-gray-100' : ''}`}/></div>
                        {isNewUser && (
                             <div><label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label><input type="password" name="password" value={formData.password || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                        )}
                        <div><label className="block text-sm font-medium text-gray-700">Role</label>
                            <select name="role" value={formData.role || 'student'} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md">
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">ยกเลิก</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"><Save size={16}/> บันทึก</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CourseEditModal: React.FC<CourseEditModalProps> = ({ course, categories, subcategories, onClose, onSave }) => {
    const [formData, setFormData] = useState(course);
    if (!formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
     const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, subcategory_id: parseInt(e.target.value) });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{formData.id ? 'แก้ไขรายวิชา' : 'เพิ่มรายวิชาใหม่'}</h2>
                    <button onClick={onClose}><X size={24}/></button>
                </div>
                <form onSubmit={handleSubmit}>
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium">รหัสวิชา</label><input type="text" name="code" value={formData.code || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded"/></div>
                        <div className="col-span-2 sm:col-span-1"><label className="block text-sm font-medium">ชื่อวิชา</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded"/></div>
                        <div><label className="block text-sm font-medium">หน่วยกิต</label><input type="text" name="credit" value={formData.credit || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded"/></div>
                        <div><label className="block text-sm font-medium">ประเภท</label><input type="text" name="type" value={formData.type || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded"/></div>
                        <div className="col-span-2"><label className="block text-sm font-medium">กลุ่มวิชา (Subcategory)</label>
                            <select name="subcategory_id" value={formData.subcategory_id || ''} onChange={handleSubcategoryChange} className="w-full mt-1 p-2 border rounded">
                                <option value="">-- เลือกกลุ่มวิชา --</option>
                                {categories.map(cat => (
                                    <optgroup label={cat.name} key={cat.id}>
                                        {subcategories.filter(sub => sub.category_id === cat.id).map(sub => (
                                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2"><label className="block text-sm font-medium">คำอธิบายรายวิชา</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4} className="w-full mt-1 p-2 border rounded"></textarea></div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">ยกเลิก</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center gap-2"><Save size={16}/> บันทึก</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({ category, onClose, onSave }) => {
    const [formData, setFormData] = useState(category);
    if (!formData) return null;
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{formData.id ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}</h2>
                <form onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium">ชื่อหมวดหมู่</label>
                    <input type="text" value={formData.name || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">ยกเลิก</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">บันทึก</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SubcategoryEditModal: React.FC<SubcategoryEditModalProps> = ({ subcategory, categories, onClose, onSave }) => {
    const [formData, setFormData] = useState(subcategory);
    if (!formData) return null;
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({...formData, category_id: Number(formData.category_id)}); };

    return (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{formData.id ? 'แก้ไขกลุ่มวิชา' : 'เพิ่มกลุ่มวิชาใหม่'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                         <div><label className="block text-sm font-medium">ชื่อกลุ่มวิชา</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded"/></div>
                         <div><label className="block text-sm font-medium">อยู่ภายใต้หมวดหมู่</label>
                            <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full mt-1 p-2 border rounded">
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                         </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">ยกเลิก</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">บันทึก</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg w-full max-w-md text-center">
            <AlertTriangle size={48} className="mx-auto text-red-500 mb-4"/>
            <h2 className="text-xl font-bold mb-4">ยืนยันการกระทำ</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-center gap-4">
                <button onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300">ยกเลิก</button>
                <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">ยืนยัน</button>
            </div>
        </div>
    </div>
);

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => (
    <div className="fixed top-5 right-5 z-50">
        <div className={`flex items-center gap-4 p-4 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {type === 'success' ? <CheckCircle /> : <Info />}
            <span>{message}</span>
            <button onClick={onDismiss}><X size={20}/></button>
        </div>
    </div>
);

const SkeletonLoader: React.FC<{type: string}> = ({ type }) => (
    <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border-b">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        ))}
    </div>
);

