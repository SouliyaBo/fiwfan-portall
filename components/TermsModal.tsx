"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
    // Prevent scrolling on background when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-xl font-bold text-gray-900">ข้อกำหนดและเงื่อนไข</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar text-sm text-gray-600 space-y-4 leading-relaxed">
                    <p className="font-bold text-gray-900 text-base">ยินดีต้อนรับสู่ Phusao!</p>
                    <p>
                        ข้อกำหนดและเงื่อนไขการใช้งานเหล่านี้ ("ข้อตกลง") เป็นสัญญาทางกฎหมายระหว่างคุณ ("ผู้ใช้") และ Phusao ("เรา" หรือ "บริษัท")
                        เกี่ยวกับการเข้าถึงและการใช้งานเว็บไซต์และบริการของเรา
                    </p>

                    <h4 className="font-bold text-gray-900 mt-4">1. การยอมรับข้อตกลง</h4>
                    <p>
                        โดยการสมัครสมาชิกหรือเข้าใช้งานแพลตฟอร์ม คุณยืนยันว่าคุณได้อ่าน เข้าใจ และยอมรับข้อตกลงเหล่านี้ทั้งหมด
                        หากคุณไม่ยอมรับข้อตกลงใดๆ กรุณายุติการใช้งานทันที
                    </p>

                    <h4 className="font-bold text-gray-900 mt-4">2. คุณสมบัติผู้ใช้งาน</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>คุณต้องมีอายุไม่ต่ำกว่า 20 ปีบริบูรณ์เพื่อใช้งานแพลตฟอร์มนี้</li>
                        <li>คุณต้องมีความสามารถตามกฎหมายในการเข้าทำสัญญา</li>
                        <li>เนื้อหาที่คุณนำเสนอต้องไม่ขัดต่อกฎหมายและศีลธรรมอันดี</li>
                    </ul>

                    <h4 className="font-bold text-gray-900 mt-4">3. บัญชีสมาชิกและความปลอดภัย</h4>
                    <p>
                        คุณมีหน้าที่รับผิดชอบในการรักษาความปลอดภัยของบัญชีและรหัสผ่านของคุณ กิจกรรมใดๆ ที่เกิดขึ้นภายใต้บัญชีของคุณถือเป็นความรับผิดชอบของคุณแต่เพียงผู้เดียว
                    </p>

                    <h4 className="font-bold text-gray-900 mt-4">4. เนื้อหาบนแพลตฟอร์ม</h4>
                    <p>
                        เราเคารพในสิทธิ์ในทรัพย์สินทางปัญญา อย่างไรก็ตาม เราขอสงวนสิทธิ์ในการตรวจสอบและลบเนื้อหาที่ไม่เหมาะสม
                        อนาจาร หมิ่นประมาท หรือละเมิดสิทธิ์ของผู้อื่นโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
                    </p>

                    <h4 className="font-bold text-gray-900 mt-4">5. การยกเลิกบริการ</h4>
                    <p>
                        เราอาจระงับหรือยกเลิกบัญชีของคุณได้ทันทีหากพบว่ามีการละเมิดข้อตกลงนี้ หรือมีพฤติกรรมที่อาจก่อให้เกิดความเสียหายต่อแพลตฟอร์มหรือผู้ใช้อื่น
                    </p>

                    <h4 className="font-bold text-gray-900 mt-4">6. นโยบายความเป็นส่วนตัว</h4>
                    <p>
                        ข้อมูลส่วนบุคคลของคุณจะถูกเก็บรวบรวมและใช้งานตาม "นโยบายความเป็นส่วนตัว" ของเรา ซึ่งถือเป็นส่วนหนึ่งของข้อตกลงนี้
                    </p>

                    <div className="pt-6 border-t mt-6">
                        <p className="text-xs text-gray-400">
                            อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#1e1b4b] text-white font-bold rounded-lg hover:bg-[#2d2a6e] transition"
                    >
                        รับทราบ
                    </button>
                </div>
            </div>
        </div>
    );
}
