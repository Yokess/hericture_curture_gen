import { DesignProject } from '@/types/design';

// Mock AI 服务 - 实际项目中应该调用真实的 Gemini API
export const translateToDesignConcept = async (idea: string): Promise<Omit<DesignProject, 'id'>> => {
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock 返回数据
    return {
        conceptName: '皮影蓝牙音箱',
        designPhilosophy: '传统皮影艺术与现代音频技术的完美融合',
        culturalContext: '皮影戏是中国传统民间艺术,通过光影变化讲述故事。本设计将皮影的剪影美学融入现代音箱,让声音与光影共舞。',
        formFactor: '圆柱形主体,顶部可旋转的镂空皮影图案装饰层,底部为稳定基座',
        dimensions: '直径 120mm × 高度 180mm',
        userInteraction: '触摸顶部旋转层切换曲目,侧面音量调节,底部电源开关。内置 LED 灯光可投射皮影图案',
        materials: [
            { name: '竹木', finish: '哑光喷漆' },
            { name: '半透明亚克力', finish: '磨砂处理' },
            { name: '铝合金', finish: '阳极氧化' }
        ],
        colors: [
            { name: '墨黑', hex: '#1a1a1b' },
            { name: '朱砂红', hex: '#C41E3A' },
            { name: '金色', hex: '#D4AF37' }
        ],
        keyFeatures: [
            '360° 环绕立体声',
            '可旋转皮影图案装饰',
            'LED 光影投射功能',
            '蓝牙 5.0 连接',
            '12 小时续航'
        ]
    };
};

export const generateOrEditImage = async (
    prompt: string,
    base64Data?: string,
    mimeType?: string
): Promise<string> => {
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 返回占位图片(实际项目中应该调用 Gemini Image API)
    // 这里返回一个 data URL 占位图
    const isBlueprint = prompt.includes('technical sheet') || prompt.includes('Blueprint');

    if (isBlueprint) {
        // 返回草图风格的占位图
        return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#f5f4ed"/>
        <text x="400" y="300" font-family="serif" font-size="24" fill="#8B4513" text-anchor="middle">
          草图生成中...
        </text>
        <text x="400" y="340" font-family="sans-serif" font-size="14" fill="#666" text-anchor="middle">
          (实际项目中将调用 Gemini API 生成真实图片)
        </text>
      </svg>
    `);
    } else {
        // 返回效果图风格的占位图
        return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8B4513;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#D4AF37;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="#2C1810"/>
        <circle cx="400" cy="300" r="150" fill="url(#grad)"/>
        <text x="400" y="500" font-family="serif" font-size="20" fill="#D4AF37" text-anchor="middle">
          效果图渲染中...
        </text>
      </svg>
    `);
    }
};
