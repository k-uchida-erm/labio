export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-2xl font-bold text-white shadow-lg shadow-emerald-500/25">
            L
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Labio</h1>
        </div>

        {/* Tagline */}
        <p className="max-w-md text-lg text-slate-400">
          大学の研究室DXを実現する
          <br />
          <span className="text-emerald-400">研究管理プラットフォーム</span>
        </p>

        {/* Status Badge */}
        <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          開発中
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: '📊', title: '進捗管理', desc: '研究テーマを一元管理' },
            { icon: '📝', title: 'Activity', desc: 'タスク・実験ノート・質問' },
            { icon: '🤖', title: 'AI要約', desc: '自動で資料生成' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 backdrop-blur"
            >
              <div className="mb-2 text-2xl">{feature.icon}</div>
              <h3 className="font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
