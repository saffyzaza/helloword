'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle, BookOpen, MessageSquare, Save, Zap, User } from 'lucide-react';

// --- Supabase Client ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Helper Functions (These are correctly placed outside the component) ---

async function getUserDescription(studentId) {
    if (!studentId) return null;
    try {
        const { data, error } = await supabase.from('users').select('description').eq('studentId', studentId).single();
        if (error) throw error;
        return data?.description || {};
    } catch (err) {
        console.error('Supabase fetch error:', err.message);
        return {};
    }
}

async function updateUserDescription(studentId, descriptionObj) {
    if (!studentId) return;
    try {
        const { error } = await supabase.from('users').update({ description: descriptionObj }).eq('studentId', studentId);
        if (error) throw error;
    } catch (err) {
        console.error('Supabase update error:', err.message);
    }
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || 'YOUR_OPENROUTER_API_KEY';
const MODEL_NAME = 'google/gemini-2.5-flash-lite';
const SITE_REFERER = 'https://your-site-url.com';
const SITE_TITLE = 'Credit Transfer AI App';
const MAX_RETRIES = 5;
const MIN_CHARS = 250;

const courseToTransferMock = { 
    id: 10, subcategory_id: 3, credit: 'แล้วแต่วิชา', type: 'บังคับ', 
};

const fetchAICreditMatch = async (sourceCourse, targetCourses) => {
    const targetCourseListText = targetCourses.map(c => 
        `CODE: ${c.code}, NAME: ${c.name}, DESCRIPTION: "${c.description}"`
    ).join('\n---\n');

    const systemPrompt = `
        คุณคือ AI ผู้เชี่ยวชาญด้านการเทียบโอนหน่วยกิต (Credit Transfer Specialist) ที่มีความแม่นยำสูง
        ภารกิจของคุณคือการเปรียบเทียบคำอธิบายรายวิชาจาก Source Course กับ Target Courses ที่ให้มา โดยใช้เกณฑ์ความคล้ายคลึงของเนื้อหา $(\ge 0.92)$.
        *ข้อกำหนดเพิ่มเติม*: โปรดพิจารณาความคล้ายคลึงของชื่อวิชาเป็นปัจจัยเสริมในการตัดสินใจ (Weight $0.5$) เพื่อให้สามารถเทียบโอนได้แม้คะแนนเนื้อหาจะอยู่ใกล้เกณฑ์ $0.92$.
        คุณต้องตอบกลับเฉพาะ JSON array เท่านั้น โดยแต่ละ Object ต้องมี Field ต่อไปนี้:
        1. targetCourseCode (รหัสวิชาในหลักสูตรเป้าหมาย)
        2. targetCourseName (ชื่อวิชาในหลักสูตรเป้าหมาย)
        3. matchedCourseCode (รหัสวิชาจาก Source Course ที่นำมาเทียบ)
        4. similarityScore (คะแนนความคล้ายคลึงระหว่าง $0.92-1.00$ เท่านั้น)
        5. matchReason (เหตุผลสรุปสั้น ๆ ที่ AI ตัดสินว่าวิชานี้ควรเทียบโอนได้ ภาษาไทย)
        ถ้าไม่พบวิชาใดที่คล้ายคลึงถึงเกณฑ์ ให้ตอบกลับด้วย JSON array เปล่า []
    `;

    const userQuery = `
        **วิชาที่ต้องการเทียบโอน (Source Course):**
        รหัสวิชา: ${sourceCourse.code}
        ชื่อวิชา: ${sourceCourse.name}
        คำอธิบายรายวิชา: "${sourceCourse.description}"
        
        **รายการวิชาในหลักสูตรเป้าหมาย (Target Courses):**
        ---
        ${targetCourseListText}
        ---

        เปรียบเทียบและส่งคืนเฉพาะ JSON array ตามโครงสร้างที่กำหนดเท่านั้น
    `;

    const payload = {
        model: MODEL_NAME,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuery }
        ],
        response_format: { type: "json_object" }
    };

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await fetch(OPENROUTER_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': SITE_REFERER,
                    'X-Title': SITE_TITLE,
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 429 && i < MAX_RETRIES - 1) {
                    const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw new Error(`API request failed with status ${response.status}. Check API Key and OpenRouter configuration.`);
            }

            const result = await response.json();
            const jsonText = result.choices?.[0]?.message?.content;

            if (jsonText) {
                try {
                    const parsedResults = JSON.parse(jsonText);
                    return Array.isArray(parsedResults) ? parsedResults : [];
                } catch (e) {
                    console.error("Failed to parse JSON response:", jsonText, e);
                    throw new Error("Invalid JSON structure received from LLM.");
                }
            }
            throw new Error("No content received from LLM. Check the model output or API response.");

        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error.message);
            if (i === MAX_RETRIES - 1) throw error;
        }
    }
    return [];
};


