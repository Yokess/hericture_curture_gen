import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WorkCard } from '@/components/community/WorkCard';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Community() {
    // Mock 作品数据
    const works = [
        {
            id: '1',
            title: '青花瓷纹样现代T恤设计',
            author: '设计师小王',
            likes: 328,
            views: 1542,
            comments: 45,
            tags: ['青花瓷', '服装设计', '现代简约'],
            isPinned: true,
        },
        {
            id: '2',
            title: '剪纸元素手机壳创意',
            author: '创意达人',
            likes: 256,
            views: 982,
            comments: 32,
            tags: ['剪纸', '数码配件', '传统工艺'],
        },
        {
            id: '3',
            title: '苗族刺绣图案帆布包',
            author: '手工爱好者',
            likes: 189,
            views: 756,
            comments: 28,
            tags: ['苗族刺绣', '包包设计', '民族风'],
        },
        {
            id: '4',
            title: '景泰蓝配色海报设计',
            author: '平面设计师',
            likes: 412,
            views: 2134,
            comments: 67,
            tags: ['景泰蓝', '海报设计', '配色方案'],
        },
        {
            id: '5',
            title: '传统纹样笔记本封面',
            author: '文创设计',
            likes: 145,
            views: 623,
            comments: 19,
            tags: ['传统纹样', '文具设计', '复古'],
        },
        {
            id: '6',
            title: '非遗元素品牌LOGO',
            author: 'Logo专家',
            likes: 298,
            views: 1456,
            comments: 52,
            tags: ['品牌设计', 'LOGO', '非遗元素'],
        },
    ];

    // 热门标签
    const popularTags = [
        '全部',
        '青花瓷',
        '剪纸',
        '刺绣',
        '景泰蓝',
        '服装设计',
        '数码配件',
        '海报设计',
        '品牌设计',
    ];

    return (
        <div className="min-h-screen bg-[#F5F5DC]">
            <Navbar />

            {/* 页面标题 */}
            <section className="pt-32 pb-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="font-serif text-5xl font-bold text-[#8B4513] mb-4">创意分享社区</h1>
                    <p className="text-xl text-gray-600">
                        分享您的文创作品,与全国非遗爱好者交流,共同传承中华文化
                    </p>
                </div>
            </section>

            {/* 筛选和排序 */}
            <section className="pb-6 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        {/* 标签筛选 */}
                        <div className="flex flex-wrap gap-2">
                            {popularTags.map((tag, index) => (
                                <Badge
                                    key={index}
                                    variant={index === 0 ? 'default' : 'outline'}
                                    className={
                                        index === 0
                                            ? 'bg-[#8B4513] hover:bg-[#8B4513]/90 cursor-pointer'
                                            : 'hover:bg-[#F5F5DC] cursor-pointer'
                                    }
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        {/* 排序 */}
                        <Select defaultValue="latest">
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="latest">最新</SelectItem>
                                <SelectItem value="popular">最热</SelectItem>
                                <SelectItem value="likes">最多点赞</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </section>

            {/* 作品瀑布流 */}
            <section className="pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {works.map((work) => (
                            <WorkCard key={work.id} {...work} />
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
