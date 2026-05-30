"use client";
import { useState, useEffect } from "react";

interface Todo {
  id: number;
  title: string;
  description: string;
  done: boolean;
  priority: string;
  created_at: string;
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("o'rta");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authUser, setAuthUser] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("username");
    const th = localStorage.getItem("theme-next") === "dark";
    if (t) { setToken(t); setUsername(u || ""); }
    setDark(th);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme-next", dark ? "dark" : "light");
  }, [dark, mounted]);

  useEffect(() => {
    if (token) fetchTodos();
  }, [token]);

  async function fetchTodos() {
    const res = await fetch("/api/todos", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setTodos(Array.isArray(data) ? data : []);
  }

  async function auth() {
    setError("");
    const res = await fetch(`/api/auth/${authMode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: authUser, password: authPass }),
    });
    const data = await res.json();
    if (data.error) return setError(data.error);
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    setToken(data.token);
    setUsername(data.username);
  }

  async function addTodo() {
    if (!title.trim()) return;
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, description: desc, priority }),
    });
    const data = await res.json();
    setTodos([data, ...todos]);
    setTitle(""); setDesc(""); setPriority("o'rta");
  }

  async function toggleTodo(id: number, done: boolean) {
    const res = await fetch("/api/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, done: !done }),
    });
    const data = await res.json();
    setTodos(todos.map(t => t.id === id ? data : t));
  }

  async function deleteTodo(id: number) {
    await fetch("/api/todos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    setTodos(todos.filter(t => t.id !== id));
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null); setUsername(""); setTodos([]);
  }

  const priorityDot: Record<string, string> = {
    "yuqori": "bg-red-500", "o'rta": "bg-yellow-500", "past": "bg-green-500"
  };

  if (!mounted) return null;

  if (!token) return (
    <main className={`min-h-screen flex items-center justify-center ${dark ? "bg-gray-950" : "bg-gradient-to-br from-violet-50 to-indigo-100"}`}>
      <div className={`w-full max-w-sm p-8 rounded-2xl shadow-xl ${dark ? "bg-gray-900" : "bg-white"}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${dark ? "text-white" : "text-indigo-900"}`}>
            {authMode === "login" ? "🔐 Kirish" : "📝 Ro'yxat"}
          </h1>
          <button onClick={() => setDark(!dark)} className={`w-9 h-9 rounded-full text-lg flex items-center justify-center ${dark ? "bg-gray-800" : "bg-indigo-50"}`}>
            {dark ? "☀️" : "🌑"}
          </button>
        </div>
        <input value={authUser} onChange={e => setAuthUser(e.target.value)}
          placeholder="Username" className={`w-full px-4 py-3 rounded-xl border mb-3 text-sm outline-none ${dark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-indigo-50 border-transparent text-gray-800"}`} />
        <input value={authPass} onChange={e => setAuthPass(e.target.value)} type="password"
          onKeyDown={e => e.key === "Enter" && auth()}
          placeholder="Parol" className={`w-full px-4 py-3 rounded-xl border mb-3 text-sm outline-none ${dark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-indigo-50 border-transparent text-gray-800"}`} />
        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
        <button onClick={auth} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl mb-3">
          {authMode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
        </button>
        <p className={`text-center text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
          {authMode === "login" ? "Hisob yo'qmi? " : "Hisob bormi? "}
          <button onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setError(""); }}
            className="text-indigo-500 font-semibold">
            {authMode === "login" ? "Ro'yxat" : "Kirish"}
          </button>
        </p>
      </div>
    </main>
  );

  return (
    <main className={`min-h-screen ${dark ? "bg-gray-950" : "bg-gradient-to-br from-violet-50 to-indigo-100"}`}>
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${dark ? "text-white" : "text-indigo-900"}`}>👋 {username}</h1>
            <p className={`text-sm ${dark ? "text-gray-400" : "text-indigo-400"}`}>{todos.filter(t => !t.done).length} ta bajarilmagan</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setDark(!dark)} className={`w-10 h-10 rounded-full text-lg flex items-center justify-center ${dark ? "bg-gray-800" : "bg-white shadow"}`}>
              {dark ? "☀️" : "🌑"}
            </button>
            <button onClick={logout} className={`w-10 h-10 rounded-full text-lg flex items-center justify-center ${dark ? "bg-gray-800" : "bg-white shadow"}`}>🚪</button>
          </div>
        </div>

        <div className={`rounded-2xl p-5 mb-5 shadow-lg ${dark ? "bg-gray-900" : "bg-white"}`}>
          <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && addTodo()}
            placeholder="Vazifa nomi..." className={`w-full px-4 py-3 rounded-xl border mb-3 text-sm outline-none ${dark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-indigo-50 border-transparent text-gray-800"}`} />
          <input value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Tavsif (ixtiyoriy)..." className={`w-full px-4 py-3 rounded-xl border mb-3 text-sm outline-none ${dark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-indigo-50 border-transparent text-gray-800"}`} />
          <div className="flex gap-2 mb-3">
            {["yuqori", "o'rta", "past"].map(p => (
              <button key={p} onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${priority === p ? (p === "yuqori" ? "bg-red-100 text-red-600" : p === "o'rta" ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600") : dark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-400"}`}>
                {p === "yuqori" ? "🔴 Yuqori" : p === "o'rta" ? "🟡 O'rta" : "🟢 Past"}
              </button>
            ))}
          </div>
          <button onClick={addTodo} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl">+ Qo'shish</button>
        </div>

        <div className="flex flex-col gap-3">
          {todos.map(t => (
            <div key={t.id} className={`rounded-2xl p-4 flex items-start gap-3 shadow-sm ${t.done ? "opacity-50" : ""} ${dark ? "bg-gray-900" : "bg-white"}`}>
              <input type="checkbox" checked={t.done} onChange={() => toggleTodo(t.id, t.done)} className="mt-1 w-5 h-5 accent-indigo-600 cursor-pointer flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${priorityDot[t.priority] || "bg-gray-400"}`} />
                  <p className={`font-semibold text-sm ${t.done ? "line-through" : ""} ${dark ? "text-white" : "text-gray-800"}`}>{t.title}</p>
                </div>
                {t.description && <p className={`text-xs ml-4 mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>{t.description}</p>}
              </div>
              <button onClick={() => deleteTodo(t.id)} className={`text-sm px-2 py-1 rounded-lg ${dark ? "text-gray-600 hover:text-red-400" : "text-gray-300 hover:text-red-400"}`}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}