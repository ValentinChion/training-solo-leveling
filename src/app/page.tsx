import { getPlayer } from "@/features/player/data";

export default async function Home() {
  const player = await getPlayer();

  return (
    <main>
      <p>{player.name}</p>
    </main>
  );
}
