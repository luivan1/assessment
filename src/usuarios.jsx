import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { Pencil, Trash2 } from 'lucide-react';

export default function UsuariosDelSistema() {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevo, setNuevo] = useState(false);
  const [modalAbierta, setModalAbierta] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const [ubicaciones, setUbicaciones] = useState({ paises: [], estados: [], municipios: [] });

  const [usuario, setUsuario] = useState({
    nombre: '', apellidos: '', correo: '', contrasena: '', confirmarContrasena: '', telefono: '',
    genero: '', nacimiento: '', pais: '', estado: '', municipio: '', direccion: '', cp: '', foto: null
  });

  useEffect(() => {
    fetch('/ubicaciones.json')
      .then((res) => res.json())
      .then((data) => setUbicaciones({ paises: data, estados: [], municipios: [] }));
  }, []);

  const handlePaisChange = (pais) => {
    const seleccionado = ubicaciones.paises.find((p) => p.name === pais);
    setUsuario({ ...usuario, pais, estado: '', municipio: '' });
    setUbicaciones({
      ...ubicaciones,
      estados: seleccionado?.states || [],
      municipios: [],
    });
  };

  const handleEstadoChange = (estado) => {
    const seleccionado = ubicaciones.estados.find((e) => e.name === estado);
    setUsuario({ ...usuario, estado, municipio: '' });
    setUbicaciones({
      ...ubicaciones,
      municipios: seleccionado?.cities || [],
    });
  };

  const guardar = () => {
    const nuevoUsuario = { ...usuario, id: Date.now(), editando: false };
    setUsuarios([...usuarios, nuevoUsuario]);
    setUsuario({
      nombre: '', apellidos: '', correo: '', contrasena: '', confirmarContrasena: '', telefono: '',
      genero: '', nacimiento: '', pais: '', estado: '', municipio: '', direccion: '', cp: '', foto: null
    });
    setUbicaciones({ ...ubicaciones, estados: [], municipios: [] });
    setNuevo(false);
  };

  const cancelar = () => {
    setNuevo(false);
    setUsuario({
      nombre: '', apellidos: '', correo: '', contrasena: '', confirmarContrasena: '', telefono: '',
      genero: '', nacimiento: '', pais: '', estado: '', municipio: '', direccion: '', cp: '', foto: null
    });
    setUbicaciones({ ...ubicaciones, estados: [], municipios: [] });
  };

  const abrirModalPermisos = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalAbierta(true);
  };

  const cerrarModal = () => {
    setModalAbierta(false);
    setUsuarioSeleccionado(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Usuarios del sistema</h1>
      <Button onClick={() => setNuevo(true)} className="mb-4">Agregar usuario</Button>

      {nuevo && (
        <Card className="mb-6">
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {/* Campos de usuario */}
            <div><Label>Nombre</Label><Input value={usuario.nombre} onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })} /></div>
            <div><Label>Apellidos</Label><Input value={usuario.apellidos} onChange={(e) => setUsuario({ ...usuario, apellidos: e.target.value })} /></div>
            <div><Label>Correo electrónico</Label><Input value={usuario.correo} onChange={(e) => setUsuario({ ...usuario, correo: e.target.value })} /></div>
            <div><Label>Teléfono</Label><Input value={usuario.telefono} onChange={(e) => setUsuario({ ...usuario, telefono: e.target.value })} /></div>
            <div><Label>Contraseña</Label><Input type="password" value={usuario.contrasena} onChange={(e) => setUsuario({ ...usuario, contrasena: e.target.value })} /></div>
            <div><Label>Confirmar contraseña</Label><Input type="password" value={usuario.confirmarContrasena} onChange={(e) => setUsuario({ ...usuario, confirmarContrasena: e.target.value })} /></div>
            <div><Label>Género</Label>
              <Select value={usuario.genero} onValueChange={(val) => setUsuario({ ...usuario, genero: val })}>
                <SelectTrigger><SelectValue placeholder="Selecciona género" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Fecha de nacimiento</Label><Input type="date" value={usuario.nacimiento} onChange={(e) => setUsuario({ ...usuario, nacimiento: e.target.value })} /></div>
            <div><Label>País</Label>
              <Select value={usuario.pais} onValueChange={handlePaisChange}>
                <SelectTrigger><SelectValue placeholder="Selecciona país" /></SelectTrigger>
                <SelectContent>
                  {ubicaciones.paises.map((p) => (
                    <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Estado</Label>
              <Select value={usuario.estado} onValueChange={handleEstadoChange}>
                <SelectTrigger><SelectValue placeholder="Selecciona estado" /></SelectTrigger>
                <SelectContent>
                  {ubicaciones.estados.map((e) => (
                    <SelectItem key={e.code} value={e.name}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Municipio</Label>
              <Select value={usuario.municipio} onValueChange={(val) => setUsuario({ ...usuario, municipio: val })}>
                <SelectTrigger><SelectValue placeholder="Selecciona municipio" /></SelectTrigger>
                <SelectContent>
                  {ubicaciones.municipios.map((m, i) => (
                    <SelectItem key={i} value={typeof m === 'string' ? m : m.name}>{typeof m === 'string' ? m : m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Dirección</Label><Input value={usuario.direccion} onChange={(e) => setUsuario({ ...usuario, direccion: e.target.value })} /></div>
            <div><Label>Código Postal</Label><Input value={usuario.cp} onChange={(e) => setUsuario({ ...usuario, cp: e.target.value })} /></div>
            <div><Label>Foto</Label><Input type="file" accept="image/*" onChange={(e) => setUsuario({ ...usuario, foto: e.target.files?.[0] })} /></div>
            <div className="col-span-3 flex justify-end gap-4 pt-2">
              <Button variant="outline" onClick={cancelar}>Cancelar</Button>
              <Button onClick={guardar}>Guardar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {usuarios.map((u) => (
          <Card key={u.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">{u.nombre} {u.apellidos}</p>
                <p className="text-sm text-gray-600">{u.correo}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon"><Pencil size={16} /></Button>
                <Button variant="ghost" size="icon"><Trash2 size={16} /></Button>
              </div>
            </div>
            <p className="text-sm">Tel: {u.telefono}</p>
            <p className="text-sm">País: {u.pais}, Estado: {u.estado}, Municipio: {u.municipio}</p>
            <div className="flex justify-end mt-2">
              <Button variant="destructive" size="sm" onClick={() => abrirModalPermisos(u)}>
                Permisos
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {modalAbierta && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-4xl rounded shadow-lg p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={cerrarModal}
            >✖</button>

            <div className="min-h-[400px]">{/* Aquí irá contenido de permisos */}</div>

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="secondary" onClick={cerrarModal}>Cerrar</Button>
              <Button onClick={cerrarModal}>Guardar ✅</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}