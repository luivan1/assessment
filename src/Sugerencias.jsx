import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';

function Sugerencias() {
  const [sugerenciasBD, setSugerenciasBD] = useState([]);
  const [sugerenciasEditables, setSugerenciasEditables] = useState([]);
  const [catalogoBase, setCatalogoBase] = useState({ sugerencias: [] });

  useEffect(() => {
    fetch("/catalogo_completo_integrado.json")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar el catálogo");
        return res.json();
      })
      .then((data) => setCatalogoBase({ sugerencias: data.sugerencias }))
      .catch((err) => {
        console.error("Error al cargar catálogo:", err);
        setCatalogoBase({ sugerencias: [] });
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:8000/sugerencias')
      .then(res => res.json())
      .then(data => setSugerenciasBD(data))
      .catch(() => setSugerenciasBD([]));
  }, []);

  useEffect(() => {
    const editables = sugerenciasBD.map(s => ({
      ...s,
      editando: false,
      titulo_original: s.titulo_original || s.titulo
    }));
    setSugerenciasEditables(editables);
  }, [sugerenciasBD]);

  const agregarSugerencia = (itemBase) => {
    const nueva = {
      cliente_id: 1,
      titulo: itemBase.titulo,
      descripcion: itemBase.descripcion,
      titulo_original: itemBase.titulo,
    };

    fetch('http://localhost:8000/sugerencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nueva)
    })
      .then(() => fetch('http://localhost:8000/sugerencias'))
      .then(res => res.json())
      .then(data => setSugerenciasBD(data));
  };

  const actualizarCampo = (id, campo, valor) => {
    const nuevas = [...sugerenciasEditables];
    setSugerenciasEditables(
      nuevas.map(s => s.id === id ? { ...s, [campo]: valor } : s)
    );
  };

  const guardarSugerencia = (id) => {
    const sugerencia = sugerenciasEditables.find(s => s.id === id);
    fetch(`http://localhost:8000/sugerencias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sugerencia)
    })
      .then(() => fetch('http://localhost:8000/sugerencias'))
      .then(res => res.json())
      .then(data => setSugerenciasBD(data));
  };

  const editarSugerencia = (id, cancelar = false) => {
    if (cancelar) {
      fetch('http://localhost:8000/sugerencias')
        .then(res => res.json())
        .then(data => setSugerenciasBD(data));
    } else {
      setSugerenciasEditables(
        sugerenciasEditables.map(s => s.id === id ? { ...s, editando: true } : s)
      );
    }
  };

  const eliminarSugerencia = (id) => {
    fetch(`http://localhost:8000/sugerencias/${id}`, {
      method: 'DELETE'
    })
      .then(() => fetch('http://localhost:8000/sugerencias'))
      .then(res => res.json())
      .then(data => setSugerenciasBD(data));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sugerencias</h1>
      <p className="text-sm italic text-gray-600 mb-6">
        Puedes editar o agregar múltiples sugerencias desde el catálogo.
      </p>

      {/* Botones de catálogo visual pro */}
      <div className="flex flex-wrap gap-2 mb-4">
        {catalogoBase.sugerencias.map((s) => (
          <button
            key={s.id}
            className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-2 py-1 rounded shadow flex items-center gap-1 transition-colors"
            onClick={() => agregarSugerencia(s)}
            style={{
              whiteSpace: "pre",
              minWidth: "80px",
              maxWidth: "100%",
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{s.titulo}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sugerenciasEditables.map((s) => (
          <div key={s.id} className="border p-4 rounded bg-white shadow">
            {s.editando ? (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-semibold">Título</label>
                  <input
                    className="border p-1 w-full rounded"
                    value={s.titulo}
                    onChange={(e) => actualizarCampo(s.id, 'titulo', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Descripción</label>
                  <textarea
                    className="border p-1 w-full rounded"
                    value={s.descripcion}
                    onChange={(e) => actualizarCampo(s.id, 'descripcion', e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    className="bg-gray-300 text-sm px-3 py-1 rounded hover:bg-gray-400"
                    onClick={() => editarSugerencia(s.id, true)}
                  >Cancelar</button>
                  <button
                    className="bg-blue-600 text-white text-sm px-4 py-1 rounded hover:bg-blue-700"
                    onClick={() => guardarSugerencia(s.id)}
                  >Guardar</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">{s.titulo}</p>
                    <p className="text-xs italic text-red-500">{s.titulo_original}</p>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{s.descripcion}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800" onClick={() => editarSugerencia(s.id)}>
                      <Pencil size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-800" onClick={() => eliminarSugerencia(s.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sugerencias;