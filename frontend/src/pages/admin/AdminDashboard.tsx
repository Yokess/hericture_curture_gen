import { Users, BookOpen, Database, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
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
                    value="1,234"
                    trend="+12%"
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="非遗项目"
                    value="56"
                    trend="+3"
                    icon={BookOpen}
                    color="amber"
                />
                <StatCard
                    title="知识库文档"
                    value="892"
                    trend="+25"
                    icon={Database}
                    color="purple"
                />
                <StatCard
                    title="今日活跃"
                    value="423"
                    trend="+5%"
                    icon={TrendingUp}
                    color="green"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500 h-96 flex flex-col items-center justify-center">
                <TrendingUp className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg">数据图表区域正在开发中...</p>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon: Icon, color }: any) {
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
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {trend}
                </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <p className="text-sm text-gray-500 mt-1">{title}</p>
        </div>
    );
}
