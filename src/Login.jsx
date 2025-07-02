import { useState } from "react";

export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Para probar rápido (puedes quitar el autocomplete)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });
      if (!res.ok) {
        const { detail } = await res.json();
        throw new Error(detail || "Error al iniciar sesión");
      }
      const data = await res.json();

      // --- GUARDAR correo, usuario_id y rol EN localStorage:
      localStorage.setItem(
        "usuario",
        JSON.stringify({
          correo,                 // el correo que se logueó
          usuario_id: data.usuario_id,
          rol: data.rol
        })
      );
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm flex flex-col gap-5 border"
      >
        <div className="flex flex-col items-center mb-3">
          <img src="/logo-ethics.png" alt="EthicsGlobal" className="h-12 mb-2" />
          <h1 className="text-xl font-bold mb-1 text-slate-700">Bienvenido a la configuración de tu sistema</h1>
          <p className="text-xs text-slate-400">Ingresa tu usuario y contraseña</p>
        </div>
        <input
          type="email"
          className="border rounded p-2"
          placeholder="Correo electrónico"
          autoFocus
          autoComplete="username"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
          required
        />
        <input
          type="password"
          className="border rounded p-2"
          placeholder="Contraseña"
          autoComplete="current-password"
          value={contrasena}
          onChange={e => setContrasena(e.target.value)}
          required
        />
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <button
          type="submit"
          className="bg-blue-700 hover:bg-blue-800 text-white rounded py-2 mt-2 font-semibold transition"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}