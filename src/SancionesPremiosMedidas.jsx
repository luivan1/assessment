import { useState } from "react";

const tiposCierre = [
  "Cerrado Fundamentado",
  "Cerrado no fundamentado",
  "Improcedente"
];

const sanciones = [
  "Reprimenda Verbal",
  "Reprimenda escrita",
  "Plan de mejora o coaching",
  "Suspensión temporal",
  "Amonestación económica (bonos, ascensos o beneficios)",
  "Despido",
  "Renuncia",
  "Inicio de acción legal o judicial",
  "Reasignación de área, ubicación o turno",
  "Inhabilitación o recesión de contrato (clientes, proveedores, etc.)"
];

const premios = [
  "Bono o incentivo monetario",
  "Reconocimiento en especie (regalos, artículos, etc.)",
  "Beneficios o prestaciones adicionales",
  "Descuentos especiales o preferenciales",
  "Felicitación escrita / carta de reconocimiento",
  "Publicación en medios internos (intranet, boletines, etc.)",
  "Reconocimiento público en evento o reunión",
  "Felicitación verbal",
  "Ascenso o promoción",
  "Asignación de nuevos retos o proyectos clave",
  "Acceso a programas especiales (ej. capacitaciones, mentoring, viajes)"
];

const medidas = [
  "Modificación o actualización de procesos internos",
  "Adquisición de equipo, herramientas o materiales",
  "Reparaciones o mantenimiento correctivo",
  "Contratación de nuevo personal",
  "Reasignación o rotación de personal",
  "Capacitación o sensibilización del equipo",
  "Despido o separación de terceros (proveedores, contratistas, etc.)",
  "Contratación o búsqueda de nuevos proveedores",
  "Indemnización o compensación a la parte afectada",
  "Revisión o actualización de contratos con terceros",
  "Notificación o denuncia a autoridades externas (si aplica)",
  "Implementación de controles adicionales",
  "Campañas de comunicación o refuerzo cultural",
  "Auditorías internas o revisiones periódicas"
];

const categorias = [
  { titulo: "Tipos de Cierre", items: tiposCierre },
  { titulo: "Sanciones", items: sanciones },
  { titulo: "Premios o Retribuciones", items: premios },
  { titulo: "Medidas Correctivas", items: medidas }
];

function SancionesPremiosMedidas() {
  const [seleccionados, setSeleccionados] = useState([]);

  const agregarElemento = (categoria, item) => {
    const nuevo = {
      id: `${item}-${Date.now()}`,
      texto: item,
      etiqueta: item,
      categoria
    };
    setSeleccionados((prev) => [...prev, nuevo]);
  };

  const actualizarEtiqueta = (id, valor) => {
    setSeleccionados((prev) =>
      prev.map((el) => (el.id === id ? { ...el, etiqueta: valor } : el))
    );
  };

  const eliminarElemento = (id) => {
    setSeleccionados((prev) => prev.filter((el) => el.id !== id));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Tipos de cierre, Sanciones, Premios y Medidas Correctivas</h2>

      <p className="text-gray-600 mb-6 italic">
        Selecciona las acciones que implementarás como parte de la gestión de tu Línea Ética. Puedes agregar un mismo elemento más de una vez y editar su etiqueta, siempre que conserve su categoría original. Esto nos ayuda a analizar el impacto de cada acción y fomentar la mejora continua.
        <br /><br />
        ⚠️ Importante: No cambies el tipo de acción (por ejemplo, no conviertas una sanción en premio), ya que esto altera el seguimiento y la evaluación de resultados.
      </p>



      {categorias.map((cat, index) => (
        <div key={index} className="mb-8">
          <h3 className="text-xl font-semibold text-blue-700 mb-2">{cat.titulo}</h3>

          <div className="flex flex-wrap gap-2 mb-4">
            {cat.items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => agregarElemento(cat.titulo, item)}
                className="bg-blue-100 hover:bg-blue-200 text-sm px-3 py-1 rounded"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {seleccionados
              .filter((el) => el.categoria === cat.titulo)
              .map((el) => (
                <div key={el.id} className="border rounded p-4 bg-white shadow">
                  <label className="block text-sm font-semibold mb-1">Etiqueta</label>
                  <input
                    className="border p-1 w-full mb-2"
                    value={el.etiqueta}
                    onChange={(e) => actualizarEtiqueta(el.id, e.target.value)}
                  />
                  <div className="text-right">
                    <button
                      onClick={() => eliminarElemento(el.id)}
                      className="text-sm text-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SancionesPremiosMedidas;