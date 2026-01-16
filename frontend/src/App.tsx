import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            🏮 非遗文化智能创意生成平台
          </h1>
          <p className="text-lg text-slate-600">
            融合RAG技术与扩散模型的智能平台
          </p>
        </div>

        <div className="space-y-4 text-left bg-slate-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-slate-700 mb-3">核心功能模块</h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎓</span>
              <div>
                <h3 className="font-semibold text-slate-800">智能非遗专家系统</h3>
                <p className="text-sm text-slate-600">基于RAG的语义精准问答，知识源溯源</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🎨</span>
              <div>
                <h3 className="font-semibold text-slate-800">AI文创设计工作站</h3>
                <p className="text-sm text-slate-600">工业设计草图生成，商业效果图渲染</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">📹</span>
              <div>
                <h3 className="font-semibold text-slate-800">技艺数字化档案</h3>
                <p className="text-sm text-slate-600">视频异步解析，自动工序提取</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🌐</span>
              <div>
                <h3 className="font-semibold text-slate-800">创意分享社区</h3>
                <p className="text-sm text-slate-600">作品广场，创意Remix，社交互动</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-slate-500 text-sm">
          <p>平台开发中... 敬请期待</p>
        </div>
      </div>
    </div>
  );
}

export default App;
