"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { FiX, FiChevronRight, FiChevronLeft, FiCheck, FiHelpCircle, FiBook, FiUsers, FiSettings, FiVideo, FiUser, FiLock, FiSave, FiEye, FiZoomIn, FiDownload } from 'react-icons/fi';

// 定义 Props 接口
interface GuideProps {
  isOpen: boolean;
  onClose: () => void;
}

// 定义步骤类型
interface Step {
  title: string;
  description: string;
  content: string;
  highlight: string;
  image?: string;
  imageAlt?: string;
}

// 定义功能类型
interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
}

// 定义 FAQ 类型
interface FAQ {
  question: string;
  answer: string;
}

// 图片查看器组件
const ImageViewer: React.FC<{
  src: string;
  alt: string;
  onClose: () => void;
}> = ({ src, alt, onClose }) => {
  // 处理键盘事件
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-5xl max-h-[90vh]">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          aria-label="ปิดรูปภาพ"
        >
          <FiX className="w-6 h-6" />
        </button>
        
        {/* 下载按钮 */}
        <a
          href={src}
          download
          className="absolute -top-12 right-12 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          aria-label="ดาวน์โหลดรูปภาพ"
          onClick={(e) => e.stopPropagation()}
        >
          <FiDownload className="w-6 h-6" />
        </a>
        
        {/* 图片 */}
        <div className="relative">
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg"
            priority
          />
          
          {/* 放大图标提示 */}
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            <FiZoomIn className="w-4 h-4" />
            คลิกเพื่อปิด
          </div>
        </div>
      </div>
    </div>
  );
};

