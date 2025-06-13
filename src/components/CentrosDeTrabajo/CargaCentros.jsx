import { useState, useEffect } from 'react';

function CargaCentros() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [centros, setCentros] = useState([]);
  const [formulario, setFormulario] = useState({});
  const [modoEdicion, setModoEdicion] = useState(null);

  const [ubicaciones, setUbicaciones] = useState([]);
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);
  const [ciudadesDisponibles, setCiudadesDisponibles] = useState([]);

  const [filtrosPersonalizados, setFiltrosPersonalizados] = useState([]);

  useEffect(() => {
    // Cargar ubicaciones
    fetch('/ubicaciones.json')
      .then(res => res.json())
      .then(data => {
        const ordenadas = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setUbicaciones(ordenadas);
      });

    // Cargar filtros personalizados activos y en orden
    try {
      const todos = JSON.parse(localStorage.getItem('filtrosCentrosTrabajo') || '[]');
      const activos = JSON.parse(localStorage.getItem('filtrosActivosCentrosTrabajo') || '[]');
      const orden = JSON.parse(localStorage.getItem('ordenFiltrosCentrosTrabajo') || '[]');

      const activosOrdenados = orden
        .filter(nombre => activos.includes(nombre))
        .map(nombre => todos.find(f => f.nombre === nombre))
        .filter(Boolean); // elimina nulos

      setFiltrosPersonalizados(activosOrdenados);
    } catch (e) {
      console.error('Error cargando filtros personalizados desde localStorage', e);
    }
  }, []);

  useEffect(() => {
    const pais = ubicaciones.find(p => p.name === formulario.pais);
    const estados = pais?.states || [];
    setEstadosDisponibles(estados.sort((a, b) => a.name.localeCompare(b.name)));
    setCiudadesDisponibles([]);
    setFormulario(prev => ({ ...prev, estado: '', ciudad: '' }));
  }, [formulario.pais]);

  useEffect(() => {
    const pais = ubicaciones.find(p => p.name === formulario.pais);
    const estado = pais?.states.find(e => e.name === formulario.estado);
    const ciudades = estado?.cities || [];
    setCiudadesDisponibles(ciudades.sort((a, b) => a.name.localeCompare(b.name)));
    setFormulario(prev => ({ ...prev, ciudad: '' }));
  }, [formulario.estado]);

  const manejarCambio = (campo, valor) => {
    setFormulario({ ...formulario, [campo]: valor });
  };

  const guardarCentro = () => {
    if (modoEdicion !== null) {
      const actualizados = centros.map((c, i) =>
        i === modoEdicion ? { ...formulario } : c
      );
      setCentros(actualizados);
      setModoEdicion(null);
    } else {
      setCentros([...centros, { ...formulario }]);
    }
    setFormulario({});
    setMostrarFormulario(false);
  };

  const editarCentro = (index) => {
    setFormulario(centros[index]);
    setModoEdicion(index);
    setMostrarFormulario(true);
  };

  const eliminarCentro = (index) => {
    const copia = [...centros];
    copia.splice(index, 1);
    setCentros(copia);
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h2 className="text-xl font-semibold mb-2">Carga de centros de trabajo</h2>
      <p className="text-sm text-gray-600 mb-4">
        Selecciona cómo deseas agregar tus centros de trabajo
      </p>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setFormulario({});
            setModoEdicion(null);
            setMostrarFormulario(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Agregar centro de trabajo
        </button>
        <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded">
          Cargar desde plantilla
        </button>
      </div>

      {mostrarFormulario && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input
            placeholder="Centro de trabajo *"
            value={formulario.nombre || ''}
            onChange={(e) => manejarCambio('nombre', e.target.value)}
            className="border p-2"
          />

          <select
            value={formulario.pais || ''}
            onChange={(e) => manejarCambio('pais', e.target.value)}
            className="border p-2"
          >
            <option value="">Selecciona país *</option>
            {ubicaciones.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>

          <select
            value={formulario.estado || ''}
            onChange={(e) => manejarCambio('estado', e.target.value)}
            className="border p-2"
            disabled={!formulario.pais}
          >
            <option value="">Selecciona estado / provincia *</option>
            {estadosDisponibles.map(e => (
              <option key={e.name} value={e.name}>{e.name}</option>
            ))}
          </select>

          <select
            value={formulario.ciudad || ''}
            onChange={(e) => manejarCambio('ciudad', e.target.value)}
            className="border p-2"
            disabled={!formulario.estado}
          >
            <option value="">Selecciona ciudad / municipio *</option>
            {ciudadesDisponibles.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>

          <input
            placeholder="Dirección"
            value={formulario.direccion || ''}
            onChange={(e) => manejarCambio('direccion', e.target.value)}
            className="border p-2"
          />
          <input
            placeholder="Código Postal"
            value={formulario.cp || ''}
            onChange={(e) => manejarCambio('cp', e.target.value)}
            className="border p-2"
          />
          <input
            placeholder="Teléfono"
            value={formulario.telefono || ''}
            onChange={(e) => manejarCambio('telefono', e.target.value)}
            className="border p-2"
          />

          {/* Filtros personalizados activos */}
          {filtrosPersonalizados.map(filtro => (
            <div key={filtro.nombre} className="col-span-2">
              <label className="block text-sm font-semibold mb-1">{filtro.nombre}</label>
              <select
                value={formulario[filtro.nombre] || ''}
                onChange={(e) => manejarCambio(filtro.nombre, e.target.value)}
                className="border p-2 w-full"
              >
                <option value="">Selecciona {filtro.nombre}</option>
                {filtro.valores.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          ))}

          <div className="col-span-2 flex gap-4 justify-end">
            <button
              onClick={() => setMostrarFormulario(false)}
              className="text-gray-600 underline"
            >
              Cancelar
            </button>
            <button
              onClick={guardarCentro}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {modoEdicion !== null ? 'Guardar cambios' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {centros.length > 0 && (
        <div className="space-y-4">
          {centros.map((c, i) => (
            <div
              key={i}
              className="border p-4 rounded flex justify-between items-start"
            >
              <div>
                <div className="font-semibold">{c.nombre}</div>
                <div className="text-sm text-gray-700">
                  {c.direccion}, {c.ciudad}, {c.estado}, {c.pais} ({c.cp})
                </div>
                <div className="text-sm text-gray-500">Tel: {c.telefono}</div>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => editarCentro(i)}
                  className="text-blue-600 text-sm underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarCentro(i)}
                  className="text-red-600 text-sm underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CargaCentros;