import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';

function Preguntas() {
  const [preguntasBD, setPreguntasBD] = useState([]);
  const [preguntasEditables, setPreguntasEditables] = useState([]);
  const [catalogoBase, setCatalogoBase] = useState({ preguntas: [] });

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const ORGANIZACION_ID = usuario.organizacion_id;

  useEffect(() => {
    fetch("/catalogo_completo_integrado.json")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar el catálogo");
        return res.json();
      })
      .then((data) => setCatalogoBase({ preguntas: data.preguntas }))
      .catch((err) => {
        console.error("Error al cargar catálogo:", err);
        setCatalogoBase({ preguntas: [] });
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:8000/preguntas', {
      headers: { 'X-Organizacion-ID': ORGANIZACION_ID }
    })
      .then(res => res.json())
      .then(data => setPreguntasBD(data))
      .catch(() => setPreguntasBD([]));
  }, []);

  useEffect(() => {
    const editables = preguntasBD.map(p => ({
      ...p,
      editando: false,
      titulo_original: p.titulo_original || p.titulo
    }));
    setPreguntasEditables(editables);
  }, [preguntasBD]);

  const agregarPregunta = (itemBase) => {
   const nueva = {
    titulo: itemBase.titulo,
    descripcion: itemBase.descripcion,
    titulo_original: itemBase.titulo,
    organizacion_id: ORGANIZACION_ID   // 👈 AÑADIR ESTO
  };

    fetch('http://localhost:8000/preguntas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Organizacion-ID': ORGANIZACION_ID
      },
      body: JSON.stringify(nueva)
    })
      .then(() => fetch('http://localhost:8000/preguntas', {
        headers: { 'X-Organizacion-ID': ORGANIZACION_ID }
      }))
      .then(res => res.json())
      .then(data => setPreguntasBD(data));
  };

  const actualizarCampo = (id, campo, valor) => {
    const nuevas = [...preguntasEditables];
    setPreguntasEditables(
      nuevas.map(p => p.id === id ? { ...p, [campo]: valor } : p)
    );
  };

  const guardarPregunta = (id) => {
    const pregunta = preguntasEditables.find(p => p.id === id);
    fetch(`http://localhost:8000/preguntas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Organizacion-ID': ORGANIZACION_ID
      },
      body: JSON.stringify(pregunta)
    })
      .then(() => fetch('http://localhost:8000/preguntas', {
        headers: { 'X-Organizacion-ID': ORGANIZACION_ID }
      }))
      .then(res => res.json())
      .then(data => setPreguntasBD(data));
  };

  const editarPregunta = (id, cancelar = false) => {
    if (cancelar) {
      fetch('http://localhost:8000/preguntas', {
        headers: { 'X-Organizacion-ID': ORGANIZACION_ID }
      })
        .then(res => res.json())
        .then(data => setPreguntasBD(data));
    } else {
      setPreguntasEditables(
        preguntasEditables.map(p => p.id === id ? { ...p, editando: true } : p)
      );
    }
  };

  const eliminarPregunta = (id) => {
    fetch(`http://localhost:8000/preguntas/${id}`, {
      method: 'DELETE',
      headers: { 'X-Organizacion-ID': ORGANIZACION_ID }
    })
      .then(() => fetch('http://localhost:8000/preguntas', {
        headers: { 'X-Organizacion-ID': ORGANIZACION_ID }
      }))
      .then(res => res.json())
      .then(data => setPreguntasBD(data));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Preguntas Frecuentes</h1>
      <p className="text-sm italic text-gray-600 mb-6">
        Puedes editar o agregar múltiples preguntas desde el catálogo.
      </p>

      {/* Botones visual tipo Denuncias */}
      <div className="flex flex-wrap gap-2 mb-4">
        {catalogoBase.preguntas.map((p) => (
          <button
            key={p.id}
            className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-2 py-1 rounded shadow flex items-center gap-1 transition-colors"
            onClick={() => agregarPregunta(p)}
            style={{
              whiteSpace: "pre",
              minWidth: "80px",
              maxWidth: "100%",
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{p.titulo}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {preguntasEditables.map((p) => (
          <div key={p.id} className="border p-4 rounded bg-white shadow">
            {p.editando ? (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-semibold">Título</label>
                  <input
                    className="border p-1 w-full"
                    value={p.titulo}
                    onChange={(e) => actualizarCampo(p.id, 'titulo', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Descripción</label>
                  <textarea
                    className="border p-1 w-full"
                    value={p.descripcion}
                    onChange={(e) => actualizarCampo(p.id, 'descripcion', e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    className="bg-gray-300 text-sm px-3 py-1 rounded"
                    onClick={() => editarPregunta(p.id, true)}
                  >Cancelar</button>
                  <button
                    className="bg-blue-500 text-white text-sm px-4 py-1 rounded"
                    onClick={() => guardarPregunta(p.id)}
                  >Guardar</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">{p.titulo}</p>
                    <p className="text-xs italic text-red-500">{p.titulo_original}</p>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{p.descripcion}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-600" onClick={() => editarPregunta(p.id)}>
                      <Pencil size={16} />
                    </button>
                    <button className="text-red-600" onClick={() => eliminarPregunta(p.id)}>
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

export default Preguntas;