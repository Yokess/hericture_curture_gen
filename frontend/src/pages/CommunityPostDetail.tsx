import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { communityApi, type CommunityCommentDTO, type CommunityPostDetailDTO } from '@/api/community';
import { ArrowLeft, Bookmark, Heart, Loader2, MessageSquare, Copy, ExternalLink } from 'lucide-react';

export default function CommunityPostDetail() {
  const { id } = useParams();
  const postId = Number(id);
  const navigate = useNavigate();

  const [post, setPost] = useState<CommunityPostDetailDTO | null>(null);
  const [comments, setComments] = useState<CommunityCommentDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const imageItems = useMemo(() => {
    const a = post?.artifact;
    return [
      { value: 'kv', label: '商业KV', url: a?.kvUrl || null, aspect: 'vertical' as const },
      { value: 'lifestyle', label: '场景', url: a?.lifestyleUrl || null, aspect: 'vertical' as const },
      { value: 'detail', label: '细节', url: a?.detailUrl || null, aspect: 'vertical' as const },
      { value: 'render', label: '实物', url: a?.productShotUrl || null, aspect: 'square' as const },
      { value: 'blueprint', label: '草图', url: a?.blueprintUrl || null, aspect: 'square' as const },
    ].filter((x) => !!x.url);
  }, [post]);

  const firstImageValue = useMemo(() => imageItems[0]?.value || 'kv', [imageItems]);
  const [activeImage, setActiveImage] = useState(firstImageValue);

  useEffect(() => {
    setActiveImage(firstImageValue);
  }, [firstImageValue]);

  const load = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const [p, c] = await Promise.all([communityApi.getPost(postId), communityApi.listComments(postId)]);
      setPost(p.data);
      setComments(c.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const toggleLike = async () => {
    if (!postId) return;
    try {
      const res = await communityApi.toggleLike(postId);
      const data = res.data;
      setPost((prev) =>
        prev
          ? {
              ...prev,
              liked: data.active,
              likeCount: typeof data.likeCount === 'number' ? data.likeCount : prev.likeCount,
            }
          : prev
      );
    } catch (e) {
      console.error(e);
      alert('点赞失败，请先登录');
    }
  };

  const toggleCollect = async () => {
    if (!postId) return;
    try {
      const res = await communityApi.toggleCollect(postId);
      setPost((prev) => (prev ? { ...prev, collected: res.data.active } : prev));
    } catch (e) {
      console.error(e);
      alert('收藏失败，请先登录');
    }
  };

  const submitComment = async () => {
    if (!postId) return;
    const content = commentInput.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      await communityApi.addComment(postId, { content });
      setCommentInput('');
      await load();
    } catch (e) {
      console.error(e);
      alert('评论失败，请先登录');
    } finally {
      setSubmitting(false);
    }
  };

  const copyRemixPrompt = async () => {
    const text = post?.remixPrompt || '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      alert('已复制提示词');
    } catch {
      alert('复制失败，请手动复制');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      <Navbar />

      <section className="pt-28 pb-10 px-4">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> 返回
          </Button>

          {loading && (
            <div className="py-20 flex items-center justify-center text-gray-500">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> 加载中…
            </div>
          )}

          {!loading && post && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <Card className="overflow-hidden border-gray-200/70">
                  {imageItems.length ? (
                    <Tabs value={activeImage} onValueChange={setActiveImage} className="w-full">
                      <div className="px-4 pt-4">
                        <TabsList className="bg-white/70">
                          {imageItems.map((it) => (
                            <TabsTrigger key={it.value} value={it.value}>
                              {it.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>
                      {imageItems.map((it) => (
                        <TabsContent key={it.value} value={it.value}>
                          <div className="px-4 pb-4">
                            <div className="flex justify-end mb-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/80"
                                onClick={() => window.open(it.url as string, '_blank', 'noopener,noreferrer')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" /> 打开原图
                              </Button>
                            </div>
                            <div
                              className={[
                                'w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#8B4513]/12 to-[#D4AF37]/12 ring-1 ring-black/5',
                                it.aspect === 'vertical' ? 'aspect-[9/16]' : 'aspect-square',
                              ].join(' ')}
                            >
                              <img src={it.url as string} alt={post.title} className="w-full h-full object-contain bg-white/40" />
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    <div className="aspect-[4/5] flex items-center justify-center text-5xl opacity-60">✦</div>
                  )}
                </Card>

                <Card className="p-6 border-gray-200/70">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h1 className="font-serif text-3xl font-bold text-[#8B4513] leading-snug">{post.title}</h1>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {(post.tags || []).map((t) => (
                          <Badge key={t} variant="secondary" className="bg-[#F5F5DC] text-[#8B4513]">
                            {t}
                          </Badge>
                        ))}
                      </div>
                      {post.content ? (
                        <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      ) : null}
                    </div>
                    <div className="shrink-0 flex flex-col gap-2">
                      <Button variant={post.liked ? 'default' : 'outline'} onClick={toggleLike} className={post.liked ? 'bg-[#8B4513] hover:bg-[#8B4513]/90' : ''}>
                        <Heart className="w-4 h-4 mr-2" /> {post.likeCount}
                      </Button>
                      <Button variant={post.collected ? 'default' : 'outline'} onClick={toggleCollect} className={post.collected ? 'bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black' : ''}>
                        <Bookmark className="w-4 h-4 mr-2" /> 收藏
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-gray-200/70">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[#8B4513] font-bold">
                      <MessageSquare className="w-4 h-4" /> 评论（{post.commentCount}）
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Textarea value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="写下你的想法…" className="bg-white" />
                    <div className="flex justify-end">
                      <Button onClick={submitComment} disabled={submitting || !commentInput.trim()} className="bg-[#8B4513] hover:bg-[#8B4513]/90">
                        {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        发表评论
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {comments.length === 0 ? <div className="text-sm text-gray-500">暂无评论</div> : null}
                    {comments.map((c) => (
                      <div key={c.id} className="border-t border-gray-200/70 pt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8B4513] to-[#D4AF37] overflow-hidden ring-1 ring-black/5">
                            {c.authorAvatarUrl ? <img src={c.authorAvatarUrl} alt={c.authorName} className="w-full h-full object-cover" /> : null}
                          </div>
                          <div className="text-sm font-medium text-gray-800">{c.authorName}</div>
                          <div className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{c.content}</div>
                        {(c.replies || []).length ? (
                          <div className="mt-3 pl-4 border-l border-gray-200 space-y-3">
                            {(c.replies || []).map((r) => (
                              <div key={r.id}>
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8B4513] to-[#D4AF37] overflow-hidden ring-1 ring-black/5">
                                    {r.authorAvatarUrl ? <img src={r.authorAvatarUrl} alt={r.authorName} className="w-full h-full object-cover" /> : null}
                                  </div>
                                  <div className="text-sm font-medium text-gray-800">{r.authorName}</div>
                                  <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>
                                </div>
                                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{r.content}</div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 border-gray-200/70">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">作者</div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B4513] to-[#D4AF37] overflow-hidden ring-1 ring-black/5">
                      {post.authorAvatarUrl ? <img src={post.authorAvatarUrl} alt={post.authorName} className="w-full h-full object-cover" /> : null}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{post.authorName}</div>
                      <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-gray-200/70">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">同款提示词</div>
                    <Button variant="ghost" size="sm" onClick={copyRemixPrompt} disabled={!post.remixPrompt}>
                      <Copy className="w-4 h-4 mr-2" /> 复制
                    </Button>
                  </div>
                  {post.remixPrompt ? (
                    <pre className="text-xs whitespace-pre-wrap break-words bg-gray-50 rounded-lg p-3 border border-gray-200/70 max-h-[360px] overflow-auto">
                      {post.remixPrompt}
                    </pre>
                  ) : (
                    <div className="text-sm text-gray-500">该作品暂未提供可复用提示词</div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {!loading && !post ? <div className="py-20 text-center text-gray-500">帖子不存在或已删除</div> : null}
        </div>
      </section>

      <Footer />
    </div>
  );
}
