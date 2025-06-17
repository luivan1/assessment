import { useState, useEffect } from 'react';

function CentrosDeTrabajo() {
  const [nuevoFiltro, setNuevoFiltro] = useState('');
  const [valorIndividual, setValorIndividual] = useState('');
  const [valoresTemp, setValoresTemp] = useState([]);
  const [filtros, setFiltros] = useState([]);
  const [filtrosActivos, setFiltrosActivos] = useState([]);
  const [ordenFiltros, setOrdenFiltros] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/filtros')
      .then(res => res.json())
      .then(data => setFiltros(data))
      .catch(err => console.error('Error cargando filtros:', err));
  }, []);

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

  const agregarFiltro = async () => {
    const nombre = nuevoFiltro.trim();
    if (!nombre || valoresTemp.length === 0) return;

    const nuevo = { nombre, valores: valoresTemp };

    try {
      const res = await fetch('http://localhost:8000/filtros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo),
      });

      if (res.ok) {
        const creado = await res.json();
        setFiltros([...filtros, creado]);
        setNuevoFiltro('');
        setValoresTemp([]);
      } else {
        const error = await res.json();
        console.error('Error al guardar filtro:', error.detail);
      }
    } catch (err) {
      console.error('Error de red:', err);
    }
  };

  const eliminarFiltro = async (nombre) => {
    const filtro = filtros.find(f => f.nombre === nombre);
    if (!filtro) return;

    try {
      const res = await fetch(`http://localhost:8000/filtros/${filtro.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setFiltros(filtros.filter(f => f.id !== filtro.id));
        setFiltrosActivos(filtrosActivos.filter(f => f !== nombre));
        setOrdenFiltros(ordenFiltros.filter(f => f !== nombre));
      } else {
        console.error('Error al eliminar filtro');
      }
    } catch (err) {
      console.error('Error de red al eliminar:', err);
    }
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

  const moverFiltro = (index, direccion) => {
    const nuevoOrden = [...ordenFiltros];
    const nuevoIndex = index + direccion;
    if (nuevoIndex < 0 || nuevoIndex >= nuevoOrden.length) return;

    [nuevoOrden[index], nuevoOrden[nuevoIndex]] = [nuevoOrden[nuevoIndex], nuevoOrden[index]];
    setOrdenFiltros(nuevoOrden);
  };

  const todosLosFiltros = ['País', 'Estado', 'Municipio', ...filtros.map(f => f.nombre)];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Configuración de Filtros de Centros de Trabajo</h1>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Crear filtros personalizados</h2>
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                agregarValor();
              }
            }}
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
            Agregar filtro
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">Filtros activos y orden</h2>
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

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Filtros Personalizados</h2>
        {filtros.length > 0 ? (
          <ul className="text-sm text-gray-700 list-disc ml-5 space-y-1">
            {filtros.map((filtro) => (
              <li key={filtro.nombre}>
                <strong>{filtro.nombre}:</strong> {filtro.valores.join(', ')}
                <button
                  onClick={() => eliminarFiltro(filtro.nombre)}
                  className="ml-2 text-xs text-red-600"
                >
                  🗑️ Borrar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No hay filtros registrados aún.</p>
        )}
      </section>
    </div>
  );
}

export default CentrosDeTrabajo;