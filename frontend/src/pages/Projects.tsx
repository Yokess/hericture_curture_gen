import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Book } from 'lucide-react';
import { QASection } from '@/components/projects/QASection';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Button } from '@/components/ui/button';

export default function Projects() {
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [batch, setBatch] = useState('all');

    // Mock 项目数据
    const projects = [
        {
            id: '1',
            code: 'Ⅰ-001',
            batch: '2006(第一批)',
            name: '苗族古歌',
            category: '民间文学',
            location: '贵州省台江县',
            description: '苗族古歌是苗族人民世代相传的口头文学,内容涉及苗族社会历史、神话传说、生产生活等各个方面。',
            successorCount: 3,
            categoryIcon: '📖',
            gradient: 'bg-gradient-to-br from-red-50 to-pink-50',
        },
        {
            id: '2',
            code: 'Ⅶ-023',
            batch: '2006(第一批)',
            name: '景德镇制瓷',
            category: '传统技艺',
            location: '江西省景德镇市',
            description: '景德镇制瓷技艺历史悠久,以"白如玉、明如镜、薄如纸、声如磬"著称,包括72道工序。',
            successorCount: 1,
            categoryIcon: '🏺',
            gradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
        },
        {
            id: '3',
            code: 'Ⅵ-009',
            batch: '2006(第一批)',
            name: '蔚县剪纸',
            category: '传统美术',
            location: '河北省蔚县',
            description: '蔚县剪纸以其独特的点彩工艺闻名,采用阴刻为主、阳刻为辅的刀工技法,色彩艳丽。',
            successorCount: 2,
            categoryIcon: '✂️',
            gradient: 'bg-gradient-to-br from-orange-50 to-yellow-50',
        },
    ];

    return (
        <div className="min-h-screen bg-[#F5F5DC]">
            <Navbar />

            {/* 页面标题 */}
            <section className="pt-32 pb-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="font-serif text-5xl font-bold text-[#8B4513] mb-4">非遗探索中心</h1>
                    <p className="text-xl text-gray-600">智能问答 + 项目浏览,全方位了解非遗文化</p>
                </div>
            </section>

            {/* 标签页切换 */}
            <section className="pb-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <Tabs defaultValue="qa" className="w-full">
                        <div className="bg-white rounded-2xl shadow-lg border border-[#D4AF37]/10 overflow-hidden">
                            {/* 标签页头部 */}
                            <TabsList className="w-full grid grid-cols-2 h-auto p-0 bg-transparent border-b border-gray-200">
                                <TabsTrigger
                                    value="qa"
                                    className="flex items-center justify-center space-x-2 px-6 py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#8B4513] data-[state=active]:text-[#8B4513] data-[state=active]:bg-transparent"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    <span className="font-semibold">智能问答</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="projects"
                                    className="flex items-center justify-center space-x-2 px-6 py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#8B4513] data-[state=active]:text-[#8B4513] data-[state=active]:bg-transparent"
                                >
                                    <Book className="w-5 h-5" />
                                    <span className="font-semibold">项目浏览</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* 智能问答内容 */}
                            <TabsContent value="qa" className="m-0">
                                <QASection />
                            </TabsContent>

                            {/* 项目浏览内容 */}
                            <TabsContent value="projects" className="m-0 p-6">
                                {/* 搜索和筛选 */}
                                <ProjectFilters
                                    onSearchChange={setSearchQuery}
                                    onCategoryChange={setCategory}
                                    onBatchChange={setBatch}
                                />

                                {/* 项目列表 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {projects.map((project) => (
                                        <ProjectCard key={project.id} {...project} />
                                    ))}
                                </div>

                                {/* 分页 */}
                                <div className="mt-8 flex items-center justify-center space-x-2">
                                    <Button variant="outline">上一页</Button>
                                    <Button className="bg-[#8B4513] hover:bg-[#8B4513]/90">1</Button>
                                    <Button variant="outline">2</Button>
                                    <Button variant="outline">3</Button>
                                    <Button variant="outline">下一页</Button>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </section>

            <Footer />
        </div>
    );
}
