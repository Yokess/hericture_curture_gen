import type {
    User,
    UserAchievement,
    HeritageProject,
    HeritageSuccessor,
    DesignArtifact,
    CreativeSession,
    Video,
    ProcessStep,
    CommunityPost,
    Comment,
    UserWithStats,
    ProjectWithSuccessors,
    VideoWithSteps,
    PostWithDetails,
} from '../types';

// ==================== 用户数据 ====================

export const mockUsers: User[] = [
    {
        id: 1,
        username: 'heritage_lover',
        nickname: '非遗守护者',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
        email: 'heritage@example.com',
        phone: '13800138001',
        status: 'ACTIVE',
        createdAt: '2024-01-15T08:30:00Z',
        updatedAt: '2026-01-20T10:00:00Z',
    },
    {
        id: 2,
        username: 'designer_wang',
        nickname: '王设计师',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
        email: 'wang@example.com',
        status: 'ACTIVE',
        createdAt: '2024-03-20T14:20:00Z',
        updatedAt: '2026-01-19T16:30:00Z',
    },
    {
        id: 3,
        username: 'culture_explorer',
        nickname: '文化探索者',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
        email: 'explorer@example.com',
        status: 'ACTIVE',
        createdAt: '2024-06-10T09:15:00Z',
        updatedAt: '2026-01-18T11:45:00Z',
    },
];

export const mockAchievements: UserAchievement[] = [
    {
        id: 1,
        userId: 1,
        achievementName: '数字传承官',
        badgeIconUrl: '🏆',
        obtainedAt: '2024-12-01T10:00:00Z',
    },
    {
        id: 2,
        userId: 1,
        achievementName: '创意先锋',
        badgeIconUrl: '⭐',
        obtainedAt: '2025-03-15T14:30:00Z',
    },
    {
        id: 3,
        userId: 2,
        achievementName: '设计大师',
        badgeIconUrl: '🎨',
        obtainedAt: '2025-06-20T16:00:00Z',
    },
];

// ==================== 非遗项目数据 ====================

export const mockProjects: HeritageProject[] = [
    {
        id: 1,
        officialId: 'Ⅰ-001',
        name: '苗族古歌',
        category: '民间文学',
        location: '贵州省台江县',
        description: '苗族古歌是苗族人民世代相传的口头文学,内容涉及苗族社会历史、神话传说、生产生活等各个方面。古歌采用传统的五言或七言诗体,语言优美,节奏感强,是研究苗族历史文化的重要资料。',
        batch: '2006(第一批)',
        officialUrl: 'http://www.ihchina.cn/project_details/1',
        createdAt: '2024-01-10T00:00:00Z',
    },
    {
        id: 2,
        officialId: 'Ⅶ-023',
        name: '景德镇传统手工制瓷技艺',
        category: '传统技艺',
        location: '江西省景德镇市',
        description: '景德镇制瓷技艺历史悠久,以"白如玉、明如镜、薄如纸、声如磬"著称。传统手工制瓷包括拉坯、利坯、画坯、施釉、烧窑等72道工序,每道工序都需要精湛的技艺和丰富的经验。',
        batch: '2006(第一批)',
        officialUrl: 'http://www.ihchina.cn/project_details/23',
        createdAt: '2024-01-10T00:00:00Z',
    },
    {
        id: 3,
        officialId: 'Ⅷ-056',
        name: '剪纸(蔚县剪纸)',
        category: '传统美术',
        location: '河北省蔚县',
        description: '蔚县剪纸以其独特的点彩工艺闻名,采用阴刻为主、阳刻为辅的刀工技法,色彩艳丽,构图饱满。作品题材丰富,包括花鸟鱼虫、戏曲人物、民俗风情等,具有浓郁的乡土气息。',
        batch: '2006(第一批)',
        officialUrl: 'http://www.ihchina.cn/project_details/56',
        createdAt: '2024-01-10T00:00:00Z',
    },
    {
        id: 4,
        officialId: 'Ⅹ-089',
        name: '侗族大歌',
        category: '传统音乐',
        location: '贵州省黎平县',
        description: '侗族大歌是侗族地区一种多声部、无指挥、无伴奏的民间合唱形式。歌声悠扬婉转,和声优美,被誉为"天籁之音"。大歌内容涉及祖先来源、民族迁徙、英雄故事等,是侗族文化的重要载体。',
        batch: '2006(第一批)',
        createdAt: '2024-01-10T00:00:00Z',
    },
];

