import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, MessageCircle } from 'lucide-react';

interface WorkCardProps {
    id: string;
    title: string;
    author: string;
    authorAvatar?: string;
    likes: number;
    views: number;
    comments: number;
    tags: string[];
    isPinned?: boolean;
}

export function WorkCard({
    title,
    author,
    likes,
    views,
    comments,
    tags,
    isPinned = false,
}: WorkCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
            {/* 作品缩略图 */}
            <div className="aspect-square bg-gradient-to-br from-[#8B4513]/20 to-[#D4AF37]/20 flex items-center justify-center relative">
                <div className="text-6xl">🎨</div>
                {isPinned && (
                    <Badge className="absolute top-2 right-2 bg-[#C41E3A] text-white">
                        置顶
                    </Badge>
                )}
            </div>

            <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{title}</h3>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {tags.slice(0, 3).map((tag, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="bg-[#F5F5DC] text-[#8B4513] text-xs"
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>

                {/* 作者和互动数据 */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-[#8B4513] to-[#D4AF37] rounded-full" />
                        <span className="text-sm text-gray-600">{author}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-500 text-sm">
                        <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{comments}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
