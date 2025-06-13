import { useState } from 'react';
import { Pencil } from 'lucide-react';
import catalogos from './catalogo_completo_integrado.json';

function Denuncias() {
  const [selecciones, setSelecciones] = useState({});
  const [abiertos, setAbiertos] = useState({});
  const [categoriasEditables, setCategoriasEditables] = useState(
    catalogos.denuncias.map((grupo) => ({
      categoria: grupo.categoria,
      descripcion: grupo.descripcion,
      editando: false
    }))
  );

  const [denunciasClonadas, setDenunciasClonadas] = useState({});

  const posiblesReportantes = [
    'Empleado',
    'Cliente',
    'Proveedor',
    'Socios',
    'Exempleados',
    'Consumidor final',
    'Clientes estratégicos',
    'Público en general'
  ];

  const toggleSeleccion = (id) => {
    setSelecciones((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        seleccionada: !prev[id]?.seleccionada,
        ejemplos: prev[id]?.ejemplos || [],
        anonimo: prev[id]?.anonimo ?? true,
        reportantes: prev[id]?.reportantes ?? [...posiblesReportantes]
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

  const actualizarEjemplo = (id, index, valor) => {
    setSelecciones((prev) => {
      const nuevosEjemplos = [...(prev[id]?.ejemplos || ['', '', '', '', ''])];
      nuevosEjemplos[index] = valor;
      return {
        ...prev,
        [id]: { ...prev[id], ejemplos: nuevosEjemplos }
      };
    });
  };

  const actualizarReportantes = (id, valor) => {
    setSelecciones((prev) => ({
      ...prev,
      [id]: { ...prev[id], reportantes: valor }
    }));
  };

  const toggleColapsar = (id) => {
    setAbiertos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const agregarSimilar = (grupoIndex, item, indexOriginal) => {
    const nuevoId = `${item.id}_copia_${Date.now()}`;
    const clon = { ...item, id: nuevoId };
    setDenunciasClonadas((prev) => {
      const actuales = [...(prev[grupoIndex] || [])];
      const nuevas = [...actuales];
      nuevas.splice(indexOriginal + 1, 0, clon);
      return {
        ...prev,
        [grupoIndex]: nuevas
      };
    });
    setAbiertos((prev) => ({ ...prev, [nuevoId]: true }));
    setSelecciones((prev) => ({
      ...prev,
      [nuevoId]: {
        seleccionada: false,
        ejemplos: clon.ejemplos || [],
        anonimo: true,
        reportantes: [...(clon.reportantes || posiblesReportantes)]
      }
    }));
  };

  const eliminarClon = (grupoIndex, id) => {
    setDenunciasClonadas((prev) => ({
      ...prev,
      [grupoIndex]: (prev[grupoIndex] || []).filter((i) => i.id !== id)
    }));
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Catálogo de Denuncias</h1>
      <p className="text-sm italic text-gray-600 mb-6">
        De la siguiente lista elige los tipos de denuncia que deseas utilizar en tu sistema. Puedes editar todos los textos para personalizarlos con tu propio lenguaje corporativo...
      </p>
      {catalogos.denuncias.map((grupo, gIndex) => {
        const itemsBase = grupo.items;
        const itemsClonadas = denunciasClonadas[gIndex] || [];
        const todosLosItems = [...itemsBase];

        // Insertar clones en su posición correcta
        itemsClonadas.forEach((clon) => {
          const matchIndex = todosLosItems.findIndex((i) => clon.id.startsWith(i.id));
          todosLosItems.splice(matchIndex + 1, 0, clon);
        });

        return (
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

            {todosLosItems.map((item, i) => {
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
                  <p className="text-xs italic text-red-500 mt-1">
                    Reportantes aplicables: {(item.reportantesRecomendados || []).join(', ')}
                  </p>
                  <button
                    className="text-blue-600 text-sm mt-2 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      agregarSimilar(gIndex, item, i);
                    }}
                  >
                    + Agregar
                  </button>
                  {item.id.includes('_copia_') && (
                    <button
                      className="text-red-500 text-sm ml-4 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarClon(gIndex, item.id);
                      }}
                    >
                      Eliminar
                    </button>
                  )}
                  {abierto && seleccionado && (
                    <div className="mt-4 space-y-2">
                      <label className="block font-bold text-sm">Tipo de Denuncia</label>
                      <input
                        className="border p-1 w-full"
                        value={valores.titulo || item.titulo}
                        onChange={(e) => actualizarCampo(item.id, 'titulo', e.target.value)}
                      />
                      <label className="block font-bold text-sm">Descripción</label>
                      <textarea
                        className="border p-1 w-full"
                        value={valores.descripcion || item.descripcion}
                        onChange={(e) => actualizarCampo(item.id, 'descripcion', e.target.value)}
                      />
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i}>
                          <label className="block text-sm">Ejemplo {i + 1}</label>
                          <input
                            className="border p-1 w-full"
                            value={valores.ejemplos?.[i] ?? item.ejemplos?.[i] ?? ''}
                            onChange={(e) => actualizarEjemplo(item.id, i, e.target.value)}
                          />
                        </div>
                      ))}
                      <label className="block font-bold text-sm">Pregunta adicional</label>
                      <input
                        className="border p-1 w-full"
                        value={valores.preguntaAdicional || ''}
                        onChange={(e) => actualizarCampo(item.id, 'preguntaAdicional', e.target.value)}
                      />
                      <label className="inline-flex items-center mt-2 text-sm">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={valores.anonimo}
                          onChange={(e) => actualizarCampo(item.id, 'anonimo', e.target.checked)}
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
        );
      })}
    </div>
  );
}

export default Denuncias;