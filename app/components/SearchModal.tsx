import { X, Search, MapPin, Hash } from "lucide-react";
import { useState } from "react";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (filters: any) => void;
}

export default function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
    const [filters, setFilters] = useState({
        name: "",
        lineId: "",
        gender: "",
        province: "",
        location: "", // Zone
        ageMin: 20,
        ageMax: 60,
        heightMin: 100,
        heightMax: 200,
        weightMin: 40,
        weightMax: 100,
        chestMin: 30,
        chestMax: 60,
        waistMin: 20,
        waistMax: 50,
        hipsMin: 30,
        hipsMax: 60,
    });

    if (!isOpen) return null;

    const handleSearch = () => {
        onSearch(filters);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-white/10 rounded-full hover:bg-zinc-200 dark:hover:bg-white/20 transition cursor-pointer"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold mb-6 text-center text-zinc-900 dark:text-white">ค้นหา</h3>

                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">ค้นหาชื่อ</label>
                        <div className="relative">
                            <input
                                value={filters.name}
                                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F84E6E] dark:text-white"
                                placeholder="พิมพ์ชื่อน้อง..."
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        </div>
                    </div>

                    {/* Line ID */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">ไลน์ไอดี</label>
                        <div className="relative">
                            <input
                                value={filters.lineId}
                                onChange={(e) => setFilters({ ...filters, lineId: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F84E6E] dark:text-white"
                                placeholder="LINE ID..."
                            />
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        </div>
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">เพศ</label>
                        <select
                            value={filters.gender}
                            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F84E6E] dark:text-white appearance-none cursor-pointer"
                        >
                            <option value="">ทั้งหมด</option>
                            <option value="Female">ผู้หญิง</option>
                            <option value="Ladyboy">สาวสอง</option>
                        </select>
                    </div>

                    {/* Province */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">จังหวัด</label>
                        <select
                            value={filters.province}
                            onChange={(e) => setFilters({ ...filters, province: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F84E6E] dark:text-white appearance-none cursor-pointer"
                        >
                            <option value="">ทุกจังหวัด</option>
                            <option value="Bangkok">กรุงเทพมหานคร</option>
                            <option value="Nonthaburi">นนทบุรี</option>
                            <option value="Pathum Thani">ปทุมธานี</option>
                            <option value="Samut Prakan">สมุทรปราการ</option>
                            <option value="Chonburi">ชลบุรี</option>
                            <option value="Chiang Mai">เชียงใหม่</option>
                            <option value="Phuket">ภูเก็ต</option>
                        </select>
                    </div>

                    {/* Location/Zone */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">ที่ตั้ง / โซน</label>
                        <div className="relative">
                            <input
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F84E6E] dark:text-white"
                                placeholder="ระบุโซน เช่น รัชดา, ลาดพร้าว..."
                            />
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        </div>
                    </div>

                    {/* Age Range */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                            ช่วงอายุ: <span className="text-[#F84E6E]">{filters.ageMin} - {filters.ageMax} ปี</span>
                        </label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="range"
                                min="18"
                                max="60"
                                value={filters.ageMin}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (val <= filters.ageMax) setFilters({ ...filters, ageMin: val });
                                }}
                                className="w-full accent-[#F84E6E] h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <input
                                type="range"
                                min="18"
                                max="60"
                                value={filters.ageMax}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (val >= filters.ageMin) setFilters({ ...filters, ageMax: val });
                                }}
                                className="w-full accent-[#F84E6E] h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Height & Weight */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                                ส่วนสูง: <span className="text-[#F84E6E]">{filters.heightMin || 100} - {filters.heightMax || 200} ซม.</span>
                            </label>
                            <input
                                type="range"
                                min="100"
                                max="200"
                                value={filters.heightMax || 200}
                                onChange={(e) => setFilters({ ...filters, heightMax: parseInt(e.target.value) })}
                                className="w-full accent-[#F84E6E] h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                                น้ำหนัก: <span className="text-[#F84E6E]">{filters.weightMin || 40} - {filters.weightMax || 100} กก.</span>
                            </label>
                            <input
                                type="range"
                                min="40"
                                max="100"
                                value={filters.weightMax || 100}
                                onChange={(e) => setFilters({ ...filters, weightMax: parseInt(e.target.value) })}
                                className="w-full accent-[#F84E6E] h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Proportions */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                                หน้าอก: <span className="text-[#F84E6E]">{filters.chestMin || 30} - {filters.chestMax || 60} นิ้ว</span>
                            </label>
                            <input
                                type="range"
                                min="30"
                                max="60"
                                value={filters.chestMax || 60}
                                onChange={(e) => setFilters({ ...filters, chestMax: parseInt(e.target.value) })}
                                className="w-full accent-[#F84E6E] h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                                เอว: <span className="text-[#F84E6E]">{filters.waistMin || 20} - {filters.waistMax || 50} นิ้ว</span>
                            </label>
                            <input
                                type="range"
                                min="20"
                                max="50"
                                value={filters.waistMax || 50}
                                onChange={(e) => setFilters({ ...filters, waistMax: parseInt(e.target.value) })}
                                className="w-full accent-[#F84E6E] h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
                                สะโพก: <span className="text-[#F84E6E]">{filters.hipsMin || 30} - {filters.hipsMax || 60} นิ้ว</span>
                            </label>
                            <input
                                type="range"
                                min="30"
                                max="60"
                                value={filters.hipsMax || 60}
                                onChange={(e) => setFilters({ ...filters, hipsMax: parseInt(e.target.value) })}
                                className="w-full accent-[#F84E6E] h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSearch}
                        className="w-full bg-[#F84E6E] hover:bg-[#d43f5b] text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-500/20 mt-6 active:scale-95 transition cursor-pointer"
                    >
                        ค้นหา
                    </button>
                </div>
            </div>
        </div>
    );
}
