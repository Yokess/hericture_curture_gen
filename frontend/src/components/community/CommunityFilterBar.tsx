import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface CommunityFilterBarProps {
    keyword: string;
    setKeyword: (val: string) => void;
    sort: string;
    setSort: (val: any) => void;
    className?: string;
}

export function CommunityFilterBar({ 
    keyword, 
    setKeyword, 
    sort, 
    setSort,
    className 
}: CommunityFilterBarProps) {
    return (
        <div className={cn("sticky top-20 z-40 w-full px-4 md:px-8 py-4 pointer-events-none", className)}>
            <div className="max-w-7xl mx-auto pointer-events-auto">
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-2xl p-2 flex flex-col md:flex-row gap-2 md:items-center justify-between">
                    
                    {/* 左侧：搜索区 */}
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-[#8B4513] transition-colors" />
                        </div>
                        <Input 
                            placeholder="搜索灵感、作者、或是某种技艺..." 
                            className="pl-10 bg-transparent border-transparent shadow-none focus-visible:ring-0 focus-visible:bg-white/50 h-10 md:h-12 text-base transition-all"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>

                    {/* 分隔线 (Desktop) */}
                    <div className="hidden md:block w-px h-8 bg-gray-200 mx-2" />

                    {/* 右侧：筛选与视图 */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-gray-100/50 rounded-xl p-1">
                            <button 
                                onClick={() => setSort('latest')}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                                    sort === 'latest' ? "bg-white text-[#8B4513] shadow-sm" : "text-gray-500 hover:text-gray-900"
                                )}
                            >
                                最新
                            </button>
                            <button 
                                onClick={() => setSort('popular')}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                                    sort === 'popular' ? "bg-white text-[#8B4513] shadow-sm" : "text-gray-500 hover:text-gray-900"
                                )}
                            >
                                最热
                            </button>
                            <button 
                                onClick={() => setSort('likes')}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                                    sort === 'likes' ? "bg-white text-[#8B4513] shadow-sm" : "text-gray-500 hover:text-gray-900"
                                )}
                            >
                                推荐
                            </button>
                        </div>
                        
                        {/* 移动端筛选按钮 */}
                        <Button variant="outline" size="icon" className="md:hidden border-gray-200 bg-white/50">
                            <SlidersHorizontal className="h-4 w-4 text-gray-600" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}