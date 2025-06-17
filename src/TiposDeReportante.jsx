import { useState, useEffect } from "react";
import { X, Pencil, Save, Trash2 } from "lucide-react";

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

  useEffect(() => {
    cargarDesdeBackend();
  }, []);

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
      <h2 className="text-2xl font-bold mb-4">Tipos de Reportante</h2>
      <p className="text-sm italic mb-4">
        Puede agregar varias veces un tipo base con etiquetas distintas. Ejemplo: “Empleado sindicalizado”, “Empleado confianza”.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-6">
        {opcionesDisponibles.map((op, idx) => (
          <button
            key={idx}
            onClick={() => agregarNuevo(op)}
            className="bg-blue-100 hover:bg-blue-200 px-3 py-2 text-sm rounded"
          >
            {op}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tipos.map((t) => (
          <div key={t.id} className="border rounded p-4 shadow bg-white relative">
            {modoEdicion === t.id ? (
              <>
                <input
                  className="border p-1 w-full mb-2"
                  value={t.etiqueta}
                  onChange={(e) => actualizarCampo(t.id, "etiqueta", e.target.value)}
                />
                <label className="inline-flex items-center text-sm mb-3">
                  <input
                    type="checkbox"
                    checked={t.anonimo}
                    onChange={() => actualizarCampo(t.id, "anonimo", !t.anonimo)}
                    className="mr-2"
                  />
                  Puede reportar anónimamente
                </label>
                <p className="text-sm font-semibold mb-2">Campos de identidad:</p>
                <div className="space-y-2">
                  {camposIdentidad.map((campo) => {
                    const activo = t.campos.some((c) => c.key === campo);
                    const valor = t.campos.find((c) => c.key === campo)?.label || campo;
                    return (
                      <div key={campo} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={activo}
                          onChange={() => actualizarCampoIdentidad(t.id, campo, activo ? null : valor)}
                        />
                        <input
                          type="text"
                          disabled={!activo}
                          value={valor}
                          className="border p-1 text-sm flex-1"
                          onChange={(e) => actualizarCampoIdentidad(t.id, campo, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => guardar(t)}
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm"
                  >
                    <Save size={16} className="inline-block mr-1" /> Guardar
                  </button>
                  <button
                    onClick={() => setModoEdicion(null)}
                    className="bg-gray-300 px-4 py-1 rounded text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="font-semibold text-base mb-1">{t.etiqueta}</p>
                <p className="text-sm text-gray-600 mb-1">{t.tipo_base}</p>
                <p className="text-xs mb-2 italic">
                  Anónimo: {t.anonimo ? "Sí" : "No"}
                </p>
                <p className="text-xs text-gray-700 mb-2">
                  Campos: {t.campos?.map((c) => c.label).join(", ") || "Ninguno"}
                </p>
                <p className="text-xs italic text-red-600 mt-1">* {t.tipo_base}</p>
                <div className="absolute top-2 right-2 flex gap-2">
                  <button onClick={() => setModoEdicion(t.id)} className="text-blue-600">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => eliminar(t)} className="text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TiposDeReportante;