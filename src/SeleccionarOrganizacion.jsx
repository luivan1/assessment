// SeleccionarOrganizacion.jsx
import { useEffect, useState } from "react";

export default function SeleccionarOrganizacion({ usuario, onSeleccionar }) {
  const [organizaciones, setOrganizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarOrganizaciones = async () => {
      try {
        const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
        const usuario_id = usuarioGuardado?.usuario_id;

        const res = await fetch("http://localhost:8000/organizaciones", {
          headers: {
            "Content-Type": "application/json",
            ...(usuario_id && { "X-Usuario-Id": usuario_id }),
          },
        });

        if (!res.ok) {
          throw new Error("Error al cargar organizaciones");
        }

        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Respuesta inválida del servidor");
        setOrganizaciones(data);
      } catch (err) {
        setError(err.message || "Ocurrió un error inesperado");
      } finally {
        setLoading(false);
      }
    };

    cargarOrganizaciones();
  }, []);

  const seleccionar = (org) => {
    localStorage.setItem(
      "usuario",
      JSON.stringify({
        correo: usuario.correo,
        usuario_id: usuario.usuario_id,
        rol: usuario.rol,
        organizacion_id: org.id,
      })
    );
    onSeleccionar(); // para avanzar al MainApp
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600 text-lg">Cargando organizaciones...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-xl space-y-6">
        <div className="flex justify-center">
          <img src="/logo-ethics.png" alt="EthicsGlobal" className="h-16" />
        </div>

        <h2 className="text-2xl font-bold text-center text-slate-800">
          Selecciona una organización
        </h2>

        <div className="space-y-3">
          {organizaciones.map((org) => (
            <button
              key={org.id}
              onClick={() => seleccionar(org)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              {org.nombre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}