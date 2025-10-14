import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import React, { useState, useEffect } from 'react';


// --- NEW COMPONENT: ChangePasswordModal ---

interface ChangePasswordModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal = ({ user, isOpen, onClose }: ChangePasswordModalProps) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setError('');
            setSuccessMessage('');
            setLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        // --- Client-side validation ---
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
            setLoading(false);
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setError('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน');
            setLoading(false);
            return;
        }
        if (newPassword.length < 6) {
            setError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
            setLoading(false);
            return;
        }
        if (!user || !user.id) {
            setError('ไม่พบข้อมูลผู้ใช้');
            setLoading(false);
            return;
        }

        try {
            // 1. Verify old password
            const { data: userData, error: fetchError } = await supabase
                .from('users')
                .select('password')
                .eq('id', user.id)
                .single();

            if (fetchError || !userData) {
                throw new Error('ไม่สามารถตรวจสอบรหัสผ่านเดิมได้');
            }

            if (userData.password !== oldPassword) {
                setError('รหัสผ่านเดิมไม่ถูกต้อง');
                setLoading(false);
                return;
            }
            
            // 2. Update to new password
            const { error: updateError } = await supabase
                .from('users')
                .update({ password: newPassword })
                .eq('id', user.id);

            if (updateError) {
                throw new Error('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
            }

            setSuccessMessage('เปลี่ยนรหัสผ่านสำเร็จแล้ว!');
            // Close modal after 2 seconds
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาด โปรดลองอีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="modal-content bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">เปลี่ยนรหัสผ่าน</h3>
                <form onSubmit={handleSubmit} noValidate>
                    {successMessage ? (
                        <div className="text-center p-4 bg-green-100 text-green-700 rounded-lg">
                            {successMessage}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="oldPassword" className="block text-sm font-medium text-slate-600 mb-1">รหัสผ่านเดิม</label>
                                <input type="password" id="oldPassword" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-600 mb-1">รหัสผ่านใหม่</label>
                                <input type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
                            </div>
                            <div>
                                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-slate-600 mb-1">ยืนยันรหัสผ่านใหม่</label>
                                <input type="password" id="confirmNewPassword" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
                            </div>
                            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                        </div>
                    )}
                    
                    <div className="mt-8 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors" disabled={loading}>
                            ยกเลิก
                        </button>
                        {!successMessage && (
                             <button type="submit" className="py-2 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow disabled:bg-indigo-300" disabled={loading}>
                                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;