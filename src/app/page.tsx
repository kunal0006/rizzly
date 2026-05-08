import { Upload, BrainCircuit, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center overflow-x-hidden pt-8">
      {/* Mobile-like Container for Neo-Brutalist Layout */}
      <div className="w-full max-w-lg md:max-w-4xl px-4 flex flex-col gap-16 pb-24">
        
        {/* Navigation */}
        <nav className="w-full flex justify-between items-center bg-white brutal-border brutal-shadow-sm p-4 rounded-xl">
          <div className="text-xl md:text-2xl pt-1">
            RIZZLY
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="bg-secondary text-white font-bold px-4 py-2 text-sm brutal-border brutal-shadow-sm flex items-center justify-center">
              LOGIN
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-white brutal-border brutal-shadow rounded-3xl p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden">
          <h1 className="text-4xl md:text-6xl mb-4 leading-tight z-10 pt-4">
            TEXTING <br/>
            IS OUR ART
          </h1>
          <p className="font-bold text-lg md:text-xl mb-8 z-10 uppercase tracking-widest">
            Success is your reality
          </p>
          
          <Link href="/analyzer" className="bg-secondary text-white px-8 py-3 text-lg md:text-xl brutal-border brutal-shadow-sm z-10 hover:bg-pink-600 transition-colors">
            LET'S START!
          </Link>

          <div className="mt-12 w-full flex justify-center items-center relative z-10 h-48 md:h-64">
            <div className="absolute left-0 md:left-12 top-0 w-20 h-20 md:w-32 md:h-32 -rotate-12 animate-pulse hidden sm:block">
              <Image src="/heart.png" alt="Heart" fill className="object-contain" />
            </div>
            
            <div className="w-48 h-48 md:w-64 md:h-64 relative z-10">
              <Image 
                src="/dino.png" 
                alt="Retro Pixel Dinosaur" 
                fill
                className="object-contain hover:scale-110 transition-transform cursor-pointer"
              />
            </div>
            
            <div className="absolute right-0 md:right-12 bottom-0 w-24 h-24 md:w-36 md:h-36 rotate-12 hover:-translate-y-2 transition-transform cursor-pointer hidden sm:block">
              <Image src="/phone.png" alt="Phone" fill className="object-contain" />
            </div>
          </div>
          
          <div className="text-xs md:text-sm max-w-sm mt-8 z-10 font-bold border-t-4 border-black pt-4 text-left w-full">
            IT'S TIME TO OPEN THE DOOR TO THE INCREDIBLE WORLD OF DATING - WHERE IMPULSIVE IDEAS APPROACH UNPREDICTABLE POSSIBILITIES.
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-primary brutal-border brutal-shadow rounded-3xl p-8 md:p-12 flex flex-col items-center relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 opacity-80 rotate-[30deg]">
            <Image src="/heart.png" alt="Heart bg" fill className="object-contain" />
          </div>
          <h2 className="text-3xl md:text-5xl mb-8 text-center text-white paint-stroke-black [text-shadow:-4px_-4px_0_#000,4px_-4px_0_#000,-4px_4px_0_#000,4px_4px_0_#000]">
            WHO WE ARE?
          </h2>
          <div className="bg-white brutal-border p-6 rounded-xl w-full text-sm md:text-base mb-8">
            WOULD YOU LIKE TO INCREASE YOUR RESPONSE RATE? OUR AI MODEL WILL TURN YOUR DRY TEXTS INTO A REAL DINOSAUR IN THE ONLINE SPACE! IT WILL CAPTURE HEARTS AND BE REMEMBERED. FIRST IMPRESSIONS ARE EVERYTHING.
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-white brutal-border brutal-shadow-sm p-4 text-center rounded-xl">
              <div className="text-2xl md:text-4xl mb-2">99%</div>
              <div className="text-xs font-bold uppercase">Success Rate</div>
            </div>
            <div className="bg-accent brutal-border brutal-shadow-sm p-4 text-center rounded-xl">
              <div className="text-2xl md:text-4xl mb-2">10K+</div>
              <div className="text-xs font-bold uppercase">Chats Saved</div>
            </div>
          </div>
        </section>

        {/* Services / How it Works */}
        <section className="bg-white brutal-border brutal-shadow rounded-3xl p-8 md:p-12 flex flex-col">
          <h2 className="text-3xl md:text-5xl mb-8 text-center bg-primary text-white brutal-border p-4 rounded-xl shadow-[4px_4px_0_0_#000]">
            HOW IT WORKS
          </h2>
          
          <div className="space-y-6">
            {[
              { icon: <Upload className="w-8 h-8" />, title: "UPLOAD", desc: "Screenshot your chat", color: "bg-secondary" },
              { icon: <BrainCircuit className="w-8 h-8" />, title: "ANALYZE", desc: "AI reads the room", color: "bg-accent" },
              { icon: <MessageCircle className="w-8 h-8" />, title: "REPLY", desc: "Pick your vibe", color: "bg-primary" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-6 bg-white brutal-border brutal-shadow-sm p-4 rounded-xl hover:-translate-y-1 transition-transform cursor-crosshair">
                <div className={`w-16 h-16 brutal-border flex items-center justify-center rounded-none ${step.color} text-white`}>
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-xl mb-1">{step.title}</h3>
                  <p className="text-sm font-bold">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link href="/analyzer" className="mt-8 flex justify-center">
            <div className="bg-black text-white px-6 py-4 brutal-shadow-sm flex items-center gap-4 hover:bg-gray-800 transition-colors uppercase font-bold w-full md:w-auto text-center justify-center">
              TRY THE ANALYZER <ArrowRight className="w-6 h-6" />
            </div>
          </Link>
        </section>

        {/* Footer */}
        <footer className="text-center font-bold text-sm uppercase py-8 flex flex-col gap-4">
          <h2 className="text-3xl md:text-4xl text-black">
            THANKS FOR <br/> YOUR ATTENTION
          </h2>
          <div className="w-32 h-32 mx-auto relative mt-4">
             <Image 
              src="/dino.png" 
              alt="Dino Footer" 
              fill
              className="object-contain opacity-50"
            />
          </div>
          <p className="mt-8 max-w-sm mx-auto">
            IF YOU ARE PASSIONATE ABOUT MODERN DATING, PLEASE FOLLOW MY LINKS AND LET'S GET STARTED!
          </p>
          <div className="mt-4 border-t-4 border-black pt-4">
            DESIGN: RIZZLY
          </div>
        </footer>

      </div>
    </main>
  );
}
