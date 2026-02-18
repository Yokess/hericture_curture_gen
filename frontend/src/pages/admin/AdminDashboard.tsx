import { useEffect, useMemo, useState } from 'react';
import { Users, BookOpen, Database, MessageSquare } from 'lucide-react';
import { adminApi } from '@/api/admin';
import { knowledgebaseApi } from '@/api/knowledgebase';
import { communityApi, type CommunityPostListItemDTO } from '@/api/community';
import { GrowthLineChartCard } from '@/components/admin/dashboard/GrowthLineChartCard';
import { ProjectCategoryBarChartCard } from '@/components/admin/dashboard/ProjectCategoryBarChartCard';
import { KnowledgebaseStatusDonutCard } from '@/components/admin/dashboard/KnowledgebaseStatusDonutCard';
import { UserStatusDonutCard } from '@/components/admin/dashboard/UserStatusDonutCard';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [totals, setTotals] = useState({
        users: 0,
        projects: 0,
        successors: 0,
        knowledgebases: 0,
        posts: 0,
    });
    const [kb, setKb] = useState({
        totalCount: 0,
        completedCount: 0,
        processingCount: 0,
        totalAccessCount: 0,
        totalQuestionCount: 0,
    });
    const [recentUsers, setRecentUsers] = useState<{ createdAt: string; enabled: boolean }[]>([]);
    const [recentPosts, setRecentPosts] = useState<Pick<CommunityPostListItemDTO, 'createdAt' | 'likeCount' | 'viewCount' | 'commentCount'>[]>([]);
    const [projectCategoryStats, setProjectCategoryStats] = useState<{ category: string; count: number }[]>([]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [usersPage, projectsPage, successorsPage, kbStats, postsPage] = await Promise.all([
                    adminApi.listUsers({ page: 0, size: 1 }),
                    adminApi.listHeritageProjects({ page: 0, size: 1 }),
                    adminApi.listSuccessors({ page: 0, size: 1 }),
                    knowledgebaseApi.getStatistics(),
                    communityApi.listPosts({ sort: 'latest', page: 0, size: 1 }),
                ]);

                setTotals({
                    users: usersPage.totalElements || 0,
                    projects: projectsPage.totalElements || 0,
                    successors: successorsPage.totalElements || 0,
                    knowledgebases: kbStats.totalCount || 0,
                    posts: postsPage.data.totalElements || 0,
                });

                setKb({
                    totalCount: kbStats.totalCount || 0,
                    completedCount: kbStats.completedCount || 0,
                    processingCount: kbStats.processingCount || 0,
                    totalAccessCount: kbStats.totalAccessCount || 0,
                    totalQuestionCount: kbStats.totalQuestionCount || 0,
                });

                const [usersRecentPage, postsRecentPage, projectsRecentPage] = await Promise.all([
                    adminApi.listUsers({ page: 0, size: 200 }),
                    communityApi.listPosts({ sort: 'latest', page: 0, size: 200 }),
                    adminApi.listHeritageProjects({ page: 0, size: 1 }),
                ]);

                setRecentUsers(
                    (usersRecentPage.content || [])
                        .filter((u) => !!u.createdAt)
                        .map((u) => ({ createdAt: u.createdAt, enabled: u.enabled }))
                );

                setRecentPosts(
                    (postsRecentPage.data.content || [])
                        .filter((p) => !!p.createdAt)
                        .map((p) => ({
                            createdAt: p.createdAt,
                            likeCount: p.likeCount,
                            viewCount: p.viewCount,
                            commentCount: p.commentCount,
                        }))
                );

                void projectsRecentPage;

                try {
                    const stats = await adminApi.listHeritageProjectCategoryStats(8);
                    setProjectCategoryStats(stats || []);
                } catch (e) {
                    console.error('加载类别分布失败:', e);
                    setProjectCategoryStats([]);
                }
            } catch (e) {
                console.error('加载概况数据失败:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const formatDay = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const buildDailySeries = (dateStrings: string[], days: number) => {
        const now = new Date();
        const labels: string[] = [];
        const map = new Map<string, number>();
        for (const s of dateStrings) {
            const d = new Date(s);
            if (Number.isNaN(d.getTime())) continue;
            const key = formatDay(d);
            map.set(key, (map.get(key) || 0) + 1);
        }
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            labels.push(formatDay(d));
        }
        return {
            labels,
            values: labels.map((l) => map.get(l) || 0),
        };
    };

    const userGrowth = useMemo(() => buildDailySeries(recentUsers.map((u) => u.createdAt), 14), [recentUsers]);
    const postGrowth = useMemo(() => buildDailySeries(recentPosts.map((p) => p.createdAt), 14), [recentPosts]);

    const userStatus = useMemo(() => {
        let enabled = 0;
        let banned = 0;
        for (const u of recentUsers) {
            if (u.enabled) enabled += 1;
            else banned += 1;
        }
        return { enabled, banned };
    }, [recentUsers]);

    const projectCategoryTop = useMemo(() => {
        return {
            categories: projectCategoryStats.map((x) => x.category),
            counts: projectCategoryStats.map((x) => x.count),
        };
    }, [projectCategoryStats]);

    const engagement = useMemo(() => {
        const sum = recentPosts.reduce(
            (acc, p) => {
                acc.likes += p.likeCount || 0;
                acc.views += p.viewCount || 0;
                acc.comments += p.commentCount || 0;
                return acc;
            },
            { likes: 0, views: 0, comments: 0 }
        );
        return sum;
    }, [recentPosts]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">概况预览</h1>
                <p className="text-gray-600 mt-2">欢迎回来，查看今日系统运行状态</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="总用户数"
                    value={totals.users}
                    subtitle={loading ? '加载中…' : `启用 ${userStatus.enabled} / 禁用 ${userStatus.banned}`}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="非遗项目"
                    value={totals.projects}
                    subtitle={loading ? '加载中…' : '项目库条目'}
                    icon={BookOpen}
                    color="amber"
                />
                <StatCard
                    title="知识库文档"
                    value={totals.knowledgebases}
                    subtitle={loading ? '加载中…' : `完成 ${kb.completedCount} / 处理中 ${kb.processingCount}`}
                    icon={Database}
                    color="purple"
                />
                <StatCard
                    title="社区帖子"
                    value={totals.posts}
                    subtitle={loading ? '加载中…' : `近200条：👍${engagement.likes} 👁${engagement.views} 💬${engagement.comments}`}
                    icon={MessageSquare}
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GrowthLineChartCard
                    labels={userGrowth.labels.map((l) => l.slice(5))}
                    userGrowth={userGrowth.values}
                    postGrowth={postGrowth.values}
                />

                <ProjectCategoryBarChartCard
                    categories={projectCategoryTop.categories.slice().reverse()}
                    counts={projectCategoryTop.counts.slice().reverse()}
                />

                <KnowledgebaseStatusDonutCard
                    completed={kb.completedCount}
                    processing={kb.processingCount}
                    pending={Math.max(0, kb.totalCount - kb.completedCount - kb.processingCount)}
                    totalAccessCount={kb.totalAccessCount}
                    totalQuestionCount={kb.totalQuestionCount}
                />

                <UserStatusDonutCard enabled={userStatus.enabled} banned={userStatus.banned} />
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
}: {
    title: string;
    value: number;
    subtitle: string;
    icon: any;
    color: 'blue' | 'amber' | 'purple' | 'green';
}) {
    const colorClasses: any = {
        blue: "bg-blue-50 text-blue-600",
        amber: "bg-amber-50 text-amber-600",
        purple: "bg-purple-50 text-purple-600",
        green: "bg-green-50 text-green-600",
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                    {title}
                </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{value.toLocaleString('zh-CN')}</h3>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
    );
}