export const mockSuccessors: HeritageSuccessor[] = [
    {
        id: 1,
        projectId: 1,
        name: '王安江',
        gender: '男',
        birthYear: '1956',
        description: '国家级非遗传承人,从事苗族古歌传承40余年,精通苗族历史古歌、迁徙古歌等多种类型。',
        createdAt: '2024-01-10T00:00:00Z',
    },
    {
        id: 2,
        projectId: 2,
        name: '邱含',
        gender: '女',
        birthYear: '1968',
        description: '国家级非遗传承人,景德镇陶瓷世家第四代传人,擅长青花、粉彩等传统技艺。',
        createdAt: '2024-01-10T00:00:00Z',
    },
    {
        id: 3,
        projectId: 3,
        name: '周淑英',
        gender: '女',
        birthYear: '1945',
        description: '国家级非遗传承人,蔚县剪纸大师,作品多次在国内外展出并获奖。',
        createdAt: '2024-01-10T00:00:00Z',
    },
];

// ==================== AI 设计数据 ====================

export const mockSessions: CreativeSession[] = [
    {
        id: 1,
        userId: 1,
        title: '剪纸元素台灯设计',
        createdAt: '2026-01-15T10:30:00Z',
    },
    {
        id: 2,
        userId: 2,
        title: '青花瓷纹样手机壳',
        createdAt: '2026-01-18T14:20:00Z',
    },
];

export const mockArtifacts: DesignArtifact[] = [
    {
        id: 1,
        userId: 1,
        designName: '蔚县剪纸艺术台灯',
        designConcept: '本设计将蔚县剪纸的传统图案与现代照明功能相结合。灯罩采用半透明材质,内部镂刻剪纸纹样,通电后光影交错,营造出温馨的氛围。底座采用实木材质,体现自然质朴的美感。设计寓意:传统文化照亮现代生活。',
        imageKeys: ['designs/lamp_1.jpg', 'designs/lamp_2.jpg', 'designs/lamp_3.jpg'],
        selectedIndex: 0,
        generationMetadata: {
            model: 'Hunyuan-DiT',
            costMs: 5400,
            requestId: 'req_abc123',
        },
        createdAt: '2026-01-15T11:00:00Z',
    },
    {
        id: 2,
        userId: 2,
        designName: '青花瓷韵手机保护壳',
        designConcept: '提取景德镇青花瓷的经典纹样,以现代简约的方式重新演绎。主图案为缠枝莲花,象征纯洁高雅。配色采用传统青白对比,边缘加入金色点缀,提升质感。材质建议:PC+TPU双层结构,表面UV工艺呈现瓷器光泽。',
        imageKeys: ['designs/case_1.jpg', 'designs/case_2.jpg'],
        selectedIndex: 0,
        generationMetadata: {
            model: 'Hunyuan-DiT',
            costMs: 4800,
            requestId: 'req_def456',
        },
        createdAt: '2026-01-18T15:00:00Z',
    },
    {
        id: 3,
        userId: 1,
        designName: '苗族银饰风格耳环',
        designConcept: '灵感来源于苗族传统银饰的镂空工艺和几何纹样。采用925银材质,手工锻造成型。主体为圆形镂空结构,内部嵌入苗族特色的蝴蝶纹样,象征自由与美好。表面做旧处理,呈现复古质感。',
        imageKeys: ['designs/earring_1.jpg'],
        selectedIndex: 0,
        createdAt: '2026-01-20T09:30:00Z',
    },
];

// ==================== 视频档案数据 ====================

