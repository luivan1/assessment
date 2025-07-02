import { useEffect, useState } from "react";

export default function PanelControl() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ correo: "", contrasena: "", rol: "cliente", organizacion: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creando, setCreando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8000/usuarios-acceso")
      .then(r => r.json())
      .then(data => setUsuarios(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [creando]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  // Crear o editar usuario
  const guardarUsuario = async (e) => {
    e.preventDefault();
    if (!form.correo || !form.contrasena || !form.organizacion) {
      setError("Correo, contraseña y organización requeridos");
      return;
    }
    setCreando(true);
    setError("");
    setSuccess("");
    try {
      const url = editandoId
        ? `http://localhost:8000/usuarios-acceso/${editandoId}`
        : "http://localhost:8000/usuarios-acceso";
      const method = editandoId ? "PUT" : "POST";
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!resp.ok) {
        const msg = await resp.json();
        setError(msg.detail || "No se pudo guardar el usuario");
      } else {
        setForm({ correo: "", contrasena: "", rol: "cliente", organizacion: "" });
        setSuccess(editandoId ? "Usuario actualizado" : "Usuario creado exitosamente");
        setEditandoId(null);
      }
    } catch {
      setError("Error de conexión");
    }
    setCreando(false);
    // Refresca usuarios (el useEffect lo hará)
  };

  // Eliminar usuario
  const borrarUsuario = async (id) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    setLoading(true);
    await fetch(`http://localhost:8000/usuarios-acceso/${id}`, { method: "DELETE" });
    setLoading(false);
    setUsuarios(u => u.filter(us => us.id !== id));
  };

  // Editar usuario
  const editarUsuario = (usuario) => {
    setEditandoId(usuario.id);
    setForm({
      correo: usuario.correo,
      contrasena: usuario.contrasena || "",
      rol: usuario.rol,
      organizacion: usuario.organizacion || "",
    });
    setError("");
    setSuccess("");
  };

  // Usuario logueado
  const usuarioLog = JSON.parse(localStorage.getItem("usuario") || "{}");

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg shadow bg-white border">
      <h2 className="text-xl font-bold mb-6">Panel de Control</h2>
      <h3 className="font-semibold mb-2">
        {editandoId ? "Editar usuario de acceso" : "Crear usuario de acceso"}
      </h3>
      <form className="flex flex-col gap-3 mb-8" onSubmit={guardarUsuario}>
        <input
          className="border rounded px-3 py-2"
          name="correo"
          type="email"
          placeholder="Correo electrónico"
          value={form.correo}
          onChange={handleChange}
          required
          disabled={!!editandoId}
        />
        <input
          className="border rounded px-3 py-2"
          name="contrasena"
          type="password"
          placeholder="Contraseña"
          value={form.contrasena}
          onChange={handleChange}
          required
        />
        <input
          className="border rounded px-3 py-2"
          name="organizacion"
          type="text"
          placeholder="Organización"
          value={form.organizacion}
          onChange={handleChange}
          required
        />
        <select
          className="border rounded px-3 py-2"
          name="rol"
          value={form.rol}
          onChange={handleChange}
        >
          <option value="cliente">Cliente</option>
          <option value="admin">Administrador</option>
        </select>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={creando}
          >
            {editandoId ? "Guardar cambios" : "Crear usuario"}
          </button>
          {editandoId && (
            <button
              type="button"
              className="text-gray-500 hover:underline ml-2"
              onClick={() => {
                setEditandoId(null);
                setForm({ correo: "", contrasena: "", rol: "cliente", organizacion: "" });
                setError(""); setSuccess("");
              }}
            >
              Cancelar
            </button>
          )}
        </div>
        {error && <span className="text-red-600 text-sm">{error}</span>}
        {success && <span className="text-green-600 text-sm">{success}</span>}
      </form>

      <h3 className="font-semibold mb-2">Usuarios registrados</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="border px-2 py-1 text-left">Correo</th>
              <th className="border px-2 py-1 text-left">Rol</th>
              <th className="border px-2 py-1 text-left">Organización</th>
              <th className="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-3">Sin usuarios</td>
              </tr>
            )}
            {usuarios.map(us => (
              <tr key={us.id}>
                <td className="border px-2 py-1">{us.correo}</td>
                <td className="border px-2 py-1">{us.rol || "cliente"}</td>
                <td className="border px-2 py-1">{us.organizacion || "-"}</td>
                <td className="border px-2 py-1 text-center">
                  <button
                    className="text-blue-600 hover:underline mr-2"
                    onClick={() => editarUsuario(us)}
                    title="Editar usuario"
                  >
                    Editar
                  </button>
                  {/* Solo muestra el botón eliminar si NO es el usuario logueado */}
                  {us.correo !== usuarioLog.correo && (
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => borrarUsuario(us.id)}
                      title="Eliminar usuario"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}