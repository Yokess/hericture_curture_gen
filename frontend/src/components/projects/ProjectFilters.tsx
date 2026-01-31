import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface ProjectFiltersProps {
    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onBatchChange: (value: string) => void;
}

export function ProjectFilters({ onSearchChange, onCategoryChange, onBatchChange }: ProjectFiltersProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="搜索非遗项目..."
                    className="pl-10"
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <Select onValueChange={onCategoryChange}>
                <SelectTrigger>
                    <SelectValue placeholder="全部类别" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">全部类别</SelectItem>
                    <SelectItem value="folk-literature">民间文学</SelectItem>
                    <SelectItem value="traditional-music">传统音乐</SelectItem>
                    <SelectItem value="traditional-dance">传统舞蹈</SelectItem>
                    <SelectItem value="traditional-drama">传统戏剧</SelectItem>
                    <SelectItem value="traditional-art">传统美术</SelectItem>
                    <SelectItem value="traditional-craft">传统技艺</SelectItem>
                </SelectContent>
            </Select>
            <Select onValueChange={onBatchChange}>
                <SelectTrigger>
                    <SelectValue placeholder="全部批次" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">全部批次</SelectItem>
                    <SelectItem value="2006">2006(第一批)</SelectItem>
                    <SelectItem value="2008">2008(第二批)</SelectItem>
                    <SelectItem value="2011">2011(第三批)</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
