import { useState } from 'react';
import { Pencil } from 'lucide-react';
import catalogos from './catalogo_completo_integrado.json';

function App() {
  const [tab, setTab] = useState('denuncias');
  const [selecciones, setSelecciones] = useState({});
  const [abiertos, setAbiertos] = useState({});
  const [resultado, setResultado] = useState(null);
  const [categoriasEditables, setCategoriasEditables] = useState(
    catalogos.denuncias.map((grupo) => ({
      categoria: grupo.categoria,
      descripcion: grupo.descripcion,
      editando: false
    }))
  );

  const subtitulos = {
    denuncias: 'De la siguiente lista elige los tipos de denuncia que deseas utilizar en tu sistema. Puedes editar todos los textos para personalizarlos con tu propio lenguaje corporativo. Recuerda que puedes cambiar los textos, pero no la intención. Por ejemplo, si seleccionas Fraude no debes modificarlo para que parezca Acoso. También puedes agregar una pregunta adicional que será realizada al denunciante dependiendo del tipo de denuncia seleccionada.',
    preguntas: 'Selecciona las preguntas que deseas activar para conocer la percepción del personal. Puedes editar los textos para adaptarlos al lenguaje de tu empresa, pero no puedes agregar nuevas preguntas.',
    sugerencias: 'Selecciona los temas sobre los que deseas recibir sugerencias de los colaboradores. Puedes modificar los textos para que reflejen mejor tu cultura interna, pero no se permiten preguntas adicionales.'
  };

  const toggleSeleccion = (grupo, id) => {
    setSelecciones((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        seleccionada: !prev[id]?.seleccionada,
        grupo,
        ejemplos: prev[id]?.ejemplos || [],
        anonimo: prev[id]?.anonimo ?? true,
        reportantes: prev[id]?.reportantes ?? ['Empleado', 'Cliente', 'Proveedor']
      }
    }));
    setAbiertos((prev) => ({ ...prev, [id]: true }));
  };

  const actualizarCampo = (id, campo, valor) => {
    setSelecciones((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [campo]: valor
      }
    }));
  };

  const actualizarEjemplo = (id, index, valor) => {
    setSelecciones((prev) => {
      const nuevosEjemplos = [...(prev[id]?.ejemplos || ['', '', '', '', ''])];
      nuevosEjemplos[index] = valor;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          ejemplos: nuevosEjemplos
        }
      };
    });
  };

  const actualizarReportantes = (id, valor) => {
    setSelecciones((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        reportantes: valor
      }
    }));
  };

  const toggleColapsar = (id) => {
    setAbiertos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const posiblesReportantes = ['Empleado', 'Cliente', 'Proveedor'];

  const renderContador = (valor, max) => (
    <span className={`text-xs ml-2 ${valor.length >= max ? 'text-red-600' : 'text-gray-500'}`}>{`${valor.length}/${max}`}</span>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Catálogo de Reportes</h1>
      <div className="flex gap-4 mb-4">
        {Object.keys(catalogos).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded ${tab === key ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>
      <p className="text-sm italic text-gray-600 mb-6">{subtitulos[tab]}</p>

      {tab === 'denuncias'
        ? catalogos.denuncias.map((grupo, gIndex) => (
            <div key={gIndex} className="mb-10">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  {categoriasEditables[gIndex].editando ? (
                    <>
                      <input
                        className="text-xl font-bold text-blue-700 w-full mb-1 border"
                        maxLength={100}
                        value={categoriasEditables[gIndex].categoria}
                        onChange={(e) => {
                          const nuevos = [...categoriasEditables];
                          nuevos[gIndex].categoria = e.target.value;
                          setCategoriasEditables(nuevos);
                        }}
                      />
                      {renderContador(categoriasEditables[gIndex].categoria, 100)}
                      <textarea
                        className="text-sm w-full text-gray-700 mb-2 border mt-2"
                        maxLength={400}
                        value={categoriasEditables[gIndex].descripcion}
                        onChange={(e) => {
                          const nuevos = [...categoriasEditables];
                          nuevos[gIndex].descripcion = e.target.value;
                          setCategoriasEditables(nuevos);
                        }}
                      />
                      {renderContador(categoriasEditables[gIndex].descripcion, 400)}
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-blue-700 mb-1">{categoriasEditables[gIndex].categoria}</h2>
                      <p className="text-sm text-gray-700 mb-2">{categoriasEditables[gIndex].descripcion}</p>
                    </>
                  )}
                </div>
                <button
                  className="text-sm text-blue-600 ml-2"
                  onClick={() => {
                    const nuevos = [...categoriasEditables];
                    nuevos[gIndex].editando = !nuevos[gIndex].editando;
                    setCategoriasEditables(nuevos);
                  }}
                >
                  <Pencil size={18} />
                </button>
              </div>
              {grupo.items.map((item) => {
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
                          onChange={() => toggleSeleccion(tab, item.id)}
                        />
                        <strong>{valores.titulo || item.titulo}</strong>
                      </div>
                      <span className="text-sm text-blue-600">{abierto ? '▲' : '▼'}</span>
                    </div>
                    {abierto && seleccionado && (
                      <div className="mt-4 space-y-2">
                        <label className="block font-bold text-sm">Tipo de Denuncia</label>
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
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div key={i}>
                            <label className="block text-sm">Ejemplo {i + 1}</label>
                            <input
                              className="border p-1 w-full"
                              maxLength={100}
                              value={valores.ejemplos?.[i] ?? item.ejemplos?.[i] ?? ''}
                              onChange={(e) => actualizarEjemplo(item.id, i, e.target.value)}
                            />
                          </div>
                        ))}
                        <label className="block text-sm font-bold">Pregunta adicional</label>
                        <input
                          className="border p-1 w-full"
                          value={valores.preguntaAdicional || ''}
                          onChange={(e) => actualizarCampo(item.id, 'preguntaAdicional', e.target.value)}
                        />
                        <label className="inline-flex items-center mt-2 text-sm">
                          <input
                            type="checkbox"
                            checked={valores.anonimo}
                            onChange={(e) => actualizarCampo(item.id, 'anonimo', e.target.checked)}
                            className="mr-2"
                          />
                          ¿Se puede denunciar de forma anónima?
                        </label>
                        <label className="block font-bold text-sm mt-2">Tipos de reportante</label>
                        <div className="flex flex-wrap gap-4">
                          {posiblesReportantes.map((r) => (
                            <label key={r} className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={valores.reportantes?.includes(r)}
                                onChange={(e) => {
                                  const actual = new Set(valores.reportantes || []);
                                  if (e.target.checked) actual.add(r);
                                  else actual.delete(r);
                                  actualizarReportantes(item.id, Array.from(actual));
                                }}
                                className="mr-2"
                              />
                              {r}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        : catalogos[tab]?.map((item) => {
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
                      onChange={() => toggleSeleccion(tab, item.id)}
                    />
                    <strong>{valores.titulo || item.titulo}</strong>
                  </div>
                  <span className="text-sm text-blue-600">{abierto ? '▲' : '▼'}</span>
                </div>
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
          })}
    </div>
  );
}

export default App;