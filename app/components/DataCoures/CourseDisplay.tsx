import React, { useState, useEffect } from 'react';
import { getCourseData } from './supabaseDataService'; 
import './CourseDisplay.css';

// --- นิยาม Type ที่นี่เลย ไม่ต้อง import ---
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
// -----------------------------------------

const CourseDisplay: React.FC = () => {
  // สร้าง State เพื่อเก็บข้อมูลที่ดึงมา
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [coursesCE, setCoursesCE] = useState<Course[]>([]);
  
  // สร้าง State สำหรับสถานะการโหลด
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  if (error) {
    return <div>เกิดข้อผิดพลาด: {error}</div>;
  }

  return (
    <div className="course-container">
      <h1>หลักสูตรวิศวกรรมคอมพิวเตอร์ (ข้อมูลจาก Supabase)</h1>
      {categories.map(category => (
        <div key={category.id} className="category-section">
          <h2>{category.name}</h2>
          {subcategories
            .filter(sub => sub.category_id === category.id)
            .map(subcategory => (
              <div key={subcategory.id} className="subcategory-section">
                <h3>{subcategory.name}</h3>
                <table className="course-table">
                  <thead>
                    <tr>
                      <th>รหัสวิชา</th>
                      <th>ชื่อวิชา</th>
                      <th>หน่วยกิต</th>
                      <th>ประเภท</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coursesCE
                      .filter(course => course.subcategory_id === subcategory.id)
                      .map(course => (
                        <tr key={course.id}>
                          <td>{course.code}</td>
                          <td>
                            {course.name}
                            <p className="course-description">{course.description}</p>
                          </td>
                          <td>{course.credit}</td>
                          <td>{course.type}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default CourseDisplay;