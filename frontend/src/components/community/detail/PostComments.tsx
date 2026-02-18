import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send } from 'lucide-react';
import { type CommunityCommentDTO } from '@/api/community';

interface PostCommentsProps {
    comments: CommunityCommentDTO[];
    totalCount: number;
    onSubmit: (content: string) => Promise<void>;
}

export function PostComments({ comments, totalCount, onSubmit }: PostCommentsProps) {
    const [input, setInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!input.trim()) return;
        setIsSubmitting(true);
        try {
            await onSubmit(input);
            setInput('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100" id="comments">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-[#8B4513]/10 rounded-lg text-[#8B4513]">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900">
                    评论 <span className="text-gray-400 font-sans font-normal ml-1 text-base">{totalCount}</span>
                </h3>
            </div>

            {/* 输入框 */}
            <div className="relative mb-10 group">
                <Textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="分享你的见解..." 
                    className="min-h-[120px] resize-none bg-gray-50 border-gray-200 focus:border-[#8B4513]/50 focus:ring-[#8B4513]/20 rounded-xl p-4 text-base transition-all"
                />
                <div className="absolute bottom-3 right-3">
                    <Button 
                        size="sm" 
                        onClick={handleSubmit} 
                        disabled={!input.trim() || isSubmitting}
                        className="bg-[#8B4513] hover:bg-[#8B4513]/90 text-white rounded-lg shadow-sm"
                    >
                        {isSubmitting ? '发送中...' : <><Send className="w-3.5 h-3.5 mr-2" /> 发布评论</>}
                    </Button>
                </div>
            </div>

            {/* 评论列表 */}
            <div className="space-y-8">
                {comments.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        还没有人评论，快来抢沙发~
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            <Avatar className="w-10 h-10 border border-gray-100 mt-1">
                                <AvatarImage src={comment.authorAvatarUrl || undefined} />
                                <AvatarFallback className="bg-gray-100 text-gray-500 text-sm">
                                    {comment.authorName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 space-y-2">
                                <div className="flex items-baseline justify-between">
                                    <span className="font-semibold text-gray-900 text-sm">{comment.authorName}</span>
                                    <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="text-gray-700 leading-relaxed text-sm bg-gray-50/50 p-3 rounded-lg rounded-tl-none hover:bg-gray-50 transition-colors">
                                    {comment.content}
                                </div>
                                
                                {/* 这里可以加回复按钮 */}
                                <div className="flex gap-4 pt-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400">
                                    <button className="hover:text-[#8B4513]">回复</button>
                                    <button className="hover:text-[#8B4513]">点赞</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}