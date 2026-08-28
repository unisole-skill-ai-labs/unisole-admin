import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Radio } from "lucide-react";

export default function JoinSessionPage() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean) {
      navigate(`/live/${clean}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2.5">
          <img
            src="https://res.cloudinary.com/hehmsemf/image/upload/f_auto,q_auto,w_64/v1785299421/Unisole_logo_new_mhqbma.png"
            alt="Unisole"
            className="w-7 h-7 rounded-lg object-contain"
          />
          <span className="font-extrabold text-sm tracking-tight text-zinc-100">
            Unisole <span className="text-indigo-400">Live</span>
          </span>
        </div>
      </div>

      {/* Center Input Form */}
      <div className="my-auto max-w-sm w-full mx-auto space-y-6 z-10 py-6 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Interactive Roadshow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
            Enter Session Code
          </h1>
          <p className="text-xs text-zinc-400">
            Type the 6-character code displayed on the auditorium screen to join.
          </p>
        </div>

        <form
          onSubmit={handleJoin}
          className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 shadow-2xl backdrop-blur-xl space-y-4"
        >
          <div>
            <input
              type="text"
              required
              maxLength={10}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. UNIQPMS"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-center text-xl font-mono font-black text-indigo-400 tracking-widest placeholder:text-zinc-700 placeholder:font-normal focus:outline-hidden focus:border-indigo-500 uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={!code.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/25 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Enter Presentation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-zinc-500 z-10 pb-2">
        Powered by Unisole EdTech Engine • unisole.org
      </div>
    </div>
  );
}
