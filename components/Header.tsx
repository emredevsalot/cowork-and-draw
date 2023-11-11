import { getServerSession } from "next-auth";
import Link from "next/link";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { User } from "@/party/utils/auth";

import Signout from "./Signout";
import Avatar from "./Avatar";
import SignIn from "./SignIn";

export default async function Header() {
  const session = await getServerSession(authOptions);
  const user = session?.user as User | null;

  return (
    <header className="z-10 py-2 md:py-4 w-full border-b border-stone-300 md:shadow-sm sticky top-0 backdrop-blur">
      <nav className="container mx-auto px-4 md:px-10 flex justify-between items-center">
        <Link href="/">
          <h1 className="font-medium my-2">Cowork & Draw</h1>
        </Link>
        {user ? (
          <div className="flex gap-2 items-center">
            <Avatar username={user.username} image={user.image ?? null} />
            <span>Hi {user.username}!</span>
            <Signout />
          </div>
        ) : (
          <SignIn />
        )}
      </nav>
    </header>
  );
}
