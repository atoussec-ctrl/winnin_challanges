import Link from "next/link";

const links = [
  { href: "/", label: "Animes" },
  { href: "/pedidos", label: "Pedidos" }
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex h-14 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <span className="text-sm font-semibold tracking-tight">Desafio Winnin</span>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {links.map((link) => (
            <Link className="transition hover:text-foreground" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
