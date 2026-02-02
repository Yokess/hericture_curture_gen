import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { heritageApi } from '@/api/heritage';

interface ProjectFiltersProps {
    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onLocationChange: (value: string) => void;
    onBatchChange: (value: string) => void;
}

export function ProjectFilters({
    onSearchChange,
    onCategoryChange,
    onLocationChange,
    onBatchChange
}: ProjectFiltersProps) {
    const [categories, setCategories] = useState<string[]>([]);
    const [locations, setLocations] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // 加载类别和地区列表
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [categoriesData, locationsData] = await Promise.all([
                    heritageApi.getCategories(),
                    heritageApi.getLocations()
                ]);
                setCategories(categoriesData);

                // 提取省级地区(只取省份部分)
                const provinces = locationsData
                    .map(loc => {
                        // 提取省份名称(如"贵州省台江县" -> "贵州省")
                        const match = loc.match(/^(.+?省|.+?自治区|.+?市)/);
                        return match ? match[1] : loc;
                    })
                    .filter((value, index, self) => self.indexOf(value) === index) // 去重
                    .sort(); // 排序

                setLocations(provinces);
            } catch (error) {
                console.error('获取筛选列表失败:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFilters();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="搜索非遗项目..."
                    className="pl-10"
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <Select onValueChange={onCategoryChange} disabled={loading}>
                <SelectTrigger>
                    <SelectValue placeholder={loading ? "加载中..." : "全部类别"} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">全部类别</SelectItem>
                    {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                            {category}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select onValueChange={onLocationChange} disabled={loading}>
                <SelectTrigger>
                    <SelectValue placeholder={loading ? "加载中..." : "全部地区"} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">全部地区</SelectItem>
                    {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                            {location}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select onValueChange={onBatchChange}>
                <SelectTrigger>
                    <SelectValue placeholder="全部批次" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">全部批次</SelectItem>
                    <SelectItem value="2006(第一批)">2006(第一批)</SelectItem>
                    <SelectItem value="2008(第二批)">2008(第二批)</SelectItem>
                    <SelectItem value="2011(第三批)">2011(第三批)</SelectItem>
                    <SelectItem value="2014(第四批)">2014(第四批)</SelectItem>
                    <SelectItem value="2021(第五批)">2021(第五批)</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
