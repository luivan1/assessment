import { useEffect, useState } from 'react';
import catalogos from './catalogo_completo_integrado.json';
import { Pencil, Trash2 } from 'lucide-react';

function Preguntas() {
  const [preguntasBD, setPreguntasBD] = useState([]);
  const [preguntasEditables, setPreguntasEditables] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/preguntas')
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
      cliente_id: 1,
      titulo: itemBase.titulo,
      descripcion: itemBase.descripcion,
      titulo_original: itemBase.titulo,
    };

    fetch('http://localhost:8000/preguntas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nueva)
    })
      .then(() => fetch('http://localhost:8000/preguntas'))
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pregunta)
    })
      .then(() => fetch('http://localhost:8000/preguntas'))
      .then(res => res.json())
      .then(data => setPreguntasBD(data));
  };

  const editarPregunta = (id, cancelar = false) => {
    if (cancelar) {
      fetch('http://localhost:8000/preguntas')
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
      method: 'DELETE'
    })
      .then(() => fetch('http://localhost:8000/preguntas'))
      .then(res => res.json())
      .then(data => setPreguntasBD(data));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Preguntas Frecuentes</h1>
      <p className="text-sm italic text-gray-600 mb-6">
        Puedes editar o agregar múltiples preguntas desde el catálogo.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {catalogos.preguntas.map((p) => (
          <button
            key={p.id}
            className="bg-blue-100 hover:bg-blue-200 text-sm px-3 py-1 rounded"
            onClick={() => agregarPregunta(p)}
          >
            {p.titulo}
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