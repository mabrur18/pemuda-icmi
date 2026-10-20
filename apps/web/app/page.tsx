export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl bg-surface border border-border rounded-card p-8 shadow-sm">
        <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase bg-brand-soft text-brand rounded-full">
          Portal Resmi
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
          Pemuda ICMI Kota Bekasi
        </h1>
        <p className="text-muted leading-relaxed mb-6">
          Situs web resmi Organisasi Daerah Pemuda ICMI Kota Bekasi. Membangun sinergi,
          cendekia, dan kepemimpinan pemuda untuk kemaslahatan umat dan bangsa.
        </p>
        <div className="text-xs text-muted">
          Status: Tahap 0 — Fondasi Repositori Aktif
        </div>
      </div>
    </main>
  );
}
