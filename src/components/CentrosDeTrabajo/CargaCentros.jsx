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
    fetch('/ubicaciones.json')
      .then(res => res.json())
      .then(data => {
        const ordenadas = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setUbicaciones(ordenadas);
      });

    fetch('http://localhost:8000/filtros')
      .then(res => res.json())
      .then(data => setFiltrosPersonalizados(data))
      .catch(err => console.error('Error cargando filtros personalizados:', err));

    cargarCentrosDesdeBackend();
  }, []);

  const cargarCentrosDesdeBackend = async () => {
    try {
      const res = await fetch('http://localhost:8000/centros');
      const data = await res.json();
      setCentros(data);
    } catch (err) {
      console.error('Error cargando centros desde backend:', err);
    }
  };

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

  const guardarCentro = async () => {
    const {
      nombre, pais, estado, ciudad, direccion, cp, telefono, id, ...otrosCampos
    } = formulario;

    const datosEnviar = {
      nombre,
      pais,
      estado,
      ciudad,
      direccion,
      cp,
      telefono,
      filtros_personalizados: otrosCampos
    };

    try {
      const url = modoEdicion !== null
        ? `http://localhost:8000/centros/${id}`
        : 'http://localhost:8000/centros';
      const metodo = modoEdicion !== null ? 'PUT' : 'POST';

      const respuesta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosEnviar)
      });

      if (respuesta.ok) {
        setFormulario({});
        setModoEdicion(null);
        setMostrarFormulario(false);
        cargarCentrosDesdeBackend();
      } else {
        console.error("Error al guardar centro");
      }
    } catch (error) {
      console.error("Error de red al guardar centro:", error);
    }
  };

  const editarCentro = (centro) => {
    setFormulario({ ...centro, ...centro.filtros_personalizados });
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  const eliminarCentro = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este centro?')) return;

    try {
      const res = await fetch(`http://localhost:8000/centros/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        cargarCentrosDesdeBackend();
      } else {
        console.error('Error eliminando centro');
      }
    } catch (error) {
      console.error('Error de red al eliminar centro:', error);
    }
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
      </div>

      {mostrarFormulario && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input placeholder="Centro de trabajo *" value={formulario.nombre || ''} onChange={(e) => manejarCambio('nombre', e.target.value)} className="border p-2" />
          <select value={formulario.pais || ''} onChange={(e) => manejarCambio('pais', e.target.value)} className="border p-2">
            <option value="">Selecciona país *</option>
            {ubicaciones.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
          <select value={formulario.estado || ''} onChange={(e) => manejarCambio('estado', e.target.value)} className="border p-2" disabled={!formulario.pais}>
            <option value="">Selecciona estado / provincia *</option>
            {estadosDisponibles.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
          </select>
          <select value={formulario.ciudad || ''} onChange={(e) => manejarCambio('ciudad', e.target.value)} className="border p-2" disabled={!formulario.estado}>
            <option value="">Selecciona ciudad / municipio *</option>
            {ciudadesDisponibles.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <input placeholder="Dirección" value={formulario.direccion || ''} onChange={(e) => manejarCambio('direccion', e.target.value)} className="border p-2" />
          <input placeholder="Código Postal" value={formulario.cp || ''} onChange={(e) => manejarCambio('cp', e.target.value)} className="border p-2" />
          <input placeholder="Teléfono" value={formulario.telefono || ''} onChange={(e) => manejarCambio('telefono', e.target.value)} className="border p-2" />

          {filtrosPersonalizados.map(filtro => (
            <div key={filtro.id} className="col-span-2 md:col-span-1">
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
            <button onClick={() => setMostrarFormulario(false)} className="text-gray-600 underline">Cancelar</button>
            <button onClick={guardarCentro} className="bg-green-600 text-white px-4 py-2 rounded">
              {modoEdicion ? 'Guardar cambios' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {centros.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {centros.map((c) => (
            <div key={c.id} className="border p-4 rounded flex flex-col justify-between">
              <div>
                <div className="font-semibold text-lg">{c.nombre}</div>
                <div className="text-sm text-gray-700">
                  {c.direccion}, {c.ciudad}, {c.estado}, {c.pais} ({c.cp})
                </div>
                <div className="text-sm text-gray-500 mb-2">Tel: {c.telefono}</div>

                {filtrosPersonalizados.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 mt-2">
                    {filtrosPersonalizados.map(filtro => {
                      const valor = c.filtros_personalizados?.[filtro.nombre];
                      return valor ? (
                        <div key={filtro.nombre}>
                          <strong>{filtro.nombre}:</strong>{' '}
                          <span className="inline-block bg-gray-200 rounded-full px-2 py-0.5 text-xs text-gray-700">
                            {valor}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => editarCentro(c)}
                  className="text-blue-600 text-sm underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarCentro(c.id)}
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