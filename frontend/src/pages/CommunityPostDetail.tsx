import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { communityApi, type CommunityCommentDTO, type CommunityPostDetailDTO } from '@/api/community';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

// 引入拆分后的子组件
import { PostGallery } from '@/components/community/detail/PostGallery';
import { PostSidebar } from '@/components/community/detail/PostSidebar';
import { PostContent } from '@/components/community/detail/PostContent';
import { PostComments } from '@/components/community/detail/PostComments';

export default function CommunityPostDetail() {
  const { id } = useParams();
  const postId = Number(id);
  const navigate = useNavigate();

  const [post, setPost] = useState<CommunityPostDetailDTO | null>(null);
  const [comments, setComments] = useState<CommunityCommentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // 用于触发评论刷新

  // --- 数据加载逻辑 ---
  useEffect(() => {
    if (!postId) return;
    const fetchData = async () => {
      try {
        const [p, c] = await Promise.all([
            communityApi.getPost(postId), 
            communityApi.listComments(postId)
        ]);
        setPost(p.data);
        setComments(c.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [postId, refreshTrigger]);

  // --- 交互逻辑 ---
  const handleLike = async () => {
    if (!post) return;
    try {
      const res = await communityApi.toggleLike(post.id);
      setPost(prev => prev ? { ...prev, liked: res.data.active, likeCount: res.data.likeCount ?? prev.likeCount } : null);
    } catch (e) { alert('操作失败，请先登录'); }
  };

  const handleCollect = async () => {
    if (!post) return;
    try {
      const res = await communityApi.toggleCollect(post.id);
      setPost(prev => prev ? { ...prev, collected: res.data.active } : null);
    } catch (e) { alert('操作失败，请先登录'); }
  };

  const handleCommentSubmit = async (content: string) => {
      if (!post) return;
      await communityApi.addComment(post.id, { content });
      setRefreshTrigger(prev => prev + 1); // 触发刷新
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B4513]" />
      </div>
    );
  }

  if (!post) {
      return (
          <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="w-12 h-12 text-gray-400" />
              <p className="text-gray-500">内容不存在或已被删除</p>
              <Button variant="outline" onClick={() => navigate(-1)}>返回</Button>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-[#F9F9F7] selection:bg-[#D4AF37]/30">
      <Navbar />

      <main className="pt-28 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 顶部导航 */}
          <div className="mb-6">
            <Button 
                variant="ghost" 
                className="text-gray-500 hover:text-[#8B4513] hover:bg-[#8B4513]/5 pl-0" 
                onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> 返回探索
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* 左侧主要内容区 (占 8 列) */}
            <div className="lg:col-span-8 space-y-10">
                {/* 1. 画廊组件 */}
                <PostGallery artifact={post.artifact} title={post.title} />

                {/* 2. 内容详情组件 */}
                <PostContent 
                    title={post.title} 
                    content={post.content} 
                    tags={post.tags} 
                    createdAt={post.createdAt} 
                />

                {/* 3. 评论组件 */}
                <PostComments 
                    comments={comments} 
                    totalCount={post.commentCount} 
                    onSubmit={handleCommentSubmit} 
                />
            </div>

            {/* 右侧悬浮侧边栏 (占 4 列) */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
                <PostSidebar 
                    post={post}
                    onLike={handleLike}
                    onCollect={handleCollect}
                />
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}