export const mockVideos: Video[] = [
    {
        id: 1,
        userId: 1,
        projectId: 2,
        originalFilename: '景德镇拉坯技艺.mp4',
        videoKey: 'videos/pottery_throwing.mp4',
        fileSize: 157286400,
        mimeType: 'video/mp4',
        analysisStatus: 'COMPLETED',
        createdAt: '2026-01-10T08:00:00Z',
    },
    {
        id: 2,
        userId: 2,
        projectId: 3,
        originalFilename: '蔚县剪纸制作全程.mp4',
        videoKey: 'videos/paper_cutting.mp4',
        fileSize: 98304000,
        mimeType: 'video/mp4',
        analysisStatus: 'COMPLETED',
        createdAt: '2026-01-12T10:30:00Z',
    },
    {
        id: 3,
        userId: 1,
        projectId: 1,
        originalFilename: '苗族古歌演唱.mp4',
        videoKey: 'videos/miao_song.mp4',
        fileSize: 52428800,
        mimeType: 'video/mp4',
        analysisStatus: 'PROCESSING',
        createdAt: '2026-01-20T14:00:00Z',
    },
];

export const mockProcessSteps: ProcessStep[] = [
    {
        id: 1,
        videoId: 1,
        stepOrder: 1,
        stepName: '揉泥',
        description: '将瓷土反复揉搓,排除气泡,使泥料均匀细腻,为拉坯做准备。',
        keyframeKey: 'keyframes/pottery_step1.jpg',
        startTimeMs: 0,
        endTimeMs: 45000,
        createdAt: '2026-01-10T09:00:00Z',
    },
    {
        id: 2,
        videoId: 1,
        stepOrder: 2,
        stepName: '拉坯',
        description: '将泥料置于转盘中心,双手配合,边旋转边向上提拉,塑造器型。',
        keyframeKey: 'keyframes/pottery_step2.jpg',
        startTimeMs: 45000,
        endTimeMs: 180000,
        createdAt: '2026-01-10T09:00:00Z',
    },
    {
        id: 3,
        videoId: 1,
        stepOrder: 3,
        stepName: '修坯',
        description: '待坯体半干后,用刀具修整器型,使壁厚均匀,线条流畅。',
        keyframeKey: 'keyframes/pottery_step3.jpg',
        startTimeMs: 180000,
        endTimeMs: 280000,
        createdAt: '2026-01-10T09:00:00Z',
    },
    {
        id: 4,
        videoId: 2,
        stepOrder: 1,
        stepName: '设计构图',
        description: '根据主题设计图案,在纸上绘制草图,确定整体布局和细节。',
        keyframeKey: 'keyframes/cutting_step1.jpg',
        startTimeMs: 0,
        endTimeMs: 60000,
        createdAt: '2026-01-12T11:00:00Z',
    },
    {
        id: 5,
        videoId: 2,
        stepOrder: 2,
        stepName: '阴刻雕刻',
        description: '使用刻刀按照图案进行阴刻,刀法要稳准,线条流畅。',
        keyframeKey: 'keyframes/cutting_step2.jpg',
        startTimeMs: 60000,
        endTimeMs: 240000,
        createdAt: '2026-01-12T11:00:00Z',
    },
    {
        id: 6,
        videoId: 2,
        stepOrder: 3,
        stepName: '点彩上色',
        description: '用毛笔蘸取颜料,在镂空部分点染色彩,层次分明,色彩艳丽。',
        keyframeKey: 'keyframes/cutting_step3.jpg',
        startTimeMs: 240000,
        endTimeMs: 360000,
        createdAt: '2026-01-12T11:00:00Z',
    },
];

// ==================== 社区数据 ====================

export const mockPosts: CommunityPost[] = [
    {
        id: 1,
        userId: 1,
        artifactId: 1,
        projectId: 3,
        title: '我的第一个非遗文创设计 - 剪纸台灯',
        content: '一直很喜欢蔚县剪纸的艺术,这次尝试将它与现代家居结合,设计了这款台灯。希望大家喜欢!',
        tags: ['剪纸', '台灯', '现代中式'],
        viewCount: 1523,
        likeCount: 89,
        isPinned: true,
        createdAt: '2026-01-15T12:00:00Z',
        updatedAt: '2026-01-15T12:00:00Z',
    },
    {
        id: 2,
        userId: 2,
        artifactId: 2,
        projectId: 2,
        title: '青花瓷手机壳设计分享',
        content: '青花瓷的美在于它的简约与优雅,这次设计尝试用最简单的线条表达最深的韵味。',
        tags: ['青花瓷', '手机壳', '文创产品'],
        viewCount: 2341,
        likeCount: 156,
        isPinned: false,
        createdAt: '2026-01-18T16:00:00Z',
        updatedAt: '2026-01-18T16:00:00Z',
    },
    {
        id: 3,
        userId: 1,
        artifactId: 3,
        projectId: 1,
        title: '苗族银饰风格耳环 - 传统与时尚的碰撞',
        content: '苗族银饰的工艺真的太精湛了!这次设计保留了传统的镂空技法,但在造型上做了现代化处理,希望能让更多年轻人喜欢。',
        tags: ['苗族', '银饰', '耳环', '首饰设计'],
        viewCount: 987,
        likeCount: 67,
        isPinned: false,
        createdAt: '2026-01-20T10:00:00Z',
        updatedAt: '2026-01-20T10:00:00Z',
    },
];

