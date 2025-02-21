import { Github, Shapes } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed w-full bg-white/20 text-white backdrop-blur-sm z-50 ">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shapes className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold">Mindraww</span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/"
            className="text-slate-200 hover:text-slate-900 hover:bg-slate-400 rounded-xl px-2 py-1"
          >
            About
          </Link>
          <Link
            href="/"
            className="text-slate-200 hover:text-slate-900 hover:bg-slate-400 rounded-xl px-2 py-1"
          >
            Blog
          </Link>
          <Link
            href="https://github.com"
            className="flex items-center gap-1 text-slate-200 hover:text-slate-900 hover:bg-slate-400 rounded-xl px-2 py-1"
          >
            <Github className="w-4 h-4" />
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}
