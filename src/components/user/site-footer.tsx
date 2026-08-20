// Shared user-facing Footer (docs/user/user-ui.md "Shared Footer").
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-12 text-center">
        <p className="text-body font-semibold text-text-primary">HKUST Korean Students Association</p>
        <a
          href="https://www.instagram.com/hkustsu_ksa/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-meta text-text-secondary transition-colors hover:text-brand-800"
        >
          Instagram · @hkustsu_ksa
        </a>
        <p className="text-meta text-text-secondary">Clear Water Bay, Kowloon, Hong Kong</p>
        <p className="text-meta text-text-muted">© 2026 HKUST Korean Students Association</p>
      </div>
    </footer>
  );
}
