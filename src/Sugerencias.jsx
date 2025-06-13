import { useState } from 'react';
import { Pencil } from 'lucide-react';
import catalogos from './catalogo_completo_integrado.json';

function Sugerencias() {
  const [selecciones, setSelecciones] = useState({});
  const [abiertos, setAbiertos] = useState({});
  const [sugerencias, setSugerencias] = useState([...catalogos.sugerencias]);

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

  const toggleColapsar = (id) => {
    setAbiertos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const agregarSimilar = (item, index) => {
    const nuevoId = `${item.id}_copia_${Date.now()}`;
    const clon = {
      ...item,
      id: nuevoId,
      esClon: true
    };
    const nuevas = [...sugerencias];
    nuevas.splice(index + 1, 0, clon);
    setSugerencias(nuevas);
    setAbiertos((prev) => ({ ...prev, [nuevoId]: true }));
    setSelecciones((prev) => ({
      ...prev,
      [nuevoId]: { seleccionada: false }
    }));
  };

  const eliminarClon = (id) => {
    setSugerencias((prev) => prev.filter((s) => s.id !== id));
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

  const renderContador = (valor, max) => (
    <span className={`text-xs ml-2 ${valor.length >= max ? 'text-red-600' : 'text-gray-500'}`}>
      {`${valor.length}/${max}`}
    </span>
  );

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
            {renderContador(valores.titulo || item.titulo, 180)}

            <label className="block font-bold text-sm">Descripción</label>
            <textarea
              className="border p-1 w-full"
              maxLength={400}
              value={valores.descripcion || item.descripcion}
              onChange={(e) => actualizarCampo(item.id, 'descripcion', e.target.value)}
            />
            {renderContador(valores.descripcion || item.descripcion, 400)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sugerencias</h1>
      <p className="text-sm italic text-gray-600 mb-6">
        Selecciona los temas sobre los que deseas recibir sugerencias de los colaboradores. Puedes modificar los textos para que reflejen mejor tu cultura interna, pero no se permiten preguntas adicionales.
      </p>

      {sugerencias.map((item, index) => renderItem(item, index))}
    </div>
  );
}

export default Sugerencias;