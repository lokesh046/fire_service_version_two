import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <div className="h-screen w-full bg-black text-slate-50 flex flex-col relative overflow-hidden">
      {/* GLOBAL 3D GLOWING BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none perspective-[1000px] overflow-hidden">
        {/* Animated Perspective Grid */}
        <div className="absolute top-1/2 left-[-50%] w-[200%] h-[200%] origin-top animate-grid-flow opacity-20" 
             style={{ backgroundImage: 'linear-gradient(rgba(234, 179, 8, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(234, 179, 8, 0.2) 1px, transparent 1px)', backgroundSize: '50px 50px', transform: 'rotateX(60deg) translateY(0)' }}>
        </div>
        
        {/* Massive Floating Glowing Orbs */}
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[80px] animate-float"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-yellow-500/20 blur-[100px] animate-float-reverse"></div>
        <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full bg-cyan-500/20 blur-[70px] animate-pulse-glow"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1 overflow-y-auto">
        <Navbar />
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