export const mockComments: Comment[] = [
    {
        id: 1,
        postId: 1,
        userId: 2,
        content: '太棒了!这个设计很有创意,传统与现代结合得恰到好处👍',
        createdAt: '2026-01-15T13:30:00Z',
    },
    {
        id: 2,
        postId: 1,
        userId: 3,
        content: '请问可以分享一下设计思路吗?我也想尝试类似的设计',
        createdAt: '2026-01-15T14:00:00Z',
    },
    {
        id: 3,
        postId: 1,
        userId: 1,
        content: '谢谢!主要是从剪纸的镂空特点出发,考虑光影效果',
        parentId: 2,
        createdAt: '2026-01-15T15:00:00Z',
    },
    {
        id: 4,
        postId: 2,
        userId: 1,
        content: '青花瓷的韵味把握得很好,简约而不简单!',
        createdAt: '2026-01-18T17:00:00Z',
    },
    {
        id: 5,
        postId: 2,
        userId: 3,
        content: '想买!什么时候能量产?😍',
        createdAt: '2026-01-18T18:30:00Z',
    },
];

// ==================== 组合数据 (带关联信息) ====================

export const mockUsersWithStats: UserWithStats[] = mockUsers.map((user) => ({
    ...user,
    totalDesigns: mockArtifacts.filter((a) => a.userId === user.id).length,
    totalLikes: mockPosts
        .filter((p) => p.userId === user.id)
        .reduce((sum, p) => sum + p.likeCount, 0),
    totalCollections: Math.floor(Math.random() * 50),
    achievements: mockAchievements.filter((a) => a.userId === user.id),
}));

export const mockProjectsWithSuccessors: ProjectWithSuccessors[] = mockProjects.map(
    (project) => ({
        ...project,
        successors: mockSuccessors.filter((s) => s.projectId === project.id),
    })
);

export const mockVideosWithSteps: VideoWithSteps[] = mockVideos.map((video) => ({
    ...video,
    steps: mockProcessSteps.filter((s) => s.videoId === video.id),
    project: mockProjects.find((p) => p.id === video.projectId),
}));

export const mockPostsWithDetails: PostWithDetails[] = mockPosts.map((post) => {
    const postComments = mockComments.filter((c) => c.postId === post.id && !c.parentId);

    return {
        ...post,
        user: mockUsers.find((u) => u.id === post.userId)!,
        artifact: mockArtifacts.find((a) => a.id === post.artifactId),
        project: mockProjects.find((p) => p.id === post.projectId),
        comments: postComments.map((comment) => ({
            ...comment,
            user: mockUsers.find((u) => u.id === comment.userId),
            replies: mockComments.filter((c) => c.parentId === comment.id).map((reply) => ({
                ...reply,
                user: mockUsers.find((u) => u.id === reply.userId),
            })),
        })),
        isLiked: Math.random() > 0.5,
        isCollected: Math.random() > 0.7,
    };
});

// ==================== 导出所有数据 ====================

export const mockData = {
    users: mockUsers,
    achievements: mockAchievements,
    projects: mockProjects,
    successors: mockSuccessors,
    sessions: mockSessions,
    artifacts: mockArtifacts,
    videos: mockVideos,
    processSteps: mockProcessSteps,
    posts: mockPosts,
    comments: mockComments,
    // 组合数据
    usersWithStats: mockUsersWithStats,
    projectsWithSuccessors: mockProjectsWithSuccessors,
    videosWithSteps: mockVideosWithSteps,
    postsWithDetails: mockPostsWithDetails,
};
