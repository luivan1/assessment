import { useEffect, useState } from 'react';
import ConfiguracionFiltros from './components/centrosdetrabajo/ConfiguracionFiltros';
import CargaCentros from './components/centrosdetrabajo/CargaCentros';

function CentrosDeTrabajo() {
  const [filtrosPersonalizados, setFiltrosPersonalizados] = useState([]);

  const recargarFiltrosPersonalizados = async () => {
    const organizacion_id = JSON.parse(localStorage.getItem('usuario'))?.organizacion_id;
    if (!organizacion_id) return;

    try {
      const res = await fetch(`http://localhost:8000/filtros?organizacion_id=${organizacion_id}`);
      if (res.ok) {
        const data = await res.json();
        setFiltrosPersonalizados(data);
      } else {
        console.error('No se pudieron cargar los filtros personalizados');
      }
    } catch (err) {
      console.error('Error al cargar filtros personalizados:', err);
    }
  };

  useEffect(() => {
    recargarFiltrosPersonalizados();
  }, []);

  return (
    <>
      <ConfiguracionFiltros onCambiosFiltros={recargarFiltrosPersonalizados} />
      <CargaCentros filtrosPersonalizados={filtrosPersonalizados} />
    </>
  );
}

export default CentrosDeTrabajo;