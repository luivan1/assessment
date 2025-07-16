import { useState } from 'react';
import DatosGenerales from './DatosGenerales';
import TiposDeReportante from './TiposDeReportante';
import Denuncias from './Denuncias';
import Preguntas from './Preguntas';
import Sugerencias from './Sugerencias';
import MediosDifusion from './MediosDeDifusion';
import SancionesPremiosMedidas from './SancionesPremiosMedidas';
import ConfiguracionFiltros from './components/centrosdetrabajo/ConfiguracionFiltros';
import CargaCentros from './components/centrosdetrabajo/CargaCentros';
import UsuariosDelSistema from './Usuarios';
import PanelControl from "./PanelControl"; // <-- renombrado

export default function MainApp({ usuario, onLogout }) {
  const [tab, setTab] = useState('datos');

  const renderContenido = () => {
    switch (tab) {
      case 'datos':
        return <DatosGenerales />;
      case 'reportantes':
        return <TiposDeReportante />;
      case 'centros':
        return (
          <>
            <ConfiguracionFiltros />
            <CargaCentros />
          </>
        );
      case 'denuncias':
        return <Denuncias />;
      case 'preguntas':
        return <Preguntas />;
      case 'sugerencias':
        return <Sugerencias />;
      case 'cierres':
        return <SancionesPremiosMedidas />;
      case 'difusion':
        return <MediosDifusion />;
      case 'usuarios':
        return <UsuariosDelSistema />;
      case 'panel':
        return <PanelControl />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Barra superior */}
      <div className="flex items-center gap-4 mb-4">
        <img src="/logo-ethics.png" alt="EthicsGlobal" className="h-10" />
        <h1 className="text-2xl font-bold flex-1">Configuración del Sistema Ético</h1>
        {/* SOLO admin ve el Panel de Control */}
        {usuario?.rol === "admin" && (
          <button
            onClick={() => setTab('panel')}
            className={tab === 'panel'
              ? 'bg-green-600 text-white px-3 py-1 rounded'
              : 'bg-gray-200 px-3 py-1 rounded'}
          >
            Panel de Control
          </button>
        )}
        {/* Logout SIEMPRE visible */}
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Menú de pestañas */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button onClick={() => setTab('datos')} className={tab === 'datos' ? 'bg-blue-600 text-white px-3 py-1 rounded' : 'bg-gray-200 px-3 py-1 rounded'}>
          Datos Generales
        </button>
        <button onClick={() => setTab('reportantes')} className={tab === 'reportantes' ? 'bg-blue-600 text-white px-3 py-1 rounded' : 'bg-gray-200 px-3 py-1 rounded'}>
          Tipos de Reportante
        </button>
        <button onClick={() => setTab('centros')} className={tab === 'centros' ? 'bg-blue-600 text-white px-3 py-1 rounded' : 'bg-gray-200 px-3 py-1 rounded'}>
          Centros de Trabajo
        </button>
        <button onClick={() => setTab('denuncias')} className={tab === 'denuncias' ? 'bg-blue-600 text-white px-3 py-1 rounded' : 'bg-gray-200 px-3 py-1 rounded'}>
          Denuncias
        </button>
        <button onClick={() => setTab('preguntas')} className={tab === 'preguntas' ? 'bg-blue-600 text-white px-3 py-1 rounded' : 'bg-gray-200 px-3 py-1 rounded'}>
          Preguntas
        </button>
        <button onClick={() => setTab('sugerencias')} className={tab === 'sugerencias' ? 'bg-blue-600 text-white px-3 py-1 rounded' : 'bg-gray-200 px-3 py-1 rounded'}>
          Sugerencias
        </button>
        <button onClick={() => setTab('cierres')} className={tab === 'cierres' ? 'bg-blue-600 text-white px-3 py-1 rounded' : 'bg-gray-200 px-3 py-1 rounded'}>
          Catálogos
        </button>
        <button onClick={() => setTab('difusion')} className={tab === 'difusion' ? 'bg-blue-600 text-white px-3 py-1 rounded' : 'bg-gray-200 px-3 py-1 rounded'}>
          Medios de Difusión
        </button>
        <button onClick={() => setTab('usuarios')} className={tab === 'usuarios' ? 'bg-blue-600 text-white px-3 py-1 rounded' : 'bg-gray-200 px-3 py-1 rounded'}>
          Usuarios del sistema
        </button>
      </div>

      {/* Contenido de la pestaña */}
      {renderContenido()}
    </div>
  );
}