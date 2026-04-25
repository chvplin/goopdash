import Link from "next/link";

export function ScreenShell({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <main style={{ padding: 24 }}>
      <h1>{title}</h1>
      <nav style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <Link href="/">Landing</Link>
        <Link href="/auth">Auth</Link>
        <Link href="/menu">Menu</Link>
        <Link href="/profile">Profile</Link>
        <Link href="/shop">Shop</Link>
        <Link href="/lobby">Lobby</Link>
      </nav>
      {children}
    </main>
  );
}
