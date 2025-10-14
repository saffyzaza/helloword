import { createClient } from '@supabase/supabase-js';

// --- Supabase Client ---
// ควรใช้ client ที่สร้างไว้ที่ส่วนกลางของแอปพลิเคชันแทนการสร้างใหม่ทุกครั้ง
// แต่ในที่นี้จะสร้างขึ้นมาใหม่เพื่อความสมบูรณ์ของโค้ด
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TransferDetail {
    fullName: string;
    studentId: string;
    transferCount: number;
}

export interface DashboardStats {
    userCount: number;
    courseCount: number;
    categoryCount: number;
    subcategoryCount: number;
    usersWhoTransferredCount: number;
    transferDetails: TransferDetail[];
}

/**
 * ฟังก์ชันสำหรับดึงข้อมูลสถิติทั้งหมดสำหรับหน้า Dashboard
 */
export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        // 1. ดึงข้อมูลจำนวนทั้งหมด (ใช้ head: true เพื่อความเร็ว)
        const userPromise = supabase.from('users').select('*', { count: 'exact', head: true });
        const coursePromise = supabase.from('courses').select('*', { count: 'exact', head: true });
        const categoryPromise = supabase.from('categories').select('*', { count: 'exact', head: true });
        const subcategoryPromise = supabase.from('subcategories').select('*', { count: 'exact', head: true });
        
        // 2. ดึงข้อมูลผู้ใช้ที่มีการเทียบโอน
        const usersWithTransfersPromise = supabase
            .from('users')
            .select('fullName, studentId, description')
            .not('description', 'is', null)
            .neq('description', '{}'); // ตรวจสอบว่า description ไม่ใช่ object ว่าง

        const [
            { count: userCount, error: userError },
            { count: courseCount, error: courseError },
            { count: categoryCount, error: categoryError },
            { count: subcategoryCount, error: subcategoryError },
            { data: usersWithTransfers, error: transferUsersError }
        ] = await Promise.all([
            userPromise,
            coursePromise,
            categoryPromise,
            subcategoryPromise,
            usersWithTransfersPromise
        ]);

        // ตรวจสอบ Error
        if (userError) throw userError;
        if (courseError) throw courseError;
        if (categoryError) throw categoryError;
        if (subcategoryError) throw subcategoryError;
        if (transferUsersError) throw transferUsersError;
        
        // 3. ประมวลผลข้อมูลการเทียบโอน
        const transferDetails = (usersWithTransfers || [])
            .map(user => ({
                fullName: user.fullName || 'ไม่มีชื่อ',
                studentId: user.studentId || 'ไม่มีรหัส',
                // นับจำนวน key ใน object `description`
                transferCount: user.description ? Object.keys(user.description).length : 0
            }))
            .filter(user => user.transferCount > 0) // กรองคนที่ไม่มีข้อมูลเทียบโอนออก
            .sort((a, b) => b.transferCount - a.transferCount); // เรียงจากมากไปน้อย

        return {
            userCount: userCount ?? 0,
            courseCount: courseCount ?? 0,
            categoryCount: categoryCount ?? 0,
            subcategoryCount: subcategoryCount ?? 0,
            usersWhoTransferredCount: transferDetails.length,
            transferDetails: transferDetails,
        };

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // ในกรณีที่เกิดข้อผิดพลาด, ส่งค่า default กลับไปเพื่อไม่ให้หน้าแอปพัง
        return {
            userCount: 0,
            courseCount: 0,
            categoryCount: 0,
            subcategoryCount: 0,
            usersWhoTransferredCount: 0,
            transferDetails: [],
        };
    }
}
