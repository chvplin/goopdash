import Link from 'next/link';
import { ScreenShell } from '../ui/ScreenShell';

export default function LandingPage() {
  return (
    <ScreenShell title="Loot Rush.io">
      <p>Bright low-poly 5v5 heist arena.</p>
      <Link href="/game/local">Enter Prototype Match</Link>
    </ScreenShell>
  );
}
