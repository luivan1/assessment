import { useState, useEffect } from 'react';

function CentrosDeTrabajo() {
  const [nuevoFiltro, setNuevoFiltro] = useState('');
  const [valorIndividual, setValorIndividual] = useState('');
  const [valoresTemp, setValoresTemp] = useState([]);
  const [filtros, setFiltros] = useState([]);
  const [filtrosActivos, setFiltrosActivos] = useState([]);
  const [ordenFiltros, setOrdenFiltros] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(null);

  useEffect(() => {
    const datosAGuardar = filtros.map(f => ({
      nombre: f.nombre,
      valores: f.valores
    }));
    localStorage.setItem('filtrosCentrosTrabajo', JSON.stringify(datosAGuardar));
  }, [filtros]);

  useEffect(() => {
    localStorage.setItem('filtrosActivosCentrosTrabajo', JSON.stringify(filtrosActivos));
  }, [filtrosActivos]);

  useEffect(() => {
    localStorage.setItem('ordenFiltrosCentrosTrabajo', JSON.stringify(ordenFiltros));
  }, [ordenFiltros]); // ✅ ESTE ES EL CAMBIO

  const agregarValor = () => {
    const valor = valorIndividual.trim();
    if (valor && !valoresTemp.includes(valor)) {
      setValoresTemp([...valoresTemp, valor]);
      setValorIndividual('');
    }
  };

  const eliminarValor = (v) => {
    setValoresTemp(valoresTemp.filter(val => val !== v));
  };

  const agregarFiltro = () => {
    const nombre = nuevoFiltro.trim();
    if (!nombre || filtros.some((f) => f.nombre === nombre && f.nombre !== modoEdicion)) return;

    if (modoEdicion) {
      const nuevos = filtros.map(f =>
        f.nombre === modoEdicion ? { nombre, valores: valoresTemp } : f
      );
      setFiltros(nuevos);
      setModoEdicion(null);
    } else {
      setFiltros([...filtros, { nombre, valores: valoresTemp }]);
    }

    setNuevoFiltro('');
    setValoresTemp([]);
  };

  const editarFiltro = (filtro) => {
    setNuevoFiltro(filtro.nombre);
    setValoresTemp(filtro.valores);
    setModoEdicion(filtro.nombre);
  };

  const eliminarFiltro = (nombre) => {
    setFiltros(filtros.filter(f => f.nombre !== nombre));
    setFiltrosActivos(filtrosActivos.filter(f => f !== nombre));
    setOrdenFiltros(ordenFiltros.filter(f => f !== nombre));
  };

  const moverFiltro = (index, direccion) => {
    const nuevoOrden = [...ordenFiltros];
    const nuevoIndex = index + direccion;
    if (nuevoIndex < 0 || nuevoIndex >= nuevoOrden.length) return;

    [nuevoOrden[index], nuevoOrden[nuevoIndex]] = [nuevoOrden[nuevoIndex], nuevoOrden[index]];
    setOrdenFiltros(nuevoOrden);
  };

  const alternarFiltroActivo = (nombre) => {
    const yaActivo = filtrosActivos.includes(nombre);
    const nuevosActivos = yaActivo
      ? filtrosActivos.filter(f => f !== nombre)
      : [...filtrosActivos, nombre];

    const nuevoOrden = yaActivo
      ? ordenFiltros.filter(f => f !== nombre)
      : [...ordenFiltros, nombre];

    setFiltrosActivos(nuevosActivos);
    setOrdenFiltros(nuevoOrden);
  };

  const todosLosFiltros = ['País', 'Estado', 'Municipio', ...filtros.map(f => f.nombre)];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Configuración de Filtros de Centros de Trabajo</h1>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">{modoEdicion ? 'Editar filtro' : 'Crear filtros personalizados'}</h2>
        <div className="flex gap-2 mb-2">
          <input
            placeholder="Nombre del filtro"
            value={nuevoFiltro}
            onChange={(e) => setNuevoFiltro(e.target.value)}
            className="border p-1 flex-1"
          />
        </div>
        <div className="flex gap-2 mb-2">
          <input
            placeholder="Agregar valor"
            value={valorIndividual}
            onChange={(e) => setValorIndividual(e.target.value)}
            className="border p-1 flex-1"
          />
          <button onClick={agregarValor} className="bg-gray-700 text-white px-3 py-1 rounded">+</button>
        </div>
        {valoresTemp.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {valoresTemp.map((v, idx) => (
              <span key={idx} className="bg-gray-200 px-2 py-1 rounded text-sm">
                {v}
                <button className="ml-1 text-red-500" onClick={() => eliminarValor(v)}>×</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-2">
          <button
            onClick={agregarFiltro}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            {modoEdicion ? 'Actualizar filtro' : 'Agregar filtro'}
          </button>
          {modoEdicion && (
            <button
              onClick={() => {
                setModoEdicion(null);
                setNuevoFiltro('');
                setValoresTemp([]);
              }}
              className="text-sm text-gray-500 underline"
            >
              Cancelar
            </button>
          )}
        </div>

        {filtros.length > 0 && (
          <ul className="text-sm text-gray-700 list-disc ml-5 mt-4 space-y-1">
            {filtros.map((filtro) => (
              <li key={filtro.nombre}>
                <strong>{filtro.nombre}:</strong> {filtro.valores.join(', ')}
                <div className="inline ml-4 space-x-2">
                  <button onClick={() => editarFiltro(filtro)} className="text-xs text-blue-600">✏️ Editar</button>
                  {!filtrosActivos.includes(filtro.nombre) && (
                    <button onClick={() => eliminarFiltro(filtro.nombre)} className="text-xs text-red-600">🗑️ Borrar</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">Filtros activos y orden</h2>
          <p className="text-sm text-gray-600 mb-2">
            Selecciona qué filtros se usarán para sus centros de trabajo.
          </p>
          {todosLosFiltros.map((filtro) => (
            <div key={filtro} className="flex items-center justify-between mb-1">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filtrosActivos.includes(filtro)}
                  onChange={() => alternarFiltroActivo(filtro)}
                />
                {filtro}
              </label>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Orden de filtros activos</h2>
          <p className="text-sm text-gray-600 mb-2">
            Seleccione el orden en el que aparecerán sus centros de trabajo.
          </p>
          {ordenFiltros.length > 0 ? (
            ordenFiltros.map((filtro, index) => (
              <div key={`${filtro}-${index}`} className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 text-right text-gray-600 mr-2">{index + 1}.</span>
                  {filtro}
                </div>
                <div className="space-x-2">
                  {index > 0 && (
                    <button
                      onClick={() => moverFiltro(index, -1)}
                      className="text-xs text-blue-600"
                    >
                      ↑
                    </button>
                  )}
                  {index < ordenFiltros.length - 1 && (
                    <button
                      onClick={() => moverFiltro(index, 1)}
                      className="text-xs text-blue-600"
                    >
                      ↓
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay filtros activos seleccionados.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default CentrosDeTrabajo;