import Link from 'next/link';
import { ScreenShell } from '../../ui/ScreenShell';

export default function LobbyPage() {
  return (
    <ScreenShell title="Matchmaking Lobby">
      <p>Queue for a 5v5 room.</p>
      <Link href="/game/local">Simulate loading into room</Link>
    </ScreenShell>
  );
}
