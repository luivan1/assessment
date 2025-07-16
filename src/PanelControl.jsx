import { useEffect, useState } from "react";

export default function PanelControl() {
  const [usuarios, setUsuarios] = useState([]);
  const [organizaciones, setOrganizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ correo: "", contrasena: "", rol: "cliente", organizacion_id: "" });
  const [orgForm, setOrgForm] = useState({ nombre: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creando, setCreando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  // 👇 Para edición de organizaciones
  const [editandoOrgId, setEditandoOrgId] = useState(null);
  const [orgEditada, setOrgEditada] = useState("");
  const [orgError, setOrgError] = useState("");

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    fetch("http://localhost:8000/organizaciones", {
      headers: {
        "Content-Type": "application/json",
        "X-Usuario-Id": usuario.usuario_id,
      },
    })
      .then(r => r.json())
      .then(setOrganizaciones);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
    fetch("http://localhost:8000/usuarios-acceso", {
      headers: { "Content-Type": "application/json", "X-Usuario-Id": usuario.usuario_id },
    }).then(r => r.json()),
    fetch("http://localhost:8000/organizaciones", {
      headers: { "Content-Type": "application/json", "X-Usuario-Id": usuario.usuario_id },
    }).then(r => r.json()),
  ])
      .then(([usuariosData, organizacionesData]) => {
        setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
        setOrganizaciones(Array.isArray(organizacionesData) ? organizacionesData : []);
      })
      .finally(() => setLoading(false));
  }, [creando]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const handleOrgChange = e => setOrgForm({ ...orgForm, [e.target.name]: e.target.value });

  const crearOrganizacion = async (e) => {
    e.preventDefault();
    if (!orgForm.nombre.trim()) return;
    try {
      const resp = await fetch("http://localhost:8000/organizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orgForm)
      });
      if (resp.ok) {
        const nueva = await resp.json();
        setOrganizaciones(prev => [...prev, nueva]);
        setOrgForm({ nombre: "" });
      }
    } catch {}
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    if (!form.correo || !form.contrasena || (form.rol === "cliente" && !form.organizacion_id)) {
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

      const payload = { ...form };
      if (payload.rol === "admin") {
        delete payload.organizacion_id;
      }

      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const msg = await resp.json();
        setError(msg.detail || "No se pudo guardar el usuario");
      } else {
        setForm({ correo: "", contrasena: "", rol: "cliente", organizacion_id: "" });
        setSuccess(editandoId ? "Usuario actualizado" : "Usuario creado exitosamente");
        setEditandoId(null);
      }
    } catch {
      setError("Error de conexión");
    }
    setCreando(false);
  };

  const borrarUsuario = async (id) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    setLoading(true);
    await fetch(`http://localhost:8000/usuarios-acceso/${id}`, { method: "DELETE" });
    setLoading(false);
    setUsuarios(u => u.filter(us => us.id !== id));
  };

  const editarUsuario = (usuario) => {
    setEditandoId(usuario.id);
    setForm({
      correo: usuario.correo,
      contrasena: usuario.contrasena || "",
      rol: usuario.rol,
      organizacion_id: usuario.organizacion_id || "",
    });
    setError("");
    setSuccess("");
  };

  // Editar organización
  const editarOrganizacion = (org) => {
    setEditandoOrgId(org.id);
    setOrgEditada(org.nombre);
    setOrgError("");
  };

  // Guardar cambios de organización
  const guardarOrganizacion = async () => {
    if (!orgEditada.trim()) {
      setOrgError("El nombre no puede estar vacío");
      return;
    }
    try {
      const resp = await fetch(`http://localhost:8000/organizaciones/${editandoOrgId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: orgEditada }),
      });
      if (!resp.ok) {
        const data = await resp.json();
        setOrgError(data.detail || "No se pudo actualizar la organización");
      } else {
        setOrganizaciones((prev) =>
          prev.map((o) => (o.id === editandoOrgId ? { ...o, nombre: orgEditada } : o))
        );
        setEditandoOrgId(null);
        setOrgEditada("");
      }
    } catch {
      setOrgError("Error al conectar con el servidor");
    }
  };

  // Borrar organización
  const borrarOrganizacion = async (id) => {
    if (!window.confirm("¿Eliminar esta organización?")) return;
    try {
      await fetch(`http://localhost:8000/organizaciones/${id}`, { method: "DELETE" });
      setOrganizaciones((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert("Error al eliminar la organización");
    }
  };

  const usuarioLog = JSON.parse(localStorage.getItem("usuario") || "{}");

  return (
    <div className="max-w-3xl mx-auto p-6 rounded-lg shadow bg-white border">
      <h2 className="text-xl font-bold mb-6">Panel de Control</h2>

      {/* Crear organización */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Crear nueva organización</h3>
        <form className="flex gap-3" onSubmit={crearOrganizacion}>
          <input
            className="border rounded px-3 py-2 flex-1"
            name="nombre"
            placeholder="Nombre de la organización"
            value={orgForm.nombre}
            onChange={handleOrgChange}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Agregar
          </button>
        </form>
      </div>

      {/* Crear o editar usuario */}
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
        {form.rol === "cliente" && (
          <select
            className="border rounded px-3 py-2"
            name="organizacion_id"
            value={form.organizacion_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una organización</option>
            {organizaciones.map(org => (
              <option key={org.id} value={org.id}>{org.nombre}</option>
            ))}
          </select>
        )}
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
                setForm({ correo: "", contrasena: "", rol: "cliente", organizacion_id: "" });
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

      {/* Tabla de usuarios */}
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
                <td className="border px-2 py-1">{us.organizacion?.nombre || "-"}</td>
                <td className="border px-2 py-1 text-center">
                  <button
                    className="text-blue-600 hover:underline mr-2"
                    onClick={() => editarUsuario(us)}
                    title="Editar usuario"
                  >
                    Editar
                  </button>
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
            {/* Lista de organizaciones registradas */}
      <div className="mt-10">
        <h3 className="font-semibold mb-2">Organizaciones registradas</h3>
        <ul className="space-y-2">
          {organizaciones.map((org) => (
            <li key={org.id} className="flex items-center gap-2 border p-2 rounded">
              {editandoOrgId === org.id ? (
                <>
                  <input
                    className="border rounded px-2 py-1 flex-1"
                    value={orgEditada}
                    onChange={(e) => setOrgEditada(e.target.value)}
                  />
                  <button
                    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    onClick={guardarOrganizacion}
                  >
                    Guardar
                  </button>
                  <button
                    className="text-gray-600 hover:underline"
                    onClick={() => {
                      setEditandoOrgId(null);
                      setOrgEditada("");
                    }}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1">{org.nombre}</span>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => editarOrganizacion(org)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => borrarOrganizacion(org.id)}
                  >
                    Eliminar
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
        {orgError && <p className="text-red-600 text-sm mt-2">{orgError}</p>}
      </div>
    </div>
  );
}