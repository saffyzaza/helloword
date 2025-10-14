import { supabase } from '@/lib/supabaseClient';

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

/**
 * ฟังก์ชันสำหรับดึงข้อมูลทั้งหมดที่เกี่ยวกับหลักสูตรจาก Supabase
 * @returns {Promise<{categories: Category[], subcategories: Subcategory[], coursesCE: Course[]}>}
 */
export async function getCourseData() {
    // ดึงข้อมูลจากตาราง categories
    const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

    // ดึงข้อมูลจากตาราง subcategories
    const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*');

    // ดึงข้อมูลจากตาราง courses
    const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*');

    // จัดการ Error หากดึงข้อมูลไม่สำเร็จ
    if (categoriesError) throw new Error(`Cannot fetch categories: ${categoriesError.message}`);
    if (subcategoriesError) throw new Error(`Cannot fetch subcategories: ${subcategoriesError.message}`);
    if (coursesError) throw new Error(`Cannot fetch courses: ${coursesError.message}`);

    // ส่งข้อมูลกลับในรูปแบบที่เราต้องการ
    return {
        categories: (categoriesData as Category[]) || [],
        subcategories: (subcategoriesData as Subcategory[]) || [],
        coursesCE: (coursesData as Course[]) || []
    };
}