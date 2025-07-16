export async function getTiposReportante() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const organizacion_id = usuario.organizacion_id;

  if (!organizacion_id) {
    console.error("❌ organizacion_id no encontrado en localStorage");
    return [];
  }

  try {
    const url = `http://localhost:8000/reportantes?organizacion_id=${organizacion_id}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const texto = await res.text();

    if (!res.ok) {
      throw new Error(`❌ Error HTTP: ${res.status}`);
    }

    const datos = JSON.parse(texto);

    if (!Array.isArray(datos)) {
      throw new Error("❌ La respuesta no es un arreglo");
    }

    return datos.map((r) => ({
      id: r.id,
      etiqueta: r.etiqueta,
      tipo_base: r.tipo_base,
    }));
  } catch (err) {
    console.error("❌ Error en getTiposReportante:", err);
    return [];
  }
}