// --- The Main Component ---
// This single component now accepts 'coursesCE' as a prop and contains all the logic.
const CreditTransferApp = ({ coursesCE }) => {
    const [loggedInUser, setLoggedInUser] = useState(null);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userStr = window.localStorage.getItem('user');
            if (userStr) {
                try {
                    setLoggedInUser(JSON.parse(userStr));
                } catch {}
            }
        }
    }, []);

    const [inputCourseCode, setInputCourseCode] = useState("");
    const [inputCourseName, setInputCourseName] = useState("");
    const [studentCourseDescription, setStudentCourseDescription] = useState("");
    const [matchedCourses, setMatchedCourses] = useState([]);
    const [transferLog, setTransferLog] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCompare = useCallback(async () => {
        setError(null);
        const currentLength = studentCourseDescription.trim().length;

        if (currentLength < MIN_CHARS) {
            setError(`คำอธิบายรายวิชาต้องมีเนื้อหาอย่างน้อย ${MIN_CHARS} ตัวอักษร (ปัจจุบันมี: ${currentLength} ตัวอักษร)`);
            return;
        }
        
        if (!inputCourseCode || !inputCourseName) {
            setError("กรุณาป้อนข้อมูลรหัสวิชา ชื่อวิชา และคำอธิบายรายวิชาให้ครบถ้วน");
            return;
        }

        setIsLoading(true);
        
        const currentSourceCourse = {
            ...courseToTransferMock, 
            code: inputCourseCode,
            name: inputCourseName,
            description: studentCourseDescription,
        };

        try {
            // This now works because `coursesCE` comes from the component's props!
            const results = await fetchAICreditMatch(currentSourceCourse, coursesCE);
            
            const resultsWithLogStatus = results.map(result => ({
                ...result,
                logKey: `${result.targetCourseCode}:${result.matchedCourseCode}`,
                isApproved: !!transferLog[`${result.targetCourseCode}:${result.matchedCourseCode}`],
            }));

            setMatchedCourses(resultsWithLogStatus);
            
        } catch (err) {
            console.error("LLM matching error:", err);
            setError("เกิดข้อผิดพลาดในการประมวลผล LLM: " + err.message);
            setMatchedCourses([]);
        } finally {
            setIsLoading(false);
        }
    }, [studentCourseDescription, transferLog, inputCourseCode, inputCourseName, coursesCE]);

    const handleSave = useCallback(async (result) => {
        const logKey = result.logKey;
        if (!loggedInUser || !loggedInUser.studentId) return;

        const oldDescription = await getUserDescription(loggedInUser.studentId);
        if (oldDescription && oldDescription[logKey]) {
            setError(`เคยเทียบโอนวิชานี้ไปแล้ว (${logKey})`);
            return;
        }

        const newLogEntry = {
            target: result.targetCourseCode,
            targetCourseName: result.targetCourseName || '',
            source: result.matchedCourseCode,
            sourceCourseCode: inputCourseCode,
            sourceCourseName: inputCourseName,
            sourceDescription: studentCourseDescription,
            reason: result.matchReason,
            timestamp: new Date().toISOString()
        };
        const mergedDescription = { ...oldDescription, [logKey]: newLogEntry };

        setTransferLog(prevLog => ({ ...prevLog, [logKey]: newLogEntry }));
        await updateUserDescription(loggedInUser.studentId, mergedDescription);

        setMatchedCourses(prevMatches =>
            prevMatches.map(match =>
                match.logKey === logKey ? { ...match, isApproved: true } : match
            )
        );
    }, [studentCourseDescription, loggedInUser, inputCourseCode, inputCourseName]);

    const matchedCount = useMemo(() => matchedCourses.length, [matchedCourses]);
    const totalLogCount = useMemo(() => Object.keys(transferLog).length, [transferLog]);
    const currentCharLength = studentCourseDescription.trim().length;

    // --- Internal Card Component ---
    // It's good practice to define this inside or outside, but since it uses state from the parent (loggedInUser), it needs it passed as a prop.
    const TransferResultCard = ({ result, onSave, isSaved, loggedInUser }) => {
        return (
            <div className="bg-white p-4 rounded-xl shadow-lg border-t-4 border-yellow-500 transition hover:shadow-xl my-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                        <BookOpen className="w-5 h-5 text-yellow-600" />
                        <h5 className="font-bold text-lg text-gray-800">
                            เทียบโอนไปยัง: <span className="text-yellow-600">{result.targetCourseCode}</span>
                        </h5>
                    </div>
                    {isSaved && <CheckCircle className="w-6 h-6 text-green-500" />}
                </div>

                <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold text-gray-700">วิชาเดิม:</span> {result.matchedCourseCode}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                    <span className="font-semibold text-gray-700">ชื่อวิชา:</span> {result.targetCourseName}
                </p>
                
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-blue-600 mb-1 flex items-center">
                        <Zap className="w-4 h-4 mr-1"/> เหตุผลการเทียบโอน
                    </p>
                    <p className="text-sm text-gray-700 italic">{result.matchReason}</p>
                    <p className="text-xs mt-2 text-right text-gray-500">
                        Similarity Score: <span className="font-mono text-base font-bold text-blue-700">{result.similarityScore}</span>
                    </p>
                </div>

                {loggedInUser && (
                    <button
                        onClick={() => onSave(result)}
                        disabled={isSaved}
                        className={`w-full mt-4 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-semibold transition duration-300 ${
                            isSaved
                                ? 'bg-green-500 text-white cursor-not-allowed opacity-80'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                        }`}
                    >
                        {isSaved ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                <span>บันทึกข้อมูล (Log) เรียบร้อยแล้ว</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>บันทึกข้อมูล (Log)</span>
                            </>
                        )}
                    </button>
                )}
                {isSaved && (
                    <p className="mt-2 text-xs text-center text-indigo-500 font-mono bg-indigo-50 p-1 rounded">
                        Log: {'{'}**{result.targetCourseCode}:{result.matchedCourseCode}**{'}'}
                    </p>
                )}
            </div>
        );
    };


    return (
        <div className="bg-gray-100 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="bg-indigo-600 text-white p-6 rounded-t-2xl shadow-xl">
                    <h1 className="text-3xl font-extrabold flex items-center">
                        <Zap className="w-7 h-7 mr-3"/> ระบบเทียบโอนหน่วยกิต
                    </h1>
                    <p className="text-indigo-200 mt-1">ระบบเทียบโอนหน่วยกิตอัตโนมัติด้วยคำอธิบายรายวิชา โดยใช้ LLM</p>
                </div>
                
                <div className="bg-white p-6 rounded-b-2xl shadow-xl border-t border-gray-200">
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                            <User className="w-6 h-6 text-gray-600"/>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อผู้ใช้งาน</p>
                                <p className="text-xl font-bold text-gray-800">
                                    {loggedInUser ? loggedInUser.fullName : "ทดสอบระบบเทียบโอน"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสนักศึกษา/รหัสประจำตัว</p>
                                <p className="text-xl font-bold text-indigo-600">
                                    {loggedInUser && loggedInUser.studentId ? loggedInUser.studentId : "ระบบจะไม่บันทึกข้อมูล"}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-8 p-4 border border-gray-300 rounded-xl bg-blue-50">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-3">
                            <MessageSquare className="w-5 h-5 mr-2 text-blue-600"/> 1. ป้อนข้อมูลวิชาที่ต้องการเทียบโอน
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            <div className="col-span-1">
                                <label htmlFor="course-code" className="block text-sm font-medium text-gray-700">รหัสวิชาเดิม</label>
                                <input
                                    id="course-code"
                                    type="text"
                                    className="w-full p-2 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-700 mt-1"
                                    placeholder="เช่น CS-201-005"
                                    value={inputCourseCode}
                                    onChange={(e) => setInputCourseCode(e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="course-name" className="block text-sm font-medium text-gray-700">ชื่อวิชาเดิม</label>
                                <input
                                    id="course-name"
                                    type="text"
                                    className="w-full p-2 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-700 mt-1"
                                    placeholder="เช่น ระบบปฏิบัติการ"
                                    value={inputCourseName}
                                    onChange={(e) => setInputCourseName(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 font-medium">
                            คำอธิบายรายวิชา ({courseToTransferMock.credit} หน่วยกิต - {courseToTransferMock.type})
                        </p>
                        <textarea
                            className="w-full h-60 p-3 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-700 resize-none"
                            placeholder={`วางคำอธิบายรายวิชาจากสถาบันเดิมที่นี่ (ขั้นต่ำ ${MIN_CHARS} ตัวอักษร)...`}
                            value={studentCourseDescription}
                            onChange={(e) => setStudentCourseDescription(e.target.value)}
                        />
                         <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                                ต้องมีอย่างน้อย {MIN_CHARS} ตัวอักษร
                            </span>
                            <span className="text-sm">
                                อักขระ: <span className={`font-semibold ${currentCharLength >= MIN_CHARS ? 'text-green-600' : 'text-red-500'}`}>{currentCharLength}</span> / {MIN_CHARS}
                            </span>
                        </div>

                        <button
                            onClick={handleCompare}
                            disabled={isLoading || !inputCourseCode || !inputCourseName || currentCharLength < MIN_CHARS}
                            className={`w-full mt-3 py-3 rounded-lg text-lg font-bold transition duration-300 flex items-center justify-center space-x-2 ${
                                isLoading || !inputCourseCode || !inputCourseName || currentCharLength < MIN_CHARS
                                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                    : 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                    <span>กำลังประมวลผลด้วย LLM (OpenRouter)...</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    <span>เทียบวิชาในสาขา</span>
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                            <strong className="font-bold">Error!</strong>
                            <span className="block sm:inline ml-2">{error}</span>
                        </div>
                    )}

                    <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4 border-b pb-2">
                        <CheckCircle className="w-5 h-5 mr-2 text-indigo-600"/> 2. ผลลัพธ์การเทียบโอนหน่วยกิต
                    </h2>

                    {matchedCourses.length > 0 && (
                        <div className="p-3 bg-indigo-100 border-l-4 border-indigo-500 text-indigo-800 font-medium mb-4 rounded-lg">
                            ✅ เทียบโอนได้  {matchedCount}  วิชาในหลักสูตรสาขา
                            <span className="ml-4 text-sm text-indigo-600"> (วิชาที่บันทึกแล้ว: {totalLogCount} รายการ)</span>
                        </div>
                    )}
                    
                    {matchedCourses.length === 0 && !isLoading && (
                        <div className="p-6 text-center text-gray-500 border border-dashed rounded-xl">
                            <BookOpen className="w-8 h-8 mx-auto mb-2"/>
                            <p>ยังไม่มีผลการเทียบโอน หรือไม่พบวิชาที่ตรงตามเกณฑ์</p>
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        {matchedCourses.map((result) => (
                            <TransferResultCard 
                                key={result.logKey} 
                                result={result} 
                                onSave={handleSave}
                                isSaved={!!transferLog[result.logKey]}
                                loggedInUser={loggedInUser}
                            />
                        ))}
                    </div>

                    {totalLogCount > 0 && (
                        <div className="mt-8 pt-4 border-t border-gray-300">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">บันทึกการเทียบโอน (Approved Log)</h3>
                            <div className="bg-gray-800 p-4 rounded-lg text-white font-mono text-sm overflow-x-auto">
                                <pre className='whitespace-pre-wrap'>
                                    {Object.entries(transferLog).map(([logKey, entry]) => (
                                        `LogKey: ${logKey}\n` +
                                        `  inputCourseCode: ${entry.sourceCourseCode}\n` +
                                        `  inputCourseName: ${entry.sourceCourseName}\n` +
                                        `  target: ${entry.target}\n` +
                                        `  targetCourseName: ${entry.targetCourseName}\n` +
                                        `  source: ${entry.source}\n` +
                                        `  sourceDescription: ${entry.sourceDescription}\n` +
                                        `  reason: ${entry.reason}\n` +
                                        `  timestamp: ${entry.timestamp}\n\n`
                                    )).join('')}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreditTransferApp;