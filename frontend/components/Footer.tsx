import { SITE_LINKS } from "@/lib/siteLinks";

const LINKS = {
  Platform: [
    { label: "Browse games",  href: "/#games" },
    { label: "Upload a game", href: "/upload" },
    { label: "Dev dashboard", href: "/#dashboard" },
  ],
  Company: [
    { label: "About",         href: SITE_LINKS.about },
  ],
  Legal: [
    { label: "Privacy policy",   href: "#" },
    { label: "Terms of service", href: "#" },
  ],
};

const SOCIAL_ICONS = [
  {
    label: "GitHub",
    href: SITE_LINKS.github,
    path: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
  },
  {
    label: "X (Twitter)",
    href: SITE_LINKS.x,
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "LinkedIn",
    href: SITE_LINKS.linkedin,
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "Discord",
    href: SITE_LINKS.discord,
    path: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.057a19.9 19.9 0 0 0 5.993 3.029.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.029.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z",
  },
];

export default function Footer() {
  const activeSocials = SOCIAL_ICONS.filter((s) => s.href !== "");

  return (
    <footer className="border-t border-nr-border bg-nr-surface">
      <div className="mx-auto max-w-7xl px-5 py-14">

        <div className="grid gap-10 md:grid-cols-[220px_1fr]">

          {/* Brand */}
          <div>
            <a href="/" className="inline-flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="11" stroke="#DC2626" strokeWidth="1.5" fill="none" />
                <polygon points="12,8 16,10.5 16,13.5 12,16 8,13.5 8,10.5" fill="#DC2626" opacity="0.9" />
              </svg>
              <span className="font-sans text-base font-bold text-nr-ink">Novarite</span>
            </a>
            <p className="mt-3 max-w-[200px] font-sans text-sm leading-relaxed text-nr-muted">
              A platform for indie games and the people building them.
            </p>
            {activeSocials.length > 0 && (
              <div className="mt-4 flex gap-3">
                {activeSocials.map(({ label, href, path }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-nr-border bg-white text-nr-faint transition-colors hover:border-nr-ring hover:text-nr-muted"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {(Object.entries(LINKS) as [string, { label: string; href: string }[]][]).map(
              ([group, items]) => (
                <div key={group}>
                  <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-nr-faint">
                    {group}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {items.map(({ label, href }) => (
                      <li key={label}>
                        <a
                          href={href}
                          className="font-sans text-sm text-nr-muted transition-colors hover:text-nr-ink"
                        >
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>
        </div>

        {/* Bottom rule */}
        <div className="rule-fade mt-12" />

        <div className="mt-6 flex flex-col items-center justify-between gap-2 font-sans text-xs text-nr-faint md:flex-row">
          <p>© 2026 Novarite. Created by Giorgi Goishvili.</p>
          <p>Built for indie developers.</p>
        </div>
      </div>
    </footer>
  );
}
