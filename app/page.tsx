"use client";
import { useState, useEffect } from "react";

interface Todo {
  id: number;
  title: string;
  description: string;
  done: boolean;
  priority: "yuqori" | "o'rta" | "past";
  createdAt: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<"yuqori" | "o'rta" | "past">("o'rta");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("todos-next") || "[]");
    const theme = localStorage.getItem("theme-next") === "dark";
    setTodos(saved);
    setDark(theme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("todos-next", JSON.stringify(todos));
  }, [todos, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("theme-next", dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark, mounted]);

  function add() {
    if (!title.trim()) return;
    setTodos([{ id: Date.now(), title, description: desc, done: false, priority, createdAt: new Date().toLocaleDateString("uz-UZ") }, ...todos]);
    setTitle("");
    setDesc("");
    setPriority("o'rta");
  }

  function toggle(id: number) {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function remove(id: number) {
    setTodos(todos.filter(t => t.id !== id));
  }

  const filtered = todos.filter(t =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );

  const remaining = todos.filter(t => !t.done).length;
  const done = todos.filter(t => t.done).length;

  const priorityColor: Record<string, string> = {
    "yuqori": "bg-red-100 text-red-600",
    "o'rta": "bg-yellow-100 text-yellow-600",
    "past": "bg-green-100 text-green-600",
  };

  const priorityDot: Record<string, string> = {
    "yuqori": "bg-red-500",
    "o'rta": "bg-yellow-500",
    "past": "bg-green-500",
  };

  if (!mounted) return null;

  return (
    <main className={`min-h-screen transition-colors duration-300 ${dark ? "bg-gray-950" : "bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-100"}`}>
      <div className="max-w-lg mx-auto px-4 py-10">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${dark ? "text-white" : "text-indigo-900"}`}>
              ✅ Vazifalar
            </h1>
            <p className={`text-sm mt-1 ${dark ? "text-gray-400" : "text-indigo-400"}`}>
              {remaining} ta qoldi · {done} ta bajarildi
            </p>
          </div>
          <button onClick={() => setDark(!dark)}
            className={`w-11 h-11 rounded-full text-xl flex items-center justify-center shadow transition-all ${dark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-indigo-50"}`}>
            {dark ? "☀️" : "🌑"}
          </button>
        </div>

        {todos.length > 0 && (
          <div className={`w-full h-2 rounded-full mb-6 overflow-hidden ${dark ? "bg-gray-800" : "bg-indigo-100"}`}>
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${(done / todos.length) * 100}%` }} />
          </div>
        )}

        <div className={`rounded-2xl p-5 mb-5 shadow-lg ${dark ? "bg-gray-900" : "bg-white"}`}>
          <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
            placeholder="Vazifa nomi..."
            className={`w-full px-4 py-3 rounded-xl border mb-3 text-sm outline-none transition ${dark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500" : "bg-indigo-50 border-transparent text-gray-800 focus:border-indigo-300"}`} />
          <input value={desc} onChange={e => setDesc(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
            placeholder="Tavsif (ixtiyoriy)..."
            className={`w-full px-4 py-3 rounded-xl border mb-3 text-sm outline-none transition ${dark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500" : "bg-indigo-50 border-transparent text-gray-800 focus:border-indigo-300"}`} />

          <div className="flex gap-2 mb-3">
            {(["yuqori", "o'rta", "past"] as const).map(p => (
              <button key={p} onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${priority === p ? priorityColor[p] + " ring-2 ring-offset-1 ring-current" : dark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-400"}`}>
                {p === "yuqori" ? "🔴 Yuqori" : p === "o'rta" ? "🟡 O'rta" : "🟢 Past"}
              </button>
            ))}
          </div>

          <button onClick={add}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold rounded-xl transition-all">
            + Qo'shish
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(["all", "active", "done"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${filter === f ? "bg-indigo-600 text-white" : dark ? "bg-gray-900 text-gray-400 hover:bg-gray-800" : "bg-white text-gray-400 hover:bg-indigo-50"}`}>
              {f === "all" ? "Hammasi" : f === "active" ? "Bajarilmagan" : "Bajarilgan"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className={`text-center py-12 ${dark ? "text-gray-600" : "text-indigo-200"}`}>
              <p className="text-4xl mb-2">📋</p>
              <p className="text-sm">Hozircha bu yerda hech narsa yo'q</p>
            </div>
          )}
          {filtered.map(t => (
            <div key={t.id}
              className={`rounded-2xl p-4 flex items-start gap-3 shadow-sm transition-all ${t.done ? "opacity-50" : ""} ${dark ? "bg-gray-900" : "bg-white"}`}>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)}
                className="mt-1 w-5 h-5 accent-indigo-600 cursor-pointer flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[t.priority]}`} />
                  <p className={`font-semibold text-sm ${t.done ? "line-through" : ""} ${dark ? "text-white" : "text-gray-800"}`}>
                    {t.title}
                  </p>
                </div>
                {t.description && (
                  <p className={`text-xs ml-4 ${dark ? "text-gray-500" : "text-gray-400"}`}>{t.description}</p>
                )}
                <p className={`text-xs ml-4 mt-1 ${dark ? "text-gray-700" : "text-gray-300"}`}>{t.createdAt}</p>
              </div>
              <button onClick={() => remove(t.id)}
                className={`text-sm px-2 py-1 rounded-lg transition ${dark ? "text-gray-600 hover:text-red-400 hover:bg-gray-800" : "text-gray-300 hover:text-red-400 hover:bg-red-50"}`}>
                ✕
              </button>
            </div>
          ))}
        </div>

        {todos.some(t => t.done) && (
          <button onClick={() => setTodos(todos.filter(t => !t.done))}
            className={`mt-5 w-full py-2 text-xs rounded-xl transition ${dark ? "text-gray-600 hover:text-red-400 hover:bg-gray-900" : "text-gray-300 hover:text-red-400 hover:bg-white"}`}>
            🗑 Bajarilganlarni o'chirish
          </button>
        )}
      </div>
    </main>
  );
}