const GuideComponent: React.FC<GuideProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'quickstart' | 'features' | 'faq'>('quickstart');
  const [imageViewer, setImageViewer] = useState<{ src: string; alt: string } | null>(null);

  const quickStartSteps: Step[] = [
    {
      title: "เช็ควิชาโดยไม่ต้องล็อกอิน",
      description: "สำรวจรายวิชาที่เปิดสอน",
      content: "คุณสามารถคลิกที่ปุ่ม 'เทียบวิชาในระบบออนไลน์' เพื่อดูรายวิชาที่เปิดสอนได้ทันที โดยไม่จำเป็นต้องเข้าสู่ระบบ แต่ข้อมูลจะไม่ถูกบันทึก",
      highlight: ".transfer-button",
      image: "/guide-step1.png",
      imageAlt: "หน้าเช็ควิชาโดยไม่ต้องล็อกอิน"
    },
    {
      title: "เข้าสู่ระบบเพื่อบันทึกข้อมูล",
      description: "ล็อกอินเพื่อใช้งานฟีเจอร์เต็มรูปแบบ",
      content: "คลิกที่เมนูผู้ใช้เพื่อเข้าสู่ระบบ หลังจากล็อกอินแล้วคุณจะสามารถบันทึกข้อมูลการเทียบโอนวิชาและดูประวัติการใช้งานได้",
      highlight: ".login-button",
      image: "/guide-step2.png",
      imageAlt: "หน้าเข้าสู่ระบบ"
    },
    {
      title: "บันทึกข้อมูลการเทียบวิชา",
      description: "เลือกรายวิชาและบันทึก",
      content: "ในหน้า CourseViewer ให้เลือกรายวิชาที่ต้องการเทียบโอน จากนั้นคลิกปุ่ม 'บันทึกข้อมูล' เพื่อบันทึกรายวิชาที่เลือกไว้ในระบบ",
      highlight: ".save-button",
      image: "/guide-step3.png",
      imageAlt: "หน้าบันทึกข้อมูลการเทียบวิชา"
    },
    {
      title: "ดูประวัติการเทียบวิชา",
      description: "ตรวจสอบรายวิชาที่เทียบแล้ว",
      content: "ไปที่หน้าข้อมูลนักศึกษาเพื่อดูรายวิชาที่เคยเทียบโอนไปแล้ว พร้อมดูรายละเอียดและสถานะการอนุมัติ",
      highlight: ".profile-section",
      image: "/guide-step4.png",
      imageAlt: "หน้าประวัติการเทียบวิชา"
    },
    {
      title: "แก้ไขข้อมูลส่วนตัว",
      description: "อัพเดตข้อมูลส่วนตัว",
      content: "ในหน้าข้อมูลนักศึกษา คุณสามารถแก้ไขชื่อ อีเมล และรหัสผ่านได้ คลิกที่ปุ่ม 'แก้ไขข้อมูล' เพื่อทำการอัพเดต",
      highlight: ".edit-profile",
      image: "/guide-step5.png",
      imageAlt: "หน้าแก้ไขข้อมูลส่วนตัว"
    }
  ];

  const features: Feature[] = [
    {
      icon: <FiEye className="w-6 h-6" />,
      title: "ดูวิชาแบบไม่ต้องล็อกอิน",
      description: "สำรวจรายวิชาที่เปิดสอนได้ทันที ไม่ต้องสมัครสมาชิก",
      image: "/feature-view-courses.png",
      imageAlt: "ดูวิชาแบบไม่ต้องล็อกอิน"
    },
    {
      icon: <FiSave className="w-6 h-6" />,
      title: "บันทึกข้อมูลการเทียบวิชา",
      description: "เข้าสู่ระบบเพื่อบันทึกและจัดการรายวิชาที่เทียบโอน",
      image: "/feature-save-data.png",
      imageAlt: "บันทึกข้อมูลการเทียบวิชา"
    },
    {
      icon: <FiUser className="w-6 h-6" />,
      title: "จัดการข้อมูลส่วนตัว",
      description: "แก้ไขชื่อ อีเมล และรหัสผ่านได้ตลอดเวลา",
      image: "/feature-manage-profile.png",
      imageAlt: "จัดการข้อมูลส่วนตัว"
    },
    {
      icon: <FiBook className="w-6 h-6" />,
      title: "ดูประวัติการเทียบวิชา",
      description: "ตรวจสอบรายวิชาที่เคยเทียบโอนและสถานะการอนุมัติ",
      image: "/feature-view-history.png",
      imageAlt: "ดูประวัติการเทียบวิชา"
    }
  ];

  const faqs: FAQ[] = [
    {
      question: "ต้องล็อกอินก่อนถึงจะดูรายวิชาได้ไหม?",
      answer: "ไม่จำเป็นครับ คุณสามารถดูรายวิชาที่เปิดสอนได้โดยไม่ต้องล็อกอิน แต่หากต้องการบันทึกข้อมูลจำเป็นต้องล็อกอินก่อน"
    },
    {
      question: "ข้อมูลการเทียบวิชาจะถูกบันทึกไว้ที่ไหน?",
      answer: "ข้อมูลจะถูกบันทึกไว้ในระบบ คุณสามารถดูได้ที่หน้าข้อมูลนักศึกษาในส่วนประวัติการเทียบวิชา"
    },
    {
      question: "สามารถเปลี่ยนแปลงข้อมูลส่วนตัวได้หรือไม่?",
      answer: "ได้ครับ คุณสามารถแก้ไขชื่อ อีเมล และรหัสผ่านได้ในหน้าข้อมูลนักศึกษา"
    },
    {
      question: "จะรู้ได้อย่างไรว่ารายวิชาที่เทียบโอนได้รับการอนุมัติ?",
      answer: "คุณสามารถตรวจสอบสถานะได้ในหน้าประวัติการเทียบวิชา ระบบจะแสดงสถานะการอนุมัติของแต่ละรายวิชา"
    },
    {
      question: "สามารถเทียบโอนวิชาได้กี่รายวิชา?",
      answer: "ขึ้นอยู่กับหลักสูตรและเงื่อนไขของแต่ละสาขา สามารถตรวจสอบได้ในระบบ CourseViewer"
    }
  ];

  const nextStep = (): void => {
    if (currentStep < quickStartSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 打开图片查看器
  const openImageViewer = (src: string, alt: string) => {
    setImageViewer({ src, alt });
  };

  // 关闭图片查看器
  const closeImageViewer = () => {
    setImageViewer(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FiHelpCircle className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">คู่มือการใช้งาน</h2>
                  <p className="text-blue-100">เรียนรู้วิธีการใช้งานระบบเทียบโอนวิชาออนไลน์</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="ปิดคู่มือ"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('quickstart')}
              className={`flex-1 px-6 py-3 font-semibold transition-colors ${
                activeTab === 'quickstart'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              aria-label="แท็บเริ่มต้นใช้งาน"
            >
              เริ่มต้นใช้งาน
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`flex-1 px-6 py-3 font-semibold transition-colors ${
                activeTab === 'features'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              aria-label="แท็บฟีเจอร์หลัก"
            >
              ฟีเจอร์หลัก
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 px-6 py-3 font-semibold transition-colors ${
                activeTab === 'faq'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              aria-label="แท็บคำถามที่พบบ่อย"
            >
              คำถามที่พบบ่อย
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {activeTab === 'quickstart' && (
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {quickStartSteps.map((_: Step, index: number) => (
                        <div key={index} className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                              index <= currentStep
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {index < currentStep ? (
                              <FiCheck className="w-4 h-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          {index < quickStartSteps.length - 1 && (
                            <div
                              className={`w-12 h-1 mx-2 transition-colors ${
                                index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 ml-4">
                    {currentStep + 1} / {quickStartSteps.length}
                  </span>
                </div>

                {/* Step Content with Image */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {quickStartSteps[currentStep].title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {quickStartSteps[currentStep].description}
                  </p>
                  
                  {/* Image Section - ปรับขนาดเล็กลง */}
                  {quickStartSteps[currentStep].image && (
                    <div className="mb-4 flex justify-center">
                      <div 
                        className="relative rounded-lg overflow-hidden shadow-md w-full max-w-md cursor-pointer group"
                        onClick={() => openImageViewer(
                          quickStartSteps[currentStep].image!,
                          quickStartSteps[currentStep].imageAlt || "Guide image"
                        )}
                      >
                        <Image
                          src={quickStartSteps[currentStep].image!}
                          alt={quickStartSteps[currentStep].imageAlt || "Guide image"}
                          width={500}
                          height={280}
                          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                          priority
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                          ตัวอย่าง
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <FiZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-700">
                      {quickStartSteps[currentStep].content}
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      currentStep === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    aria-label="ขั้นตอนก่อนหน้า"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    ก่อนหน้า
                  </button>
                  {currentStep < quickStartSteps.length - 1 ? (
                    <button
                      onClick={nextStep}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      aria-label="ขั้นตอนถัดไป"
                    >
                      ถัดไป
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={onClose}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      aria-label="เริ่มใช้งาน"
                    >
                      <FiCheck className="w-4 h-4" />
                      เริ่มใช้งาน
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature: Feature, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    {/* Feature Image - ปรับขนาดเล็กลง */}
                    {feature.image && (
                      <div 
                        className="relative h-32 cursor-pointer group"
                        onClick={() => openImageViewer(feature.image!, feature.imageAlt || "Feature image")}
                      >
                        <Image
                          src={feature.image}
                          alt={feature.imageAlt || "Feature image"}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <FiZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    )}
                    
                    {/* Feature Content */}
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg flex-shrink-0">
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4">
                {faqs.map((faq: FAQ, index: number) => (
                  <details key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <summary className="font-semibold text-gray-800 cursor-pointer flex items-center justify-between">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-gray-600 pl-4 border-l-2 border-blue-400">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Viewer */}
      {imageViewer && (
        <ImageViewer
          src={imageViewer.src}
          alt={imageViewer.alt}
          onClose={closeImageViewer}
        />
      )}
    </>
  );
};

export default GuideComponent;