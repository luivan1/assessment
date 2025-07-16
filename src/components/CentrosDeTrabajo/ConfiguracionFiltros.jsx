import { useState, useEffect } from 'react';

function ConfiguracionFiltros({ onCambiosFiltros }) {
  const [nuevoFiltro, setNuevoFiltro] = useState('');
  const [valorIndividual, setValorIndividual] = useState('');
  const [valoresTemp, setValoresTemp] = useState([]);
  const [filtros, setFiltros] = useState([]);
  const [filtrosActivos, setFiltrosActivos] = useState([]);
  const [ordenFiltros, setOrdenFiltros] = useState([]);
  const [filtroEditando, setFiltroEditando] = useState(null);
  const [nuevoNombreEditado, setNuevoNombreEditado] = useState('');
  const [valoresEditados, setValoresEditados] = useState([]);
  const [valorTemporalEditado, setValorTemporalEditado] = useState('');

  const organizacion_id = JSON.parse(localStorage.getItem('usuario'))?.organizacion_id;

  useEffect(() => {
    if (!organizacion_id) return;

    const cargarDatos = async () => {
      try {
        // 1. Cargar filtros personalizados
        const resFiltros = await fetch(`http://localhost:8000/filtros?organizacion_id=${organizacion_id}`);
        const dataFiltros = await resFiltros.json();
        setFiltros(dataFiltros);

        const nombresValidos = dataFiltros.map(f => f.nombre);
        const fijos = ['País', 'Estado', 'Municipio'];
        const nombresAceptados = [...fijos, ...nombresValidos];

        // 2. Cargar configuración de filtros activos y orden
        const resConfig = await fetch(`http://localhost:8000/filtros/configuracion?organizacion_id=${organizacion_id}`);
        if (!resConfig.ok) throw new Error('No hay configuración previa');

        const data = await resConfig.json();
        const activos = data.filtros_activos || [];
        const ordenOriginal = data.orden_filtros || [];

        const activosLimpios = activos.filter(nombre => nombresAceptados.includes(nombre));
        const ordenLimpio = ordenOriginal.filter(nombre => nombresAceptados.includes(nombre));

        setFiltrosActivos(activosLimpios);
        setOrdenFiltros(ordenLimpio);
      } catch (err) {
        console.warn('⚠️ No hay configuración previa o error al cargar:', err.message);
      }
    };

    cargarDatos();
  }, [organizacion_id]);

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

    if (!organizacion_id) {
      alert('❗ No hay organización válida en la sesión');
      return;
    }
    if (!nombre) {
      alert('❗ El nombre del filtro no puede estar vacío');
      return;
    }
    if (valoresTemp.length === 0) {
      alert('❗ Agrega al menos un valor al filtro');
      return;
    }

    const nuevo = { nombre, valores: valoresTemp, organizacion_id };

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
        alert('✅ Filtro guardado correctamente');
        onCambiosFiltros?.();
      } else {
        const error = await res.json();
        alert('❌ Error al guardar filtro: ' + (error?.detail || 'Error desconocido'));
      }
    } catch (err) {
      alert('❌ Error de red al guardar filtro');
    }
  };

    const guardarConfiguracionFiltros = async () => {
    if (!organizacion_id) return;

    const payload = { filtros_activos: filtrosActivos, orden_filtros: ordenFiltros, organizacion_id };

    try {
      const res = await fetch('http://localhost:8000/filtros/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Configuración de filtros guardada correctamente.');
        onCambiosFiltros?.();
      } else {
        const error = await res.json();
        console.error('Error al guardar configuración:', error.detail);
        alert('Hubo un problema al guardar la configuración.');
      }
    } catch (err) {
      console.error('Error de red al guardar configuración:', err);
      alert('Error de red al guardar configuración.');
    }
  };

  const eliminarFiltro = async (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este filtro?");
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:8000/filtros/${id}?organizacion_id=${organizacion_id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const nuevosFiltros = filtros.filter(f => f.id !== id);
        setFiltros(nuevosFiltros);

        const nombreEliminado = filtros.find(f => f.id === id)?.nombre;

        setFiltrosActivos(prev => prev.filter(f => f !== nombreEliminado));
        setOrdenFiltros(prev => prev.filter(f => f !== nombreEliminado));
      } else {
        console.error("❌ No se pudo eliminar el filtro desde backend");
      }
    } catch (err) {
      console.error("❌ Error eliminando filtro:", err);
    }
  };

  const guardarFiltroEditado = async () => {
    if (!filtroEditando || !organizacion_id) return;

    const payload = {
      nombre: nuevoNombreEditado.trim(),
      valores: valoresEditados,
      organizacion_id
    };

    try {
      const res = await fetch(`http://localhost:8000/filtros/${filtroEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const actualizado = await res.json();

        const nombreAnterior = filtroEditando.nombre;
        const nombreNuevo = actualizado.nombre;

        // Actualiza los filtros con el filtro editado
        setFiltros(prev => prev.map(f => f.id === actualizado.id ? actualizado : f));

        // También actualiza filtrosActivos y ordenFiltros si el nombre cambió
        if (nombreAnterior !== nombreNuevo) {
          setFiltrosActivos(prev =>
            prev.map(f => (f === nombreAnterior ? nombreNuevo : f))
          );
          setOrdenFiltros(prev =>
            prev.map(f => (f === nombreAnterior ? nombreNuevo : f))
          );
        }

        // 🔄 Propaga cambios a otros componentes (como CargaCentros)
        onCambiosFiltros?.();

        cancelarEdicion();
      } else {
        const error = await res.json();
        console.error('Error al actualizar filtro:', error.detail);
      }
    } catch (err) {
      console.error('Error de red al actualizar:', err);
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

  const editarFiltro = (filtro) => {
    setFiltroEditando(filtro);
    setNuevoNombreEditado(filtro.nombre);
    setValoresEditados([...filtro.valores]);
    setValorTemporalEditado('');
  };

  const agregarValorEditado = () => {
    const valor = valorTemporalEditado.trim();
    if (valor && !valoresEditados.includes(valor)) {
      setValoresEditados([...valoresEditados, valor]);
      setValorTemporalEditado('');
    }
  };

  const eliminarValorEditado = (valor) => {
    setValoresEditados(valoresEditados.filter(v => v !== valor));
  };

  const moverFiltro = (index, direccion) => {
    const nuevoOrden = [...ordenFiltros];
    const nuevoIndex = index + direccion;
    if (nuevoIndex < 0 || nuevoIndex >= nuevoOrden.length) return;

    [nuevoOrden[index], nuevoOrden[nuevoIndex]] = [nuevoOrden[nuevoIndex], nuevoOrden[index]];
    setOrdenFiltros(nuevoOrden);
  };

  const todosLosFiltros = ['País', 'Estado', 'Municipio', ...filtros.map(f => f.nombre)];

  const cancelarEdicion = () => {
    setFiltroEditando(null);
    setNuevoNombreEditado('');
    setValoresEditados([]);
    setValorTemporalEditado('');
  };

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

      {filtroEditando && (
        <div className="border border-yellow-400 p-4 mb-6 bg-yellow-50 rounded">
          <h2 className="text-lg font-semibold mb-2">Editando filtro: <span className="text-yellow-700">{filtroEditando.nombre}</span></h2>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Nuevo nombre</label>
            <input
              value={nuevoNombreEditado}
              onChange={(e) => setNuevoNombreEditado(e.target.value)}
              className="w-full border rounded p-1"
              placeholder="Nombre del filtro"
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Valores</label>
            <div className="flex gap-2 mb-2">
              <input
                value={valorTemporalEditado}
                onChange={(e) => setValorTemporalEditado(e.target.value)}
                className="flex-1 border rounded p-1"
                placeholder="Agregar valor"
              />
              <button
                onClick={agregarValorEditado}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {valoresEditados.map((valor, idx) => (
                <span
                  key={idx}
                  className="bg-gray-200 px-2 py-1 rounded flex items-center gap-1"
                >
                  {valor}
                  <button
                    onClick={() => eliminarValorEditado(valor)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={guardarFiltroEditado}
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            >
              Guardar cambios
            </button>
            <button
              onClick={cancelarEdicion}
              className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
                  onClick={() => editarFiltro(filtro)}
                  className="ml-2 text-xs text-yellow-600 hover:text-yellow-700"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => eliminarFiltro(filtro.id)}
                  className="ml-2 text-xs text-red-600 hover:text-red-700"
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

      <div className="mt-6">
        <button
          onClick={guardarConfiguracionFiltros}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Guardar configuración de filtros
        </button>
      </div>
    </div>
  );
}

export default ConfiguracionFiltros;