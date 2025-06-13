import { useState } from 'react';
import catalogos from './catalogo_completo_integrado.json';

function Preguntas() {
  const [selecciones, setSelecciones] = useState({});
  const [abiertos, setAbiertos] = useState({});
  const [preguntas, setPreguntas] = useState([...catalogos.preguntas]);

  const toggleSeleccion = (id) => {
    setSelecciones((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        seleccionada: !prev[id]?.seleccionada
      }
    }));
    setAbiertos((prev) => ({ ...prev, [id]: true }));
  };

  const actualizarCampo = (id, campo, valor) => {
    setSelecciones((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: valor }
    }));
  };

  const agregarSimilar = (item, index) => {
    const nuevoId = `${item.id}_copia_${Date.now()}`;
    const clon = {
      ...item,
      id: nuevoId,
      esClon: true
    };
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas.splice(index + 1, 0, clon);
    setPreguntas(nuevasPreguntas);
    setAbiertos((prev) => ({ ...prev, [nuevoId]: true }));
    setSelecciones((prev) => ({
      ...prev,
      [nuevoId]: { seleccionada: false }
    }));
  };

  const eliminarClon = (id) => {
    setPreguntas((prev) => prev.filter((p) => p.id !== id));
    setAbiertos((prev) => {
      const nuevo = { ...prev };
      delete nuevo[id];
      return nuevo;
    });
    setSelecciones((prev) => {
      const nuevo = { ...prev };
      delete nuevo[id];
      return nuevo;
    });
  };

  const toggleColapsar = (id) => {
    setAbiertos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItem = (item, index) => {
    const seleccionado = !!selecciones[item.id]?.seleccionada;
    const abierto = !!abiertos[item.id];
    const valores = selecciones[item.id] || {};

    return (
      <div key={item.id} className="border p-4 rounded mb-4 bg-white shadow">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleColapsar(item.id)}>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={seleccionado}
              onChange={() => toggleSeleccion(item.id)}
            />
            <strong>{valores.titulo || item.titulo}</strong>
          </div>
          <span className="text-sm text-blue-600">{abierto ? '▲' : '▼'}</span>
        </div>

        <button
          className="text-blue-600 text-sm mt-2 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            agregarSimilar(item, index);
          }}
        >
          + Agregar
        </button>

        {item.esClon && (
          <button
            className="text-red-600 text-sm ml-4 hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              eliminarClon(item.id);
            }}
          >
            Eliminar
          </button>
        )}

        {abierto && seleccionado && (
          <div className="mt-4 space-y-2">
            <label className="block font-bold text-sm">Título</label>
            <input
              className="border p-1 w-full"
              maxLength={180}
              value={valores.titulo || item.titulo}
              onChange={(e) => actualizarCampo(item.id, 'titulo', e.target.value)}
            />
            <label className="block font-bold text-sm">Descripción</label>
            <textarea
              className="border p-1 w-full"
              maxLength={400}
              value={valores.descripcion || item.descripcion}
              onChange={(e) => actualizarCampo(item.id, 'descripcion', e.target.value)}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Catálogo de Preguntas</h1>
      <p className="text-sm italic text-gray-600 mb-6">
        Selecciona las preguntas que deseas activar para conocer la percepción del personal. Puedes editar los textos para adaptarlos al lenguaje de tu empresa, pero no puedes agregar nuevas preguntas.
      </p>

      {preguntas.map((item, index) => renderItem(item, index))}
    </div>
  );
}

export default Preguntas;