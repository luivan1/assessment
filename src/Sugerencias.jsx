import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import catalogos from './catalogo_completo_integrado.json';

function Sugerencias() {
  const [sugerenciasBD, setSugerenciasBD] = useState([]);
  const [sugerenciasEditables, setSugerenciasEditables] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/sugerencias')
      .then((res) => res.json())
      .then((data) => setSugerenciasBD(data))
      .catch(() => setSugerenciasBD([]));
  }, []);

  useEffect(() => {
    const items = sugerenciasBD.map((s) => ({
      ...s,
      editando: false,
      titulo: s.titulo,
      descripcion: s.descripcion,
      titulo_original: s.titulo_original || s.titulo,
    }));
    setSugerenciasEditables(items);
  }, [sugerenciasBD]);

  const agregarSugerencia = (itemBase) => {
    const nueva = {
      cliente_id: 1,
      titulo: itemBase.titulo,
      descripcion: itemBase.descripcion || '',
      titulo_original: itemBase.titulo,
    };

    fetch('http://localhost:8000/sugerencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nueva),
    })
      .then(() => fetch('http://localhost:8000/sugerencias'))
      .then((res) => res.json())
      .then((data) => setSugerenciasBD(data));
  };

  const actualizarCampo = (id, campo, valor) => {
    const nuevas = sugerenciasEditables.map((item) =>
      item.id === id ? { ...item, [campo]: valor } : item
    );
    setSugerenciasEditables(nuevas);
  };

  const guardarSugerencia = (id) => {
    const item = sugerenciasEditables.find((i) => i.id === id);

    fetch(`http://localhost:8000/sugerencias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })
      .then(() => fetch('http://localhost:8000/sugerencias'))
      .then((res) => res.json())
      .then((data) => setSugerenciasBD(data));
  };

  const editarSugerencia = (id, cancelar = false) => {
    if (cancelar) {
      fetch('http://localhost:8000/sugerencias')
        .then((res) => res.json())
        .then((data) => setSugerenciasBD(data));
    } else {
      const nuevas = sugerenciasEditables.map((item) =>
        item.id === id ? { ...item, editando: true } : item
      );
      setSugerenciasEditables(nuevas);
    }
  };

  const eliminarSugerencia = (id) => {
    fetch(`http://localhost:8000/sugerencias/${id}`, {
      method: 'DELETE',
    })
      .then(() => fetch('http://localhost:8000/sugerencias'))
      .then((res) => res.json())
      .then((data) => setSugerenciasBD(data));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sugerencias</h1>
      <p className="text-sm italic text-gray-600 mb-6">
        Agrega sugerencias disponibles en el catálogo. Puedes editar su título y descripción.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {catalogos.sugerencias.map((item) => (
          <button
            key={item.id}
            className="bg-blue-100 hover:bg-blue-200 text-sm px-3 py-1 rounded"
            onClick={() => agregarSugerencia(item)}
          >
            {item.titulo}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sugerenciasEditables.map((item) => (
          <div key={item.id} className="border p-4 rounded bg-white shadow">
            {item.editando ? (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-semibold">Título</label>
                  <input
                    className="border p-1 w-full"
                    value={item.titulo}
                    onChange={(e) => actualizarCampo(item.id, 'titulo', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Descripción</label>
                  <textarea
                    className="border p-1 w-full"
                    value={item.descripcion}
                    onChange={(e) => actualizarCampo(item.id, 'descripcion', e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    className="bg-gray-300 text-sm px-3 py-1 rounded"
                    onClick={() => editarSugerencia(item.id, true)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="bg-blue-500 text-white text-sm px-4 py-1 rounded"
                    onClick={() => guardarSugerencia(item.id)}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">{item.titulo}</p>
                    <p className="text-xs italic text-red-500">{item.titulo_original}</p>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{item.descripcion}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="text-blue-600"
                      onClick={() => editarSugerencia(item.id)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => eliminarSugerencia(item.id)}
                    >
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