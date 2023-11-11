import Button from "@/components/Button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full flex flex-col gap-8">
      <Link href="/rooms">
        <Button>Rooms -&gt;</Button>
      </Link>
      <Link href="/create">
        <Button>Create a room -&gt;</Button>
      </Link>
    </div>
  );
}
