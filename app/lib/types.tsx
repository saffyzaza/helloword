// lib/types.ts

export interface User {
    id: string;
    fullName: string;
    studentId: string;
    email: string;
    username: string;
    password: string; // ตามที่คุณมีในโปรเจกต์
    description?: Record<string, any>;
}