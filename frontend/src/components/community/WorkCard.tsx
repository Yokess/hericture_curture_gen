import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, MessageCircle, Pin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface WorkCardProps {
    id: number;
    title: string;
    authorName: string;
    authorAvatarUrl?: string | null;
    likeCount: number;
    viewCount: number;
    commentCount: number;
    tags?: string[] | null;
    isPinned?: boolean;
    coverUrl?: string | null;
}

export function WorkCard({
    id,
    title,
    authorName,
    authorAvatarUrl,
    likeCount,
    viewCount,
    commentCount,
    tags,
    isPinned = false,
    coverUrl,
}: WorkCardProps) {
    const navigate = useNavigate();

    return (
        <Card
            className={cn(
                'overflow-hidden cursor-pointer border-gray-200/70 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5',
                isPinned && 'ring-1 ring-[#D4AF37]/40'
            )}
            onClick={() => navigate(`/community/${id}`)}
        >
            <div className="relative aspect-[4/5] bg-gradient-to-br from-[#8B4513]/12 to-[#D4AF37]/12">
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={title}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-5xl opacity-60">✦</div>
                    </div>
                )}

                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />

                {isPinned && (
                    <Badge className="absolute left-3 top-3 bg-[#8B4513] text-white border-0 shadow-sm">
                        <Pin className="w-3 h-3 mr-1" /> 置顶
                    </Badge>
                )}

                <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-serif text-[15px] font-bold leading-snug text-white line-clamp-2 drop-shadow">
                        {title}
                    </h3>
                </div>
            </div>

            <CardContent className="p-4">
                <div className="flex flex-wrap gap-2 mb-3">
                    {(tags || []).slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-[#F5F5DC] text-[#8B4513] text-xs">
                            {tag}
                        </Badge>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200/70">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8B4513] to-[#D4AF37] overflow-hidden ring-1 ring-black/5 shrink-0">
                            {authorAvatarUrl ? (
                                <img src={authorAvatarUrl} alt={authorName} className="w-full h-full object-cover" />
                            ) : null}
                        </div>
                        <span className="text-sm text-gray-700 truncate">{authorName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 text-sm">
                        <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{likeCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{viewCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{commentCount}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
