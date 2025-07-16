import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ← necesario para redirigir

export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // ← hook de navegación

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

      // Guardar usuario en localStorage
      localStorage.setItem("usuario", JSON.stringify({
        correo: data.correo,
        usuario_id: data.usuario_id,
        rol: data.rol,
        organizacion_id: data.organizacion_id
      }));

      // Redirigir según rol
      if (data.rol === "admin") {
        navigate("/seleccionar-organizacion");
      } else {
        navigate("/app");
      }

      // Callback opcional
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