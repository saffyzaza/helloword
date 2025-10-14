import { createClient } from '@supabase/supabase-js';

// --- Type Definitions (Assuming these are defined globally or imported) ---
export interface User {
    id: number;
    fullName: string | null;
    studentId: string | null;
    email: string | null;
    role: string | null;
    description?: { [key: string]: any } | null;
    password?: string; // Only for creating/updating
}
export interface Course {
    id: number;
    subcategory_id: number;
    code: string;
    name: string;
    credit?: string | null;
    type?: string | null;
    description?: string | null;
}
export interface Category {
    id: number;
    name: string;
}
export interface Subcategory {
    id: number;
    category_id: number;
    name: string;
}


// --- Supabase Client Initialization ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// --- Main Data Fetching Function ---
export async function getAdminData() {
    const [users, courses, categories, subcategories] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('courses').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('subcategories').select('*')
    ]);

    if (users.error) throw new Error(`Failed to fetch users: ${users.error.message}`);
    if (courses.error) throw new Error(`Failed to fetch courses: ${courses.error.message}`);
    if (categories.error) throw new Error(`Failed to fetch categories: ${categories.error.message}`);
    if (subcategories.error) throw new Error(`Failed to fetch subcategories: ${subcategories.error.message}`);

    return {
        users: users.data as User[],
        courses: courses.data as Course[],
        categories: categories.data as Category[],
        subcategories: subcategories.data as Subcategory[]
    };
}

// --- User Management ---
export async function addUser(userData: Partial<User>) {
    // In a real application, the password should be hashed on the server-side before storing.
    // This is a simplified example.
    const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();
    if (error) throw new Error(`Error adding user: ${error.message}`);
    return data as User;
}

export async function updateUser(id: number, userData: Partial<User>) {
    const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id)
        .select()
        .single();
    if (error) throw new Error(`Error updating user: ${error.message}`);
    return data as User;
}

export async function deleteUser(id: number) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw new Error(`Error deleting user: ${error.message}`);
    return true;
}

// --- Course Management ---
export async function addCourse(courseData: Partial<Course>) {
    const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single();
    if (error) throw new Error(`Error adding course: ${error.message}`);
    return data as Course;
}

export async function updateCourse(id: number, courseData: Partial<Course>) {
    const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', id)
        .select()
        .single();
    if (error) throw new Error(`Error updating course: ${error.message}`);
    return data as Course;
}

export async function deleteCourse(id: number) {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw new Error(`Error deleting course: ${error.message}`);
    return true;
}

// --- Category Management ---
export async function addCategory(categoryData: Partial<Category>) {
    const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();
    if (error) throw new Error(`Error adding category: ${error.message}`);
    return data as Category;
}

export async function updateCategory(id: number, categoryData: Partial<Category>) {
    const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();
    if (error) throw new Error(`Error updating category: ${error.message}`);
    return data as Category;
}

export async function deleteCategory(id: number) {
    // Note: You might need to handle subcategories linked to this category first.
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(`Error deleting category: ${error.message}`);
    return true;
}


// --- Subcategory Management ---
export async function addSubcategory(subcategoryData: Partial<Subcategory>) {
    const { data, error } = await supabase
        .from('subcategories')
        .insert([subcategoryData])
        .select()
        .single();
    if (error) throw new Error(`Error adding subcategory: ${error.message}`);
    return data as Subcategory;
}

export async function updateSubcategory(id: number, subcategoryData: Partial<Subcategory>) {
    const { data, error } = await supabase
        .from('subcategories')
        .update(subcategoryData)
        .eq('id', id)
        .select()
        .single();
    if (error) throw new Error(`Error updating subcategory: ${error.message}`);
    return data as Subcategory;
}

export async function deleteSubcategory(id: number) {
     // Note: You might need to handle courses linked to this subcategory first.
    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) throw new Error(`Error deleting subcategory: ${error.message}`);
    return true;
}

