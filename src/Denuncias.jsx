import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import catalogos from './catalogo_completo_integrado.json';

function Denuncias() {
  const [tiposReportante, setTiposReportante] = useState([]);
  const [denunciasBD, setDenunciasBD] = useState([]);
  const [categoriasEditables, setCategoriasEditables] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/reportantes')
      .then((res) => res.json())
      .then((data) => setTiposReportante(data.map((r) => r.etiqueta)))
      .catch(() => setTiposReportante([]));

    fetch('http://localhost:8000/denuncias')
      .then((res) => res.json())
      .then((data) => setDenunciasBD(data))
      .catch(() => setDenunciasBD([]));
  }, []);

  useEffect(() => {
    const categorias = catalogos.denuncias.map((grupo) => ({
      categoria: grupo.categoria,
      descripcion: grupo.descripcion,
      items: [],
    }));

    for (const denuncia of denunciasBD) {
      const grupoIndex = categorias.findIndex(c => c.categoria === denuncia.categoria);
      if (grupoIndex !== -1) {
        categorias[grupoIndex].items.push({
          ...denuncia,
          editando: false,
          ejemplos: denuncia.ejemplos || ['', '', '', '', ''],
          reportantes: denuncia.tipos_reportante || [],
          titulo: denuncia.titulo,
          titulo_original: denuncia.titulo_original || denuncia.titulo
        });
      }
    }

    setCategoriasEditables(categorias);
  }, [denunciasBD]);

  const agregarDenuncia = (grupoIndex, itemBase) => {
    const nueva = {
      cliente_id: 1,
      categoria: categoriasEditables[grupoIndex].categoria,
      titulo: itemBase.titulo,
      descripcion: itemBase.descripcion,
      ejemplos: itemBase.ejemplos || ['', '', '', '', ''],
      preguntaAdicional: '',
      anonimo: false,
      tipos_reportante: tiposReportante,
      visible_en_reporte: true,
      orden: categoriasEditables[grupoIndex].items.length,
      titulo_original: itemBase.titulo,
    };

    fetch('http://localhost:8000/denuncias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nueva),
    })
      .then(() => fetch('http://localhost:8000/denuncias'))
      .then((res) => res.json())
      .then((data) => setDenunciasBD(data));
  };

  const actualizarCampo = (grupoIndex, id, campo, valor) => {
    const nuevas = [...categoriasEditables];
    nuevas[grupoIndex].items = nuevas[grupoIndex].items.map((item) =>
      item.id === id ? { ...item, [campo]: valor } : item
    );
    setCategoriasEditables(nuevas);
  };

  const actualizarEjemplo = (grupoIndex, id, index, valor) => {
    const nuevas = [...categoriasEditables];
    nuevas[grupoIndex].items = nuevas[grupoIndex].items.map((item) => {
      if (item.id === id) {
        const nuevosEjemplos = [...(item.ejemplos || [])];
        nuevosEjemplos[index] = valor;
        return { ...item, ejemplos: nuevosEjemplos };
      }
      return item;
    });
    setCategoriasEditables(nuevas);
  };

  const guardarDenuncia = (grupoIndex, id) => {
    const item = categoriasEditables[grupoIndex].items.find(i => i.id === id);
    const payload = {
      ...item,
      tipos_reportante: item.reportantes,
    };

    fetch(`http://localhost:8000/denuncias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(() => fetch('http://localhost:8000/denuncias'))
      .then((res) => res.json())
      .then((data) => setDenunciasBD(data));
  };

  const editarDenuncia = (grupoIndex, id, cancelar = false) => {
    if (cancelar) {
      fetch('http://localhost:8000/denuncias')
        .then((res) => res.json())
        .then((data) => setDenunciasBD(data));
    } else {
      const nuevas = [...categoriasEditables];
      nuevas[grupoIndex].items = nuevas[grupoIndex].items.map((item) =>
        item.id === id ? { ...item, editando: true } : item
      );
      setCategoriasEditables(nuevas);
    }
  };

  const eliminarDenuncia = (grupoIndex, id) => {
    fetch(`http://localhost:8000/denuncias/${id}`, {
      method: 'DELETE',
    })
      .then(() => fetch('http://localhost:8000/denuncias'))
      .then((res) => res.json())
      .then((data) => setDenunciasBD(data));
  };

  const toggleReportante = (grupoIndex, id, tipo) => {
    const nuevas = [...categoriasEditables];
    nuevas[grupoIndex].items = nuevas[grupoIndex].items.map((item) => {
      if (item.id === id) {
        const actual = new Set(item.reportantes);
        if (actual.has(tipo)) actual.delete(tipo);
        else actual.add(tipo);
        return { ...item, reportantes: Array.from(actual) };
      }
      return item;
    });
    setCategoriasEditables(nuevas);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Catálogo de Denuncias</h1>
      <p className="text-sm italic text-gray-600 mb-6">
        Selecciona los tipos de denuncia que aplican y edítalos según tu lenguaje corporativo. Puedes agregar varios del mismo tipo.
      </p>
      {categoriasEditables.map((grupo, gIndex) => (
        <div key={gIndex} className="mb-10">
          <h2 className="text-xl font-bold text-blue-700 mb-1">{grupo.categoria}</h2>
          <p className="text-sm text-gray-700 mb-4">{grupo.descripcion}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {catalogos.denuncias[gIndex].items.map((item) => (
              <button
                key={item.id}
                className="bg-blue-100 hover:bg-blue-200 text-sm px-3 py-1 rounded"
                onClick={() => agregarDenuncia(gIndex, item)}
              >
                {item.titulo}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grupo.items.map((item) => (
              <div key={item.id} className="border p-4 rounded bg-white shadow">
                {item.editando ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-semibold">Tipo de Denuncia</label>
                      <input
                        className="border p-1 w-full"
                        value={item.titulo}
                        onChange={(e) => actualizarCampo(gIndex, item.id, 'titulo', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold">Descripción</label>
                      <textarea
                        className="border p-1 w-full"
                        value={item.descripcion}
                        onChange={(e) => actualizarCampo(gIndex, item.id, 'descripcion', e.target.value)}
                      />
                    </div>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i}>
                        <label className="block text-sm">Ejemplo {i + 1}</label>
                        <input
                          className="border p-1 w-full"
                          value={item.ejemplos?.[i] || ''}
                          onChange={(e) => actualizarEjemplo(gIndex, item.id, i, e.target.value)}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-semibold">Pregunta adicional</label>
                      <input
                        className="border p-1 w-full"
                        value={item.preguntaAdicional}
                        onChange={(e) => actualizarCampo(gIndex, item.id, 'preguntaAdicional', e.target.value)}
                      />
                    </div>
                    <div className="mt-2">
                      <label className="inline-flex items-center text-sm">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={item.anonimo}
                          onChange={(e) => actualizarCampo(gIndex, item.id, 'anonimo', e.target.checked)}
                        />
                        ¿Se puede denunciar de forma anónima?
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mt-2">Tipos de reportante</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {tiposReportante.map((r) => (
                          <label key={r} className="inline-flex items-center">
                            <input
                              type="checkbox"
                              className="mr-1"
                              checked={item.reportantes.includes(r)}
                              onChange={() => toggleReportante(gIndex, item.id, r)}
                            />
                            {r}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        className="bg-gray-300 text-sm px-3 py-1 rounded"
                        onClick={() => editarDenuncia(gIndex, item.id, true)}
                      >
                        Cancelar
                      </button>
                      <button
                        className="bg-blue-500 text-white text-sm px-4 py-1 rounded"
                        onClick={() => guardarDenuncia(gIndex, item.id)}
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
                          onClick={() => editarDenuncia(gIndex, item.id)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="text-red-600"
                          onClick={() => eliminarDenuncia(gIndex, item.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <ul className="text-sm mt-2 space-y-1">
                      {(item.ejemplos || []).map((ej, idx) => (
                        <li key={idx} className="text-gray-600">• {ej}</li>
                      ))}
                    </ul>
                    <p className="text-sm mt-2"><strong>Pregunta adicional:</strong> {item.preguntaAdicional}</p>
                    <p className="text-sm"><strong>Permite anonimato:</strong> {item.anonimo ? 'Sí' : 'No'}</p>
                    <p className="text-sm">
                      <strong>Reportantes:</strong> {Array.isArray(item.reportantes) ? item.reportantes.join(', ') : ''}
                    </p>
                     {(() => {
                          const original = catalogos.denuncias[gIndex].items.find(i => i.titulo === item.titulo_original);
                          if (original?.reportantesRecomendados?.length) {
                            return (
                              <p className="text-xs italic text-red-500 mt-1">
                                Sugeridos: {original.reportantesRecomendados.join(', ')}
                              </p>
                            );
                          }
                          return null;
                        })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Denuncias;