import { useState, useEffect, useRef } from "react";
import { X, Pencil, Save, Trash2, Plus } from "lucide-react";

const opcionesDisponibles = [
  "1. Empleado, colaborador, Docente, sindicalizado",
  "2. Proveedor, Contratista, consultor externo, auditor",
  "3. Clientes estratégicos, comisionistas, distribuidores",
  "4. Socios o Accionistas",
  "5. Exempleado",
  "6. Público en general, vecino, comunidad",
  "7. Consumidor final, usuario, alumno"
];

const camposIdentidad = [
  "Nombre completo",
  "Teléfono",
  "Correo electrónico",
  "Número de empleado/proveedor",
  "Género",
  "Edad"
];

function TiposDeReportante() {
  const [tipos, setTipos] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(null);
  const ultimoAgregadoRef = useRef(null);

  useEffect(() => {
    cargarDesdeBackend();
  }, []);

  // Scroll automático cuando cambian los tipos
  useEffect(() => {
    if (ultimoAgregadoRef.current) {
      ultimoAgregadoRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [tipos]);

  const cargarDesdeBackend = async () => {
    try {
      const res = await fetch("http://localhost:8000/reportantes");
      const datos = await res.json();
      const transformados = datos.map((item) => ({
        ...item,
        campos: item.campos_identidad.map((label) => ({ key: label, label }))
      }));
      setTipos(transformados);
    } catch (error) {
      console.error("Error cargando tipos de reportante:", error);
    }
  };

  const agregarNuevo = (texto) => {
    const nuevo = {
      id: `nuevo-${Date.now()}`,
      tipo_base: texto,
      etiqueta: texto,
      etiqueta_original: texto,
      anonimo: true,
      campos: [],
      cliente_id: 1,
      orden: tipos.length,
      esNuevo: true
    };
    setTipos((prev) => [...prev, nuevo]);
    setModoEdicion(nuevo.id);
  };

  const actualizarCampo = (id, campo, valor) => {
    setTipos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [campo]: valor } : t))
    );
  };

  const actualizarCampoIdentidad = (id, campoKey, nuevoValor) => {
    setTipos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const camposActualizados = [...t.campos];
        const index = camposActualizados.findIndex((c) => c.key === campoKey);

        if (nuevoValor === null) {
          if (index !== -1) camposActualizados.splice(index, 1);
        } else {
          if (index !== -1) {
            camposActualizados[index].label = nuevoValor;
          } else {
            camposActualizados.push({ key: campoKey, label: nuevoValor });
          }
        }
        return { ...t, campos: camposActualizados };
      })
    );
  };

  const guardar = async (tipo) => {
    const payload = {
      cliente_id: 1,
      tipo_base: tipo.tipo_base,
      etiqueta: tipo.etiqueta,
      anonimo: tipo.anonimo,
      orden: tipo.orden,
      campos_identidad: tipo.campos.map((c) => c.label)
    };
    try {
      const res = await fetch("http://localhost:8000/reportantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await cargarDesdeBackend();
        setModoEdicion(null);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const eliminar = async (tipo) => {
    if (!tipo.id || typeof tipo.id !== "number") {
      setTipos((prev) => prev.filter((t) => t.id !== tipo.id));
      return;
    }
    try {
      await fetch(`http://localhost:8000/reportantes/${tipo.id}`, {
        method: "DELETE"
      });
      await cargarDesdeBackend();
    } catch (error) {
      console.error("Error eliminando:", error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800 tracking-tight">
        Tipos de Reportante
      </h2>
      <p className="text-sm italic text-gray-600 mb-8 max-w-xl">
        Puede agregar varias veces un tipo base con etiquetas distintas. Ejemplo:{" "}
        <span className="font-semibold">Empleado sindicalizado</span>,{" "}
        <span className="font-semibold">Empleado confianza</span>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {opcionesDisponibles.map((op, idx) => (
          <button
            key={idx}
            onClick={() => agregarNuevo(op)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded shadow transition-colors flex items-center justify-center gap-2 text-sm"
            title={`Agregar tipo: ${op}`}
          >
            <Plus size={16} />
            <span className="truncate max-w-[150px]">{op}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tipos.map((t, i) => {
          const isLast = i === tipos.length - 1;
          return (
            <div
              key={t.id}
              ref={isLast ? ultimoAgregadoRef : null}
              className="border border-gray-300 rounded-lg p-6 shadow-md bg-white relative hover:shadow-lg transition-shadow"
            >
              {modoEdicion === t.id ? (
                <>
                  <input
                    className="border border-gray-400 p-2 w-full mb-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={t.etiqueta}
                    onChange={(e) => actualizarCampo(t.id, "etiqueta", e.target.value)}
                  />
                  <label className="inline-flex items-center text-sm mb-4 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={t.anonimo}
                      onChange={() => actualizarCampo(t.id, "anonimo", !t.anonimo)}
                      className="mr-2 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    Puede reportar anónimamente
                  </label>
                  <p className="text-sm font-semibold mb-3 text-gray-700">Campos de identidad:</p>
                  <div className="space-y-3">
                    {camposIdentidad.map((campo) => {
                      const activo = t.campos.some((c) => c.key === campo);
                      const valor = t.campos.find((c) => c.key === campo)?.label || campo;
                      return (
                        <div key={campo} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={activo}
                            onChange={() => actualizarCampoIdentidad(t.id, campo, activo ? null : valor)}
                            className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            disabled={!activo}
                            value={valor}
                            className="border border-gray-300 p-2 text-sm flex-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => actualizarCampoIdentidad(t.id, campo, e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => guardar(t)}
                      className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 shadow-md transition-colors flex items-center gap-2"
                    >
                      <Save size={18} /> Guardar
                    </button>
                    <button
                      onClick={() => setModoEdicion(null)}
                      className="bg-gray-300 px-5 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-semibold text-lg text-gray-900 mb-2">{t.etiqueta}</p>
                  <p className="text-sm text-gray-600 mb-1">{t.tipo_base}</p>
                  <p className="text-xs mb-2 italic text-gray-500">
                    Anónimo: <span className="font-semibold">{t.anonimo ? "Sí" : "No"}</span>
                  </p>
                  <p className="text-xs text-gray-700 mb-3">
                    Campos: {t.campos?.map((c) => c.label).join(", ") || "Ninguno"}
                  </p>
                  <p className="text-xs italic text-red-600 mt-2 select-none">* {t.tipo_base}</p>
                  <div className="absolute top-4 right-4 flex gap-3">
                    <button
                      onClick={() => setModoEdicion(t.id)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      aria-label="Editar tipo de reportante"
                      title="Editar tipo de reportante"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => eliminar(t)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      aria-label="Eliminar tipo de reportante"
                      title="Eliminar tipo de reportante"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TiposDeReportante;