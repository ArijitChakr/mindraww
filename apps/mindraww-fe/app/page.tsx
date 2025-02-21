import { Button } from "@repo/ui";
import { Pencil, Share2, Users, Cloud, Shapes, Palette } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-white">
            Whiteboarding, <span className="text-slate-400">reimagined.</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Create beautiful hand-drawn diagrams, wireframes, and illustrations
            with our intuitive drawing tool.
          </p>
          <div className="flex justify-center gap-4">
            <Link href={"/signup"}>
              <Button
                variant="primary"
                size="lg"
                className="px-8 py-3 text-white rounded-lg font-bold transition-colors"
              >
                Register Here
              </Button>
            </Link>
            <Link href={"/signin"}>
              <Button
                variant="outline"
                size="lg"
                className="px-14 py-3 font-bold transition-colors"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-200 rounded-xl shadow-sm">
              <Pencil className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Intuitive Drawing</h3>
              <p className="text-gray-600">
                Create perfect shapes and smooth lines with our smart drawing
                recognition.
              </p>
            </div>
            <div className="p-6 bg-slate-200 rounded-xl shadow-sm">
              <Share2 className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
              <p className="text-gray-600">
                Share your drawings instantly with a simple link or export in
                various formats.
              </p>
            </div>
            <div className="p-6 bg-slate-200 rounded-xl shadow-sm">
              <Users className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Real-time Collaboration
              </h3>
              <p className="text-gray-600">
                Work together with your team in real-time, anywhere in the
                world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6 text-slate-200">
                Draw with Freedom
              </h2>
              <p className="text-gray-400 mb-6">
                Experience the perfect balance of simplicity and power. Our
                drawing tools feel natural and responsive, making it easy to
                bring your ideas to life.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-200">
                    Customizable colors and styles
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-200">Automatic cloud saving</span>
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <Image
                src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=800&q=80"
                alt="Drawing Interface Demo"
                className="rounded-lg shadow-lg"
                width={800}
                height={600}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-800/80 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Start Creating Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators who trust our platform for their visual
            communication needs.
          </p>
          <Button variant="outline" size="lg" className="font-bold">
            Try It free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white/20 text-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shapes className="w-6 h-6" />
              <span>Mindraww</span>
            </div>
            <div className="text-sm">
              © 2025 Mindraww. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
