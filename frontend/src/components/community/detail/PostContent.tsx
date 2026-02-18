import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface PostContentProps {
    title: string;
    content?: string | null;
    tags?: string[] | null;
    createdAt: string;
}

export function PostContent({ title, content, tags, createdAt }: PostContentProps) {
    return (
        <div className="space-y-6">
            {/* 标题与元数据 */}
            <div className="border-b border-[#D4AF37]/20 pb-6">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2C1810] leading-tight mb-4">
                    {title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1.5 opacity-70" />
                        {new Date(createdAt).toLocaleDateString('zh-CN')}
                    </div>
                    <div className="h-4 w-px bg-gray-300 mx-2" />
                    <div className="flex gap-2">
                        {tags?.map(tag => (
                            <Badge 
                                key={tag} 
                                variant="outline" 
                                className="border-[#8B4513]/20 text-[#8B4513] bg-[#8B4513]/5 hover:bg-[#8B4513]/10 font-normal"
                            >
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* 正文内容 */}
            <article className="prose prose-lg prose-stone max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-justify">
                    {content || "作者很懒，没有留下详细描述。"}
                </p>
            </article>
        </div>
    );
}