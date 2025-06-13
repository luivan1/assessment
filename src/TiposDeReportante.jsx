import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { X } from "lucide-react";

const opcionesDisponibles = [
  "1. Empleado, colaborador, Docente, sindicalizado",
  "2. Proveedor, Contratista, consultor externo, auditor",
  "3. Clientes estratégicos, comisionistas, distribuidores",
  "4. Socios o Accionistas",
  "5. Exempleado",
  "6. Público en general, vecino, comunidad",
  "7. Consumidor final, usuario, alumno"
];

const camposIdentidad = [
  "Nombre completo",
  "Teléfono",
  "Correo electrónico",
  "Número de empleado/proveedor",
  "Género",
  "Edad"
];

function TiposDeReportante() {
  const [seleccionados, setSeleccionados] = useState([]);

  const agregarElemento = (opcion) => {
    const nuevo = {
      id: `${opcion}-${Date.now()}`,
      texto: opcion,
      etiqueta: opcion,
      anonimo: true,
      campos: []
    };
    setSeleccionados((prev) => [...prev, nuevo]);
  };

  const actualizarEtiqueta = (id, valor) => {
    setSeleccionados((prev) =>
      prev.map((el) => (el.id === id ? { ...el, etiqueta: valor } : el))
    );
  };

  const actualizarAnonimo = (id) => {
    setSeleccionados((prev) =>
      prev.map((el) => (el.id === id ? { ...el, anonimo: !el.anonimo } : el))
    );
  };

  const actualizarCampoIdentidad = (id, campoKey, nuevoValor) => {
    setSeleccionados((prev) =>
      prev.map((el) => {
        const sinCampo = el.campos.filter((c) => typeof c !== "object" || c.key !== campoKey);
        if (nuevoValor === null) {
          return { ...el, campos: sinCampo };
        } else {
          return {
            ...el,
            campos: [...sinCampo, { key: campoKey, label: nuevoValor }]
          };
        }
      })
    );
  };

  const eliminarElemento = (id) => {
    setSeleccionados((prev) => prev.filter((el) => el.id !== id));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(seleccionados);
    const [reordenado] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordenado);
    setSeleccionados(items);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Tipos de Reportante</h2>

      <p className="text-gray-600 mb-6 italic">
        Seleccione los diferentes tipos de denunciantes que podrán reportar en su plataforma. Usted puede elegir más de una vez un
        elemento si así lo requiere. Por ejemplo, puede agregar tres veces "Empleado" y editar la etiqueta de cada uno (ej. Empleado de
        confianza, Empleado sindicalizado, Gerentes, etc.). Puede cambiar la etiqueta pero no la intención (por ejemplo, no puede poner
        un tipo de cliente si está editando un proveedor).
      </p>

      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {opcionesDisponibles.map((opcion, index) => (
            <button
              key={index}
              onClick={() => agregarElemento(opcion)}
              className="bg-blue-100 hover:bg-blue-200 text-sm px-3 py-2 rounded text-left"
            >
               {opcion}
            </button>
          ))}
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="reportantes">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {seleccionados.map((el, index) => (
                <Draggable key={el.id} draggableId={el.id} index={index}>
                  {(provided) => (
                    <div
                      className="border rounded p-4 bg-white shadow"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold">Etiqueta</label>
                          <input
                            className="border p-1 w-full"
                            value={el.etiqueta}
                            onChange={(e) => actualizarEtiqueta(el.id, e.target.value)}
                          />

                          <label className="inline-flex items-center mt-2 text-sm">
                            <input
                              type="checkbox"
                              checked={el.anonimo}
                              onChange={() => actualizarAnonimo(el.id)}
                              className="mr-2"
                            />
                            Puede denunciar de forma anónima
                          </label>

                          <div className="mt-4">
                            <p className="font-semibold text-sm mb-2">
                              Campos de identidad cuando el reportante elige dejar sus datos
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {camposIdentidad.map((campoBase) => {
                                const activo = el.campos.some((c) => typeof c === "object" && c.key === campoBase);
                                const valorCampo =
                                  el.campos.find((c) => typeof c === "object" && c.key === campoBase)?.label || campoBase;

                                return (
                                  <div key={campoBase} className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={activo}
                                      onChange={() => {
                                        actualizarCampoIdentidad(el.id, campoBase, activo ? null : valorCampo);
                                      }}
                                    />
                                    <input
                                      type="text"
                                      className="border p-1 text-sm flex-1"
                                      disabled={!activo}
                                      value={valorCampo}
                                      onChange={(e) => {
                                        actualizarCampoIdentidad(el.id, campoBase, e.target.value);
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => eliminarElemento(el.id)}
                          className="text-red-600 ml-4"
                          title="Eliminar"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default TiposDeReportante;