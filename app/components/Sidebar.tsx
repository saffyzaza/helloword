"use client";

import { useState, useEffect, useMemo } from "react";
import { FaUser, FaSignOutAlt, FaUserEdit } from "react-icons/fa";
import { FiMenu, FiX, FiHome, FiSettings, FiUsers, FiBook, FiHelpCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { GrTransaction } from "react-icons/gr";
import { MdAdminPanelSettings } from "react-icons/md";

// สร้าง Props interface สำหรับ Component
interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  
  // --- FIX: START ---
  // 1. กำหนดค่าเริ่มต้นของ State ให้เป็นค่าคงที่ (เช่น true = หุบไว้ก่อน)
  // เพื่อให้ Server และ Client render เหมือนกันในครั้งแรก
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  // State นี้ใช้เพื่อป้องกันการ render UI ที่ต้องใช้ window object บน server
  const [hasMounted, setHasMounted] = useState(false);

  // 2. ใช้ useEffect เพื่อจัดการ Logic ที่เกี่ยวกับ 'window' ทั้งหมด
  useEffect(() => {
    // เมื่อ component ถูก mount บน client แล้ว ให้ตั้งค่า state นี้เป็น true
    setHasMounted(true);

    const handleResize = () => {
      // เมื่อปรับขนาดจอ ให้ตัดสินใจว่าจะแสดงเมนูแบบหุบหรือขยาย
      if (window.innerWidth < 768) {
        setIsCollapsed(true); // บนมือถือให้หุบเสมอ
      } else {
        setIsCollapsed(true); // บนเดสก์ท็อปให้ขยายเป็นค่าเริ่มต้น
      }
    };

    // เรียกใช้ 1 ครั้งตอนเริ่มต้นเพื่อกำหนดค่าที่ถูกต้อง
    handleResize();

    // เพิ่ม event listener และลบออกเมื่อ component unmount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // dependency array ว่างเปล่า เพื่อให้ effect นี้ทำงานครั้งเดียวตอน mount

  // --- FIX: END ---


  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [activeItem, setActiveItem] = useState<number | null>(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = window.localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser({ username: parsed.username, role: parsed.role || 'guest' });
      } else {
        setUser(null);
      }
    }
  }, []);

  const navigationItems = useMemo(() => {
    const role = user?.role?.toLowerCase();
    const studentNavItems = [ { id: 1, name: "Home", icon: <FiHome />, path: "/Homepage" },
                               { id: 2, name: "Profile", icon: <FiUsers />, path: "/EditprofileUsers" },
                                { id: 3, name: "Courses", icon: <GrTransaction />, path: "/CourseViewer" },
                                 
                                ];

    const adminNavItems = [ { id: 1, name: "Dashboard", icon: <FiHome />, path: "/Homepage" },
                            { id: 2, name: "Manage Users", icon: <FaUserEdit />, path: "/EditprofileUsers" },
                            { id: 3, name: "TransCourses", icon: <GrTransaction />, path: "/CourseViewer" },
                            { id: 4, name: "Admin Panel", icon: <MdAdminPanelSettings />, path: "/EditprofileUsers/Admin" },
                            
                             
                            ];
    const teacherNavItems = adminNavItems;

    const defaultNavItems = [ { id: 1, name: "Home", icon: <FiHome />, path: "/Homepage" },
                              { id: 2, name: "TransCourses", icon: <GrTransaction />, path: "/CourseViewer" },
                             ];

    switch (role) {
      case 'student': return studentNavItems;
      case 'teacher': return teacherNavItems;
      case 'admin': return adminNavItems;
      default: return defaultNavItems;
    }
  }, [user]);
  
  function handleItemClick(id: number, path: string): void {
    setActiveItem(id);
    window.location.href = path;
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // FIX: ถ้ายังไม่ mount บน client จะไม่ render อะไรเลย หรือ render placeholder
  // เพื่อป้องกัน hydration error อย่างสมบูรณ์
  if (!hasMounted) {
    return null; // หรือจะ return <SidebarSkeleton /> ก็ได้
  }

  return (
    <>
      <button aria-label="Toggle Menu" className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <div className={`fixed inset-0 bg-transparent bg-opacity-30 transition-opacity md:hidden z-30 ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setMobileMenuOpen(false)} />

      <aside className={`${className} flex-shrink-0 bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 ease-in-out h-screen flex flex-col fixed md:relative md:translate-x-0 z-40 ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} ${!isCollapsed && 'md:w-64'} ${isCollapsed && 'md:w-20'}`}>
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center overflow-hidden ${isCollapsed && 'md:hidden'}`}>
             <img src="../logo_ksu.png" alt="Logo" className="h-10 w-auto" />
             <span className="font-bold text-xl ml-2 dark:text-white">KSU</span>
          </div>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex bg-white dark:bg-gray-700 rounded-full p-1.5 border dark:border-gray-600 cursor-pointer shadow-sm" aria-label="Toggle Sidebar">
            {isCollapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button onClick={() => handleItemClick(item.id, item.path)} className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''} ${ activeItem === item.id ? "bg-blue-500 text-white shadow-inner" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" }`} title={isCollapsed ? item.name : ''}>
                  <span className="text-xl">{item.icon}</span>
                  <span className={`ml-4 whitespace-nowrap ${isCollapsed && "md:hidden"}`}>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className={`p-3 border-t border-gray-200 dark:border-gray-700 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0"> <FaUser size={24} className="text-gray-500 dark:text-gray-400" /> </div>
            <div className={`overflow-hidden whitespace-nowrap ${isCollapsed && "md:hidden"}`}>
              {user ? ( <> <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.username}</p> <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p> </> ) : ( <a href="/login" className="text-sm font-semibold text-blue-500 hover:underline"> Login </a> )}
            </div>
            {user && ( <button onClick={handleLogout} title="Logout" className={`text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 ${isCollapsed && 'md:hidden'}`}> <FaSignOutAlt size={20} /> </button> )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
