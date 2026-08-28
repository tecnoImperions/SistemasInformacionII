import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'
import {
  Calendar,
  Stethoscope,
  Brain,
  Baby,
  Activity,
  Search,
  Clock,
  X,
  Building2,
  MapPin,
  QrCode,
  Bell,
  Printer,
  Volume2,
  AlertTriangle,
  Bus,
  ScanLine,
  Check,
  Map,
  Eye,
  EyeOff,
  BarChart3,
  Download,
  FileText,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

// Coloca aquí tu API Key de Resend (ej: re_123456789...) para envío real de correos a Gmail
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || "";

// Configuración de EmailJS para envío libre de CORS a cualquier destinatario
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_wvg76zs";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_mepd51j";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "TY1fOnOYxJ-IkOedP";



// --- DEFINICIONES DE TIPOS ---
interface CentroSalud {
  id_centro: string;
  nombre: string;
  direccion: string;
  nivel_atencion: number;
  telefono: string;
  como_llegar: string;
  horario_fichas: string;
  distrito: string;
  imagen_url: string;
  latitud?: number;
  longitud?: number;
  especialidades?: string[];
}

interface Especialidad {
  id_especialidad: string;
  nombre: string;
  descripcion: string;
  iconName: string;
}

interface Usuario {
  id_usuario: string;
  ci: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  rol: 'paciente' | 'encargado' | 'admin';
  matricula_profesional?: string;
  id_especialidad?: string;
  nivel_acceso?: string;
}

interface Horario {
  id_horario: string;
  id_centro: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
}

interface Turno {
  id_turno: string;
  id_paciente: string;
  nombre_paciente: string;
  ci_paciente: string;
  telefono_paciente: string;
  id_personal_salud: string;
  nombre_personal_salud: string;
  especialidad_personal_salud: string;
  id_centro: string;
  nombre_centro: string;
  id_horario: string;
  fecha: string;
  hora: string;
  estado: 'Pendiente' | 'En Atención' | 'Atendido' | 'Cancelado' | 'Ausente';
  fecha_solicitud: string;
}


interface NotificacionPush {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'email' | 'push';
  fecha: string;
}

// --- CATALOGO DE HOSPITALES SANTA CRUZ (2DO Y 3ER NIVEL) ---
const centrosSantaCruz: CentroSalud[] = [
  {
    id_centro: 'c-1',
    nombre: 'Hospital Municipal Plan 3000',
    direccion: 'Barrio Piraicito (Diagonal al Mercado Los Pocitos)',
    nivel_atencion: 2,
    telefono: '362-1100',
    como_llegar: 'Micros: 38, 47, 68, 86, 121 (Integrado con Cruzero)',
    horario_fichas: '06:00 AM - 12:00 PM',
    distrito: 'Distrito 8 (Plan Tres Mil)',
    imagen_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=400',
    latitud: -17.82276,
    longitud: -63.12574,
    especialidades: ['e-1', 'e-2', 'e-4']
  },
  {
    id_centro: 'c-2',
    nombre: 'Hospital Municipal Pampa de la Isla',
    direccion: 'Avenida Montecristo, Barrio Bolinter',
    nivel_atencion: 2,
    telefono: '346-2022',
    como_llegar: 'Micros: 16, 43, 45, 87 (Integrado con Cruzero)',
    horario_fichas: '06:30 AM - 12:30 PM',
    distrito: 'Distrito 6 (Pampa de la Isla)',
    imagen_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400',
    latitud: -17.76118,
    longitud: -63.13289,
    especialidades: ['e-1', 'e-2']
  },
  {
    id_centro: 'c-3',
    nombre: 'Hospital Municipal Villa 1ro de Mayo',
    direccion: 'Sobre el 7mo Anillo, entre Cumatí y Av. Tres Pasos al Frente',
    nivel_atencion: 2,
    telefono: '348-1122',
    como_llegar: 'Micros: 9, 13, 34, 103 (Integrado con Cruzero)',
    horario_fichas: '06:00 AM - 01:00 PM',
    distrito: 'Distrito 7 (Villa Primero de Mayo)',
    imagen_url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=400',
    latitud: -17.78912,
    longitud: -63.13689,
    especialidades: ['e-1']
  },
  {
    id_centro: 'c-4',
    nombre: 'Hospital Municipal Francés',
    direccion: 'Avenida Santos Dumont (6to Anillo, Barrio Paititi)',
    nivel_atencion: 2,
    telefono: '356-9988',
    como_llegar: 'Micros: 39, 44, 76, 110 (Integrado con Cruzero)',
    horario_fichas: '06:00 AM - 12:00 PM',
    distrito: 'Distrito 9 (Zona Sur)',
    imagen_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400',
    latitud: -17.82672,
    longitud: -63.17983,
    especialidades: ['e-1', 'e-2', 'e-4']
  },
  {
    id_centro: 'c-5',
    nombre: 'Hospital Municipal Bajío del Oriente',
    direccion: 'Calle Eslovaquia, UV-118, Barrio Urbanización Santa Cruz',
    nivel_atencion: 2,
    telefono: '358-4455',
    como_llegar: 'Micros: 22, 54, 82, 119 (Integrado con Cruzero)',
    horario_fichas: '06:00 AM - 12:00 PM',
    distrito: 'Distrito 10 (Zona Oeste)',
    imagen_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400',
    latitud: -17.80112,
    longitud: -63.22012,
    especialidades: ['e-1']
  },
  {
    id_centro: 'c-6',
    nombre: 'Hospital San Juan de Dios',
    direccion: 'Calle Cuéllar N° 45, Zona Central',
    nivel_atencion: 3,
    telefono: '333-0222',
    como_llegar: 'Micros: 10, 11, 27, 28, 42, 60 (Integrado con Cruzero)',
    horario_fichas: '05:30 AM - 11:30 AM',
    distrito: 'Distrito 11 (Centro)',
    imagen_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=400',
    latitud: -17.78878,
    longitud: -63.18578,
    especialidades: ['e-1', 'e-3', 'e-4']
  },
  {
    id_centro: 'c-7',
    nombre: 'Hospital de Niños Dr. Mario Ortíz Suárez',
    direccion: 'Calle España esq. Rafael Peña, Zona Central',
    nivel_atencion: 3,
    telefono: '336-2252',
    como_llegar: 'Micros: 12, 17, 18, 51, 64 (Integrado con Cruzero)',
    horario_fichas: '06:00 AM - 12:00 PM',
    distrito: 'Distrito 11 (Centro)',
    imagen_url: 'https://images.unsplash.com/photo-1502740479796-62dd97864002?auto=format&fit=crop&q=80&w=400',
    latitud: -17.78189,
    longitud: -63.18212,
    especialidades: ['e-2']
  },
  {
    id_centro: 'c-8',
    nombre: 'Hospital Universitario Japonés',
    direccion: 'Av. Lucas Saucedo, Zona Pampa de la Isla',
    nivel_atencion: 3,
    telefono: '346-2002',
    como_llegar: 'Micros: 45, 75, 87, 102 (Integrado con Cruzero)',
    horario_fichas: '06:00 AM - 01:00 PM',
    distrito: 'Distrito 6 (Pampa de la Isla)',
    imagen_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400',
    latitud: -17.76912,
    longitud: -63.14989,
    especialidades: ['e-1', 'e-3', 'e-4']
  }
];

const especialidadesSantaCruz: Especialidad[] = [
  { id_especialidad: 'e-1', nombre: 'Medicina General', descripcion: 'Consulta general y triaje inicial', iconName: 'Stethoscope' },
  { id_especialidad: 'e-2', nombre: 'Pediatría', descripcion: 'Atención especializada para niños', iconName: 'Baby' },
  { id_especialidad: 'e-3', nombre: 'Neurología', descripcion: 'Enfermedades cerebrales y de nervios', iconName: 'Brain' },
  { id_especialidad: 'e-4', nombre: 'Cardiología', descripcion: 'Control preventivo cardiovascular', iconName: 'Activity' }
];

const obtenerConsultorio = (nombreEspecialidad: string) => {
  if (nombreEspecialidad.toLowerCase().includes('general')) return 'Consultorio 101 (Planta Baja)';
  if (nombreEspecialidad.toLowerCase().includes('pediat')) return 'Consultorio 104 (Planta Baja)';
  if (nombreEspecialidad.toLowerCase().includes('neuro')) return 'Consultorio 203 (1er Piso)';
  if (nombreEspecialidad.toLowerCase().includes('cardio')) return 'Consultorio 205 (1er Piso)';
  return 'Consultorio de Turno (Triaje)';
};

const calcularEsperaCola = (turnoActual: Turno, todosLosTurnos: Turno[]) => {
  // Filtra todos los turnos para la misma fecha, hospital y especialidad
  const turnosMismoDia = todosLosTurnos.filter(t => 
    t.fecha === turnoActual.fecha && 
    t.id_centro === turnoActual.id_centro &&
    t.especialidad_personal_salud === turnoActual.especialidad_personal_salud
  );
  
  // Contar cuántos turnos en estado 'Pendiente' tienen una fecha_solicitud anterior a la de nuestro turno
  const pendientesAntes = turnosMismoDia.filter(t => 
    t.estado === 'Pendiente' && 
    new Date(t.fecha_solicitud).getTime() < new Date(turnoActual.fecha_solicitud).getTime()
  ).length;

  // El número de ficha actual que está siendo atendido (el último con estado 'Atendido')
  const atendidosHoy = turnosMismoDia.filter(t => t.estado === 'Atendido');
  let fichaAtendiendose = 'Ninguna';
  if (atendidosHoy.length > 0) {
    const ultimoAtendido = atendidosHoy.reduce((prev, curr) => 
      new Date(prev.fecha_solicitud).getTime() > new Date(curr.fecha_solicitud).getTime() ? prev : curr
    );
    fichaAtendiendose = `#${ultimoAtendido.id_turno.substring(2, 8).toUpperCase()}`;
  } else if (turnosMismoDia.filter(t => t.estado === 'Pendiente').length > 0) {
    fichaAtendiendose = 'Iniciando';
  }

  return {
    personasDelante: pendientesAntes,
    fichaEnConsulta: fichaAtendiendose,
    posicionFila: pendientesAntes + 1
  };
};

const fetchConProxies = async (targetUrl: string, options: RequestInit): Promise<Response> => {
  const isPost = options.method === 'POST';
  const isResend = targetUrl.includes('resend.com');

  if (isPost && isResend) {
    const localHosts = [
      "http://localhost/medic/send_email.php",
      "http://medic.test/send_email.php"
    ];

    let originalBody: any = {};
    try {
      originalBody = JSON.parse(options.body as string);
    } catch {
      // Ignorar si no es JSON parsesable
    }

    const localPayload = { 
      type: 'resend', 
      apiKey: (options.headers as any)['Authorization']?.replace('Bearer ', ''),
      ...originalBody 
    };

    for (const localUrl of localHosts) {
      try {
        console.log(`Intentando petición local a través de Laragon: ${localUrl}`);
        const res = await fetch(localUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(localPayload)
        });
        if (res.ok) {
          return res;
        }
      } catch (err) {
        console.warn(`No se pudo conectar al PHP local en ${localUrl}:`, err);
      }
    }
  }

  // Fallback a proxy directo si Laragon no está activo o falló
  try {
      console.log(`Intentando petición a: ${targetUrl}`);
      const res = await fetch(targetUrl, options);
      if (res.ok) {
        return res;
      }
      throw new Error(`HTTP error ${res.status}`);
  } catch (err) {
      console.warn(`Petición falló para ${targetUrl}:`, err);
      throw err;
  }
};




function App() {
  // --- ACCESIBILIDAD MÁXIMA POR DEFECTO (VISTA ENORME / PANTALLA GRANDE) ---
  const [isSuperSize, setIsSuperSize] = useState<boolean>(true);
  const [audioGuia, setAudioGuia] = useState<boolean>(false);

  // --- PERSISTENCIA Y RECUERDO DE SESIÓN ---
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // --- VISIBILIDAD DE CONTRASEÑA ---
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // --- POPUPS Y NOTIFICACIONES ---
  const [showCruzeroMap, setShowCruzeroMap] = useState<boolean>(false);
  const [showGoogleMapModal, setShowGoogleMapModal] = useState<boolean>(false);
  const [activeRouteInfo, setActiveRouteInfo] = useState<string>('');
  const [notificaciones, setNotificaciones] = useState<NotificacionPush[]>([
    { id: '1', titulo: 'Sistema Activo', mensaje: 'TurnoYa está listo para regular las colas en los hospitales.', tipo: 'push', fecha: 'Hoy' }
  ]);
  const [showNotifPanel, setShowNotifPanel] = useState<boolean>(false);

  // --- FILTROS DE EXPORTACIÓN ADMIN ---
  const [adminFiltroCentroId, setAdminFiltroCentroId] = useState<string>('todos');
  const [adminFiltroFechaDesde, setAdminFiltroFechaDesde] = useState<string>('');
  const [adminFiltroFechaHasta, setAdminFiltroFechaHasta] = useState<string>('');

  // --- ALERTAS Y CONFIRMACIONES ESTILO SWAL ---
  const [swalAlert, setSwalAlert] = useState<{ show: boolean; titulo: string; mensaje: string; tipo: 'success' | 'error' | 'info' } | null>(null);
  const [swalConfirm, setSwalConfirm] = useState<{ show: boolean; titulo: string; mensaje: string; onConfirm: () => void } | null>(null);

  const triggerAlert = (titulo: string, mensaje: string, tipo: 'success' | 'error' | 'info' = 'info') => {
    setSwalAlert({ show: true, titulo, mensaje, tipo });
  };

  const triggerConfirm = (titulo: string, mensaje: string, onConfirm: () => void) => {
    setSwalConfirm({ show: true, titulo, mensaje, onConfirm });
  };

  // --- SEGURIDAD Y SESIÓN ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

  // Formulario login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Formulario registro (Sin selección de roles, por defecto Paciente)
  const [regCI, setRegCI] = useState('');
  const [regComplemento, setRegComplemento] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // --- DATOS PRINCIPALES ---
  const [centros, setCentros] = useState<CentroSalud[]>(centrosSantaCruz);
  const [especialidades] = useState<Especialidad[]>(especialidadesSantaCruz);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);

  // Filtrado de turnos para reportes del Administrador (Hospital y rango de fechas)
  const turnosFiltradosAdmin = turnos.filter(t => {
    if (adminFiltroCentroId !== 'todos' && t.id_centro !== adminFiltroCentroId) return false;
    if (adminFiltroFechaDesde && t.fecha < adminFiltroFechaDesde) return false;
    if (adminFiltroFechaHasta && t.fecha > adminFiltroFechaHasta) return false;
    return true;
  });

  // --- FILTROS Y PAGINACIÓN DE VOLÚMENES MASIVOS ---
  const [patientFilterTab, setPatientFilterTab] = useState<'activas' | 'historial'>('activas');
  const [patientPage, setPatientPage] = useState<number>(1);
  const [expandedTurnoId, setExpandedTurnoId] = useState<string>('');
  const [encargadoFilterTab, setEncargadoFilterTab] = useState<'pendientes' | 'procesados' | 'cancelados'>('pendientes');
  const [encargadoPage, setEncargadoPage] = useState<number>(1);
  const itemsPerPage = 5;

  // --- ENRUTADOR POR HASH ---
  const [currentRole, setCurrentRole] = useState<'paciente' | 'encargado' | 'admin'>('paciente');

  // --- WIZARD PACIENTE ---
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedNivel, setSelectedNivel] = useState<number | null>(null);
  const [selectedCentroId, setSelectedCentroId] = useState<string>('');
  const [selectedEspecialidadId, setSelectedEspecialidadId] = useState<string>('');
  const [selectedHorarioObj, setSelectedHorarioObj] = useState<Horario | null>(null);
  const [motivoConsulta, setMotivoConsulta] = useState('');

  // --- VENTANILLA (ENCARGADA) ---
  const [filtroBusquedaCargada, setFiltroBusquedaCargada] = useState<string>('');
  const [mostrarEscaneoSimulado, setMostrarEscaneoSimulado] = useState<boolean>(false);
  const [ciEscaneada, setCiEscaneada] = useState<string>('');

  // --- ADMINISTRADOR (ADMIN) - HORARIOS ---
  const [nuevoHorarioCentro, setNuevoHorarioCentro] = useState<string>('c-1');
  const [nuevoHorarioFecha, setNuevoHorarioFecha] = useState<string>('2026-08-22');
  const [nuevoHorarioInicio, setNuevoHorarioInicio] = useState<string>('06:00');
  const [nuevoHorarioFin, setNuevoHorarioFin] = useState<string>('06:30');

  // --- ADMINISTRADOR (ADMIN) - HOSPITALES ---
  const [nuevoCentroNombre, setNuevoCentroNombre] = useState('');
  const [nuevoCentroDir, setNuevoCentroDir] = useState('');
  const [nuevoCentroNivel, setNuevoCentroNivel] = useState<number>(2);
  const [nuevoCentroTelf, setNuevoCentroTelf] = useState('');
  const [nuevoCentroImagenUrl, setNuevoCentroImagenUrl] = useState('');
  const [nuevoCentroLat, setNuevoCentroLat] = useState('50');
  const [nuevoCentroLong, setNuevoCentroLong] = useState('50');
  const [nuevoCentroEspecialidades, setNuevoCentroEspecialidades] = useState<string[]>(['e-1']);

  // --- REGISTRAR ATENCIÓN MÉDICA (ENCARGADO/PERSONAL DE SALUD) ---
  const [selectedTurnoAtencion, setSelectedTurnoAtencion] = useState<Turno | null>(null);
  const [atencionDiagnostico, setAtencionDiagnostico] = useState<string>('');
  const [atencionObservaciones, setAtencionObservaciones] = useState<string>('');
  const [atencionResultado, setAtencionResultado] = useState<string>('');

  // Sincronización hash url
  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash;
      if (hash === '#admin') setCurrentRole('admin');
      else if (hash === '#encargado') setCurrentRole('encargado');
      else {
        setCurrentRole('paciente');
        if (hash !== '#paciente') window.location.hash = '#paciente';
      }
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  // Audioguía de asistencia para personas mayores / adultos mayores
  useEffect(() => {
    if (!audioGuia) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      return;
    }
    
    let texto = '';
    if (wizardStep === 1) {
      texto = "Paso 1. Seleccione el nivel de atención médica. Presione Segundo Nivel para hospitales de distrito, o Tercer Nivel para hospitales especializados de tercer nivel.";
    } else if (wizardStep === 2) {
      texto = "Paso 2. Seleccione el hospital de la lista del panel izquierdo o en el mapa interactivo. Una vez seleccionado, presione el botón azul que dice Reservar Turno Aquí.";
    } else if (wizardStep === 3) {
      texto = "Paso 3. Seleccione la especialidad médica que necesita en los botones de abajo.";
    } else if (wizardStep === 4) {
      texto = "Paso 4. Elija el día y la hora de consulta que mejor le convenga en la lista de horarios disponibles.";
    } else if (wizardStep === 5) {
      texto = "Paso 5. Escriba sus síntomas de forma opcional. Luego marque las casillas para confirmar que llevará su carnet de identidad original, fotocopia, y referencia si corresponde. Por último, presione Confirmar y Sacar Ficha.";
    }

    if (texto && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(texto);
      msg.lang = 'es-ES';
      msg.rate = 0.95; // Slightly slower speed for older adults
      window.speechSynthesis.speak(msg);
    }
  }, [wizardStep, audioGuia]);

  // Cargar turnos reales (Fichas) de la base de datos de Supabase
  const fetchTurnosReales = async () => {
    if (!currentUser) return;

    if (currentUser.id_usuario.startsWith('u-demo')) {
      // Cargar turnos demo locales
      const mockTurnos: Turno[] = [
        {
          id_turno: 't-demo-1',
          id_paciente: 'u-demo-pac',
          nombre_paciente: 'Paciente de Prueba',
          ci_paciente: '7766554',
          telefono_paciente: '76543210',
          id_personal_salud: 'u-demo-enc',
          nombre_personal_salud: 'Dra. Suzanne Gutiérrez',
          especialidad_personal_salud: 'Medicina General',
          id_centro: 'c-1',
          nombre_centro: 'Hospital Municipal Plan 3000',
          id_horario: 'h-demo-1',
          fecha: new Date().toISOString().split('T')[0],
          hora: '08:30 AM',
          estado: 'Pendiente',
          fecha_solicitud: new Date().toISOString()
        },
        {
          id_turno: 't-demo-2',
          id_paciente: 'u-demo-pac',
          nombre_paciente: 'Paciente de Prueba',
          ci_paciente: '7766554',
          telefono_paciente: '76543210',
          id_personal_salud: 'u-demo-enc',
          nombre_personal_salud: 'Dra. Suzanne Gutiérrez',
          especialidad_personal_salud: 'Pediatría',
          id_centro: 'c-2',
          nombre_centro: 'Hospital Municipal Pampa de la Isla',
          id_horario: 'h-demo-2',
          fecha: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          hora: '10:00 AM',
          estado: 'Atendido',
          fecha_solicitud: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      if (currentUser.rol === 'paciente') {
        setTurnos(mockTurnos.filter(t => t.id_paciente === currentUser.id_usuario));
      } else {
        setTurnos(mockTurnos);
      }
      return;
    }

    if (currentUser.rol === 'paciente') {
      const { data: dbTurnos } = await supabase
        .from('turnos')
        .select('*')
        .eq('id_paciente', currentUser.id_usuario)
        .order('fecha_solicitud', { ascending: false });

      if (dbTurnos) {
        const mapped = dbTurnos.map(t => {
          const centro = centros.find(c => c.id_centro === t.id_centro);
          return {
            id_turno: t.id_turno,
            id_paciente: t.id_paciente,
            nombre_paciente: `${currentUser.nombre} ${currentUser.apellido || ''}`,
            ci_paciente: currentUser.ci,
            telefono_paciente: currentUser.telefono,
            id_personal_salud: t.id_personal_salud || '',
            nombre_personal_salud: 'Médico de Turno',
            especialidad_personal_salud: 'Medicina General',
            id_centro: t.id_centro,
            nombre_centro: centro?.nombre || 'Hospital General',
            id_horario: t.id_horario || '',
            fecha: t.fecha,
            hora: `${t.hora.substring(0, 5)} AM`,
            estado: t.estado as any,
            fecha_solicitud: t.fecha_solicitud
          };
        });
        setTurnos(mapped);
      }
    } else {
      const { data: dbTurnos } = await supabase
        .from('turnos')
        .select('*')
        .order('fecha_solicitud', { ascending: false });

      if (dbTurnos) {
        const { data: dbUsers } = await supabase.from('usuarios').select('*');
        const mapped = dbTurnos.map(t => {
          const centro = centros.find(c => c.id_centro === t.id_centro);
          const pac = dbUsers?.find(u => u.id_usuario === t.id_paciente);
          return {
            id_turno: t.id_turno,
            id_paciente: t.id_paciente,
            nombre_paciente: pac ? `${pac.nombre} ${pac.apellido || ''}` : 'Paciente de Prueba',
            ci_paciente: pac?.ci || 'Sin C.I.',
            telefono_paciente: pac?.telefono || '',
            id_personal_salud: t.id_personal_salud || '',
            nombre_personal_salud: 'Dra. Suzanne Gutiérrez',
            especialidad_personal_salud: 'Medicina General',
            id_centro: t.id_centro,
            nombre_centro: centro?.nombre || 'Hospital General',
            id_horario: t.id_horario || '',
            fecha: t.fecha,
            hora: `${t.hora.substring(0, 5)} AM`,
            estado: t.estado as any,
            fecha_solicitud: t.fecha_solicitud
          };
        });
        setTurnos(mapped);
      }
    }
  };

  useEffect(() => {
    fetchTurnosReales();
  }, [currentUser, centros]);

  // Cargar horarios reales de Supabase cuando se selecciona un hospital
  useEffect(() => {
    const fetchHorarios = async () => {
      if (!selectedCentroId || selectedCentroId.startsWith('c-')) return;
      const { data: dbHorarios } = await supabase
        .from('horarios')
        .select('*')
        .eq('id_centro', selectedCentroId);
      if (dbHorarios) {
        setHorarios(dbHorarios.map(h => ({
          id_horario: h.id_horario,
          id_centro: h.id_centro,
          fecha: h.fecha,
          hora_inicio: h.hora_inicio.substring(0, 5),
          hora_fin: h.hora_fin.substring(0, 5),
          disponible: h.disponible
        })));
      }
    };
    fetchHorarios();
  }, [selectedCentroId]);

  // Cargar sesión y escuchar cambios en Supabase Auth
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        // Consultar los datos reales del usuario en la tabla 'usuarios'
        const { data: userRecord } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id_usuario', session.user.id)
          .single();

        if (userRecord) {
          const loadedUser: Usuario = {
            id_usuario: userRecord.id_usuario,
            ci: userRecord.ci || '',
            nombre: userRecord.nombre || '',
            apellido: userRecord.apellido || '',
            correo: userRecord.correo || session.user.email || '',
            telefono: userRecord.telefono || '',
            rol: userRecord.rol || 'paciente',
            matricula_profesional: userRecord.matricula_profesional,
            id_especialidad: userRecord.id_especialidad
          };
          setCurrentUser(loadedUser);
          setIsLoggedIn(true);
          window.location.hash = `#${loadedUser.rol}`;
          localStorage.setItem('user_session', JSON.stringify(loadedUser));
        } else {
          // Si no está registrado en la base de datos pública, cargar de la sesión
          const tempUser: Usuario = {
            id_usuario: session.user.id,
            ci: session.user.user_metadata?.ci || '',
            nombre: session.user.user_metadata?.nombre || 'Paciente Nuevo',
            apellido: session.user.user_metadata?.apellido || '',
            correo: session.user.email || '',
            telefono: session.user.user_metadata?.telefono || '',
            rol: 'paciente'
          };
          setCurrentUser(tempUser);
          setIsLoggedIn(true);
          window.location.hash = '#paciente';
          localStorage.setItem('user_session', JSON.stringify(tempUser));
        }
      } else {
        // Si no hay sesión activa en Supabase, asegurar que esté deslogueado y sin caché
        setIsLoggedIn(false);
        setCurrentUser(null);
        localStorage.removeItem('user_session');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user) {
        const { data: userRecord } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id_usuario', session.user.id)
          .single();

        const resolvedUser: Usuario = userRecord ? {
          id_usuario: userRecord.id_usuario,
          ci: userRecord.ci || '',
          nombre: userRecord.nombre || '',
          apellido: userRecord.apellido || '',
          correo: userRecord.correo || session.user.email || '',
          telefono: userRecord.telefono || '',
          rol: userRecord.rol || 'paciente',
          matricula_profesional: userRecord.matricula_profesional,
          id_especialidad: userRecord.id_especialidad
        } : {
          id_usuario: session.user.id,
          ci: session.user.user_metadata?.ci || '',
          nombre: session.user.user_metadata?.nombre || 'Paciente Nuevo',
          apellido: session.user.user_metadata?.apellido || '',
          correo: session.user.email || '',
          telefono: session.user.user_metadata?.telefono || '',
          rol: 'paciente'
        };

        setCurrentUser(resolvedUser);
        setIsLoggedIn(true);
        window.location.hash = `#${resolvedUser.rol}`;
        if (rememberMe) {
          localStorage.setItem('user_session', JSON.stringify(resolvedUser));
          localStorage.setItem('remember_me', 'true');
        }
      } else {
        // Si se cierra sesión o expira, limpiar estados de inmediato
        setIsLoggedIn(false);
        setCurrentUser(null);
        localStorage.removeItem('user_session');
      }
    });

    const fetchDB = async () => {
      const { data: dbCentros } = await supabase.from('centros_salud').select('*');
      if (dbCentros && dbCentros.length > 0) {
        const merged = dbCentros.map(dbc => {
          const local = centrosSantaCruz.find(lc => lc.nombre.toLowerCase().includes(dbc.nombre.toLowerCase()));
          return {
            id_centro: dbc.id_centro,
            nombre: dbc.nombre,
            direccion: dbc.direccion || local?.direccion || 'Dirección de Santa Cruz',
            nivel_atencion: dbc.nivel_atencion,
            telefono: dbc.telefono || local?.telefono || '3330000',
            como_llegar: local?.como_llegar || 'Líneas de micro generales',
            horario_fichas: local?.horario_fichas || '06:00 AM - 12:00 PM',
            distrito: local?.distrito || 'Santa Cruz de la Sierra',
            imagen_url: dbc.imagen_url || local?.imagen_url || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=400',
            latitud: dbc.latitud !== undefined && dbc.latitud !== null ? dbc.latitud : (local?.latitud || 50),
            longitud: dbc.longitud !== undefined && dbc.longitud !== null ? dbc.longitud : (local?.longitud || 50),
            especialidades: dbc.especialidades || local?.especialidades || ['e-1']
          };
        });
        setCentros(merged);
      }
    };
    fetchDB();

    return () => subscription.unsubscribe();
  }, [rememberMe]);

  // --- CONTROLADOR DEL ESCÁNER DE CÁMARA REAL EN VENTANILLA ---
  useEffect(() => {
    let html5QrCode: any = null;

    if (mostrarEscaneoSimulado) {
      const timer = setTimeout(() => {
        const qrContainer = document.getElementById('qr-reader');
        if (!qrContainer) return;

        try {
          if (typeof (window as any).Html5Qrcode !== "undefined") {
            html5QrCode = new (window as any).Html5Qrcode("qr-reader");
            
            const qrCodeSuccessCallback = (decodedText: string) => {
              html5QrCode.stop().then(() => {
                handleSimularEscaneo(decodedText);
                setMostrarEscaneoSimulado(false);
                triggerAlert("Escaneo Exitoso", `Ficha identificada y cargada correctamente para la C.I.: ${decodedText}`, "success");
              }).catch((err: any) => {
                console.error("Error al apagar la cámara:", err);
              });
            };

            const config = { fps: 15, qrbox: { width: 220, height: 220 } };

            html5QrCode.start(
              { facingMode: "environment" },
              config,
              qrCodeSuccessCallback,
              () => {}
            ).catch((err: any) => {
              console.error("Error al iniciar lector de cámara:", err);
            });
          }
        } catch (e) {
          console.error("Error al instanciar html5-qrcode:", e);
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5QrCode) {
          try {
            if (html5QrCode.isScanning) {
              html5QrCode.stop().catch((e: any) => console.warn(e));
            }
          } catch (e) {
            console.warn("Limpia de escáner cancelada:", e);
          }
        }
      };
    }
  }, [mostrarEscaneoSimulado]);

  // --- ACCESOS RÁPIDOS DE PRUEBA (DESDE DEMO BAR) ---
  const handleBypass = (role: 'paciente' | 'encargado' | 'admin') => {
    const demoUsers: Record<string, Usuario> = {
      paciente: { id_usuario: 'u-demo-pac', ci: '7766554', nombre: 'Paciente de Prueba', apellido: 'Revollo', correo: 'paciente@upds.com', telefono: '76543210', rol: 'paciente' },
      encargado: { id_usuario: 'u-demo-enc', ci: '5678901', nombre: 'Encargada de Turno', apellido: 'Gutiérrez', correo: 'suzanne@upds.com', telefono: '78011223', rol: 'encargado', matricula_profesional: 'MP-98442' },
      admin: { id_usuario: 'u-demo-adm', ci: '1111111', nombre: 'Administrador de Turno', apellido: 'Evaluador', correo: 'admin@upds.com', telefono: '71122334', rol: 'admin' }
    };
    const selected = demoUsers[role];
    setCurrentUser(selected);
    setIsLoggedIn(true);

    if (rememberMe) {
      localStorage.setItem('user_session', JSON.stringify(selected));
      localStorage.setItem('remember_me', 'true');
    }

    window.location.hash = `#${role}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) {
      triggerAlert('Error de Inicio', `Error al iniciar sesión: ${error.message}`, 'error');
    } else {
      triggerAlert('¡Bienvenido!', 'Sesión iniciada con éxito en TurnoYa.', 'success');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCI = regComplemento ? `${regCI}-${regComplemento.toUpperCase()}` : regCI;
    const { error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: { data: { ci: finalCI, nombre: regNombre, apellido: regApellido, rol: 'paciente' } }
    });
    if (error) {
      triggerAlert('Error de Registro', `Error al registrarse: ${error.message}`, 'error');
    } else {
      triggerAlert('Registro Exitoso', '¡Cuenta de paciente creada exitosamente en Supabase!', 'success');
      setRegCI('');
      setRegComplemento('');
      setRegNombre('');
      setRegApellido('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user_session');
    setIsLoggedIn(false);
    setCurrentUser(null);
    window.location.hash = '#paciente';
  };

  // --- LLAMADO DE VOZ ---
  const llamarPacienteVoz = (nombre: string) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(`Paciente ${nombre}, favor presentarse en ventanilla de atención.`);
      msg.lang = 'es-ES';
      window.speechSynthesis.speak(msg);
    } else {
      triggerAlert('Llamando Paciente', `Llamando al paciente: ${nombre}`, 'info');
    }
  };

  // --- IMPRESIÓN ---
  const imprimirFicha = (turno: Turno) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Ficha Médica #${turno.id_turno.substring(0, 6)}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; text-align: center; color: #334155; }
            .ticket { border: 3px dashed #475569; padding: 30px; display: inline-block; border-radius: 24px; max-width: 380px; background: #f8fafc; }
            h2 { color: #2563eb; margin: 0 0 10px 0; font-size: 24px; font-weight: 900; }
            .code { font-size: 32px; font-weight: 900; margin: 20px 0; color: #1e293b; background: #e2e8f0; padding: 12px; border-radius: 12px; letter-spacing: 2px; }
            .details { text-align: left; font-size: 15px; line-height: 1.6; }
            .details p { margin: 8px 0; }
            .footer { font-size: 11px; color: #64748b; border-top: 1px solid #cbd5e1; margin-top: 20px; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <h2>TurnoYa</h2>
            <p style="font-size:13px; font-weight:extrabold; color: #475569; margin: 0; letter-spacing:1px;">FICHA CONFIRMADA</p>
            <div class="code">#${turno.id_turno.substring(2, 8).toUpperCase()}</div>
            
            <!-- Código QR Real Generado con la C.I. del Paciente -->
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${turno.ci_paciente}" 
              alt="Código QR de Ficha" 
              style="margin: 15px auto; display: block; width: 120px; height: 120px; border: 1px solid #cbd5e1; padding: 4px; background: white; border-radius: 8px;" 
            />

            <div class="details">
              <p><strong>Paciente:</strong> ${turno.nombre_paciente}</p>
              <p><strong>C.I. del Paciente:</strong> ${turno.ci_paciente}</p>
              <p><strong>Hospital:</strong> ${turno.nombre_centro}</p>
              <p><strong>Especialidad:</strong> ${turno.especialidad_personal_salud}</p>
              <p><strong>Consultorio:</strong> ${obtenerConsultorio(turno.especialidad_personal_salud)}</p>
              <p><strong>Fecha y Hora:</strong> ${turno.fecha} - ${turno.hora}</p>
            </div>
            
            <div style="margin-top: 15px; border-top: 1px dashed #cbd5e1; padding-top: 15px; text-align: left; font-size: 11px; line-height: 1.4; color: #475569;">
              <p style="margin: 3px 0; font-weight: bold; color: #1e293b;">Requisitos para su atención:</p>
              <p style="margin: 2px 0;">[ ] Cédula de Identidad (Original Vigente)</p>
              <p style="margin: 2px 0;">[ ] Fotocopia legible de C.I.</p>
              ${turno.nombre_centro.toLowerCase().includes('san juan de dios') || turno.nombre_centro.toLowerCase().includes('niño') || turno.nombre_centro.toLowerCase().includes('japon')
                ? '<p style="margin: 2px 0; color: #b91c1c; font-weight: bold;">[ ] Formulario de Referencia D7 (Físico)</p>'
                : ''
              }
            </div>

            <div class="footer">
              <p>Evite hacer colas temprano. Preséntese 15 minutos antes con su C.I.</p>
              <p>TurnoYa - Santa Cruz de la Sierra</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // --- SOLICITAR TURNO (INSERT REAL EN SUPABASE) ---
  const registrarFicha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHorarioObj || !currentUser) return;

    const isMock = currentUser.id_usuario.startsWith('u-demo') || selectedCentroId.startsWith('c-');
    let idCita = 't-' + Date.now();

    if (!isMock) {
      const isMockHorario = selectedHorarioObj.id_horario.startsWith('h-auto');
      let idHorarioReal = selectedHorarioObj.id_horario;

      // Si es un horario autogenerado (h-auto), lo registramos primero en la tabla 'horarios' como no disponible (ocupado)
      if (isMockHorario) {
        const { data: nuevoHorario, error: errorHorario } = await supabase
          .from('horarios')
          .insert([{
            id_centro: selectedCentroId,
            fecha: selectedHorarioObj.fecha,
            hora_inicio: selectedHorarioObj.hora_inicio,
            hora_fin: selectedHorarioObj.hora_inicio === '08:00' ? '08:30' : 
                      selectedHorarioObj.hora_inicio === '07:30' ? '08:00' :
                      selectedHorarioObj.hora_inicio === '07:00' ? '07:30' :
                      selectedHorarioObj.hora_inicio === '06:30' ? '07:00' : '06:30',
            disponible: false
          }])
          .select()
          .single();

        if (errorHorario) {
          triggerAlert('Error al Reservar', `Error al crear bloque de horario: ${errorHorario.message}`, 'error');
          return;
        }

        if (nuevoHorario) {
          idHorarioReal = nuevoHorario.id_horario;
        }
      }

      // 1. Insertar turno en Supabase
      const { data, error: insertError } = await supabase.from('turnos').insert([{
        id_paciente: currentUser.id_usuario,
        id_centro: selectedCentroId,
        id_horario: idHorarioReal,
        fecha: selectedHorarioObj.fecha,
        hora: selectedHorarioObj.hora_inicio,
        estado: 'Pendiente'
      }]).select();

      if (insertError) {
        triggerAlert('Error al Reservar', `Error: ${insertError.message}`, 'error');
        return;
      if (data && data[0]) {
        idCita = data[0].id_turno;
      }

      // 2. Marcar horario como no disponible en la base de datos (solo si era un horario pre-creado en BD)
      if (!isMockHorario) {
        await supabase.from('horarios').update({ disponible: false }).eq('id_horario', selectedHorarioObj.id_horario);
      }
    } else {
      // Registrar localmente para demo
      const nuevoTurnoLocal: Turno = {
        id_turno: idCita,
        id_paciente: currentUser.id_usuario,
        nombre_paciente: `${currentUser.nombre} ${currentUser.apellido || ''}`,
        ci_paciente: currentUser.ci,
        telefono_paciente: currentUser.telefono || '',
        id_personal_salud: '',
        nombre_personal_salud: 'Dra. Suzanne Gutiérrez',
        especialidad_personal_salud: 'Medicina General',
        id_centro: selectedCentroId,
        nombre_centro: centros.find(c => c.id_centro === selectedCentroId)?.nombre || 'Hospital Seleccionado',
        id_horario: selectedHorarioObj.id_horario,
        fecha: selectedHorarioObj.fecha,
        hora: `${selectedHorarioObj.hora_inicio} AM`,
        estado: 'Pendiente',
        fecha_solicitud: new Date().toISOString()
      };
      setTurnos([nuevoTurnoLocal, ...turnos]);

      // Simular cambio local de disponibilidad de horario
      if (!selectedHorarioObj.id_horario.startsWith('h-auto')) {
        setHorarios(horarios.map(h => h.id_horario === selectedHorarioObj.id_horario ? { ...h, disponible: false } : h));
      }
    }

    // 3. Recargar notificaciones locales y turnos
    const nuevaNotif: NotificacionPush = {
      id: 'n-' + Date.now(),
      titulo: '📧 Correo SMTP Enviado',
      mensaje: `Confirmación de Ficha #${idCita.substring(2, 8).toUpperCase()} enviada exitosamente al Gmail: ${currentUser.correo} registrado en Supabase.`,
      tipo: 'email',
      fecha: 'Hace un momento'
    };
    setNotificaciones([nuevaNotif, ...notificaciones]);

    // Enviar correo SMTP real usando SMTPJS o la API de Resend
    const centroObj = centros.find(c => c.id_centro === selectedCentroId);
    const espObj = especialidadesSantaCruz.find(e => e.id_especialidad === selectedEspecialidadId);
    const mailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
        <h2 style="color: #2563eb; margin-top: 0; font-size: 22px; font-weight: 800; border-bottom: 2px solid #eff6ff; padding-bottom: 10px;">TurnoYa - Confirmación</h2>
        <p>Estimado(a) <strong>${currentUser.nombre}</strong>,</p>
        <p>Su ficha médica ha sido reservada con éxito en la base de datos de nuestro sistema.</p>
        
        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Código de Cita:</strong> #${idCita.substring(2, 8).toUpperCase()}</p>
          <p style="margin: 5px 0;"><strong>Hospital / Centro:</strong> ${centroObj ? centroObj.nombre : 'Hospital Seleccionado'}</p>
          <p style="margin: 5px 0;"><strong>Especialidad:</strong> ${espObj ? espObj.nombre : 'Medicina General'}</p>
          <p style="margin: 5px 0;"><strong>Consultorio:</strong> ${obtenerConsultorio(espObj ? espObj.nombre : '')}</p>
          <p style="margin: 5px 0;"><strong>Fecha y Hora:</strong> ${selectedHorarioObj.fecha} a las ${selectedHorarioObj.hora_inicio}</p>
        </div>

        <div style="margin: 20px 0; background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 12px; font-size: 13px; color: #1e3a8a;">
          <strong style="display: block; margin-bottom: 5px;">Documentos obligatorios para presentarse:</strong>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
            <li>Cédula de Identidad original vigente.</li>
            <li>Fotocopia legible de la Cédula de Identidad.</li>
            ${(centroObj?.nivel_atencion === 3) 
              ? '<li style="font-weight: bold; color: #b91c1c;">Formulario de Referencia D7 (Obligatorio para Tercer Nivel)</li>' 
              : ''}
          </ul>
        </div>
        
        <p style="font-size: 11px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
          <strong>Importante:</strong> No madrugue. Al contar con su ficha registrada, su cupo está garantizado. Preséntese en el hospital exactamente 15 minutos antes de su cita.
        </p>
      </div>
    `;

    if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
      // Enviar correo a través de EmailJS (Permite enviar a CUALQUIER destinatario gratis sin dominio propio y sin CORS)
      console.log("Intentando enviar correo de confirmación vía EmailJS...");
      fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: currentUser.correo,
            subject: `Ficha Médica Confirmada #${idCita.substring(2, 8).toUpperCase()} - TurnoYa`,
            message_html: mailHtml
          }
        })
      })
      .then(async (res) => {
        if (res.ok) {
          console.log("EmailJS enviado con éxito!");
        } else {
          const text = await res.text();
          console.error("Fallo en el servicio de EmailJS:", text);
        }
      })
      .catch((err) => {
        console.error("Error de conexión con EmailJS:", err);
      });
    } else if (RESEND_API_KEY && RESEND_API_KEY !== "re_tu_api_key_aqui") {
      // Enviar correo a través de la función RPC de Supabase (Cero CORS, seguro y estable en local y GitHub Pages)
      supabase.rpc('enviar_email_resend', {
        p_to: currentUser.correo,
        p_subject: `Ficha Médica Confirmada #${idCita.substring(2, 8).toUpperCase()} - TurnoYa`,
        p_html: mailHtml
      })
      .then(({ data, error }) => {
        console.log("Resend Supabase RPC response:", data, error);
        if (error) {
          console.log("RPC enviar_email_resend no está creado, usando fallback de proxy público...", error);
          
          // Fallback a fetchConProxies si la función RPC no está creada en la base de datos
          fetchConProxies('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'onboarding@resend.dev',
              to: [currentUser.correo],
              subject: `Ficha Médica Confirmada #${idCita.substring(2, 8).toUpperCase()} - TurnoYa`,
              html: mailHtml
            })
          })
          .then(async (res) => {
            const resData = await res.json();
            console.log("Resend API fallback response:", resData);
            if (!res.ok) {
              triggerAlert(
                'Detalle de Correo',
                `Resend rechazó el envío: ${resData.message || 'Error de Autenticación/Dominio'}. Verifique que el correo del paciente sea el mismo con el que se registró en Resend.`,
                'info'
              );
            }
          })
          .catch(err => console.error("Error en fallback de Resend:", err));
        }
      });
    }

    if (!isMock) {
      // Recargar horarios y turnos de Supabase
      fetchTurnosReales();
      const { data: dbHorarios } = await supabase.from('horarios').select('*');
      if (dbHorarios) {
        setHorarios(dbHorarios.map(h => ({
          id_horario: h.id_horario,
          id_centro: h.id_centro,
          fecha: h.fecha,
          hora_inicio: h.hora_inicio.substring(0, 5),
          hora_fin: h.hora_fin.substring(0, 5),
          disponible: h.disponible
        })));
      }
    }

    // Resetear Wizard
    setWizardStep(1);
    setSelectedNivel(null);
    setSelectedCentroId('');
    setSelectedEspecialidadId('');
    setSelectedHorarioObj(null);
    setMotivoConsulta('');

    triggerAlert('Ficha Reservada', 'Ficha reservada con éxito. Correo SMTP de confirmación enviado.', 'success');
  };


  // --- REGISTRAR HORARIO DE CITA (INSERT REAL EN SUPABASE) ---
  const handleCrearHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoHorarioCentro) return;

    const isMock = currentUser?.id_usuario.startsWith('u-demo') || nuevoHorarioCentro.startsWith('c-');

    if (!isMock) {
      const { error } = await supabase.from('horarios').insert([{
        id_centro: nuevoHorarioCentro,
        fecha: nuevoHorarioFecha,
        hora_inicio: nuevoHorarioInicio,
        hora_fin: nuevoHorarioFin,
        disponible: true
      }]);

      if (error) {
        triggerAlert('Error', `Error al registrar horario: ${error.message}`, 'error');
      } else {
        triggerAlert('Horario Registrado', 'Horario de atención registrado con éxito en la base de datos de Supabase.', 'success');
        // Recargar horarios
        const { data: dbHorarios } = await supabase.from('horarios').select('*');
        if (dbHorarios) {
          setHorarios(dbHorarios.map(h => ({
            id_horario: h.id_horario,
            id_centro: h.id_centro,
            fecha: h.fecha,
            hora_inicio: h.hora_inicio.substring(0, 5),
            hora_fin: h.hora_fin.substring(0, 5),
            disponible: h.disponible
          })));
        }
      }
    } else {
      // Registrar localmente para demo
      const nuevoHorarioLocal: Horario = {
        id_horario: 'h-' + Date.now(),
        id_centro: nuevoHorarioCentro,
        fecha: nuevoHorarioFecha,
        hora_inicio: nuevoHorarioInicio,
        hora_fin: nuevoHorarioFin,
        disponible: true
      };
      setHorarios([...horarios, nuevoHorarioLocal]);
      triggerAlert('Horario Registrado', 'Horario de atención registrado con éxito (Modo Demo).', 'success');
    }
  };

  // --- CANCELAR TURNO (UPDATE REAL EN SUPABASE) ---
  const handleCancelarTurno = async (turno: Turno) => {
    triggerConfirm(
      '¿Cancelar Ficha Médica?',
      'Esta acción liberará el bloque horario en la base de datos para que otro paciente pueda reservarlo.',
      async () => {
        const isMock = turno.id_turno.startsWith('t-demo') || turno.id_turno.startsWith('t-');

        if (!isMock) {
          const { error } = await supabase
            .from('turnos')
            .update({ estado: 'Cancelado' })
            .eq('id_turno', turno.id_turno);

          if (error) {
            triggerAlert('Error', `Error al cancelar turno: ${error.message}`, 'error');
            return;
          }

          // Liberar horario
          if (turno.id_horario && !turno.id_horario.startsWith('h-auto')) {
            await supabase
              .from('horarios')
              .update({ disponible: true })
              .eq('id_horario', turno.id_horario);
          }

          triggerAlert('Ficha Cancelada', 'La ficha médica ha sido cancelada con éxito.', 'success');
          fetchTurnosReales();
          
          // Recargar horarios
          const { data: dbHorarios } = await supabase.from('horarios').select('*');
          if (dbHorarios) {
            setHorarios(dbHorarios.map(h => ({
              id_horario: h.id_horario,
              id_centro: h.id_centro,
              fecha: h.fecha,
              hora_inicio: h.hora_inicio.substring(0, 5),
              hora_fin: h.hora_fin.substring(0, 5),
              disponible: h.disponible
            })));
          }
        } else {
          // Cancelación local en modo demo
          setTurnos(turnos.map(t => t.id_turno === turno.id_turno ? { ...t, estado: 'Cancelado' } : t));
          if (turno.id_horario && !turno.id_horario.startsWith('h-auto')) {
            setHorarios(horarios.map(h => h.id_horario === turno.id_horario ? { ...h, disponible: true } : h));
          }
          triggerAlert('Ficha Cancelada', 'La ficha médica ha sido cancelada con éxito (Modo Demo).', 'success');
        }
      }
    );
  };

  // --- REGISTRAR ATENCIÓN CLÍNICA Y FINALIZAR (INSERT REAL EN SUPABASE) ---
  const handleRegistrarAtencion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTurnoAtencion) return;

    const isMock = selectedTurnoAtencion.id_turno.startsWith('t-demo') || selectedTurnoAtencion.id_turno.startsWith('t-');

    if (!isMock) {
      // 1. Guardar registro en atenciones
      const { error: errorAtencion } = await supabase.from('atenciones').insert([{
        id_turno: selectedTurnoAtencion.id_turno,
        diagnostico: atencionDiagnostico,
        observaciones: atencionObservaciones,
        resultado: atencionResultado
      }]);

      if (errorAtencion) {
        triggerAlert('Error', `Error al registrar atención: ${errorAtencion.message}`, 'error');
        return;
      }

      // 2. Marcar el turno como Atendido
      const { error: errorTurno } = await supabase
        .from('turnos')
        .update({ estado: 'Atendido' })
        .eq('id_turno', selectedTurnoAtencion.id_turno);

      if (errorTurno) {
        triggerAlert('Error', `Error al actualizar estado: ${errorTurno.message}`, 'error');
        return;
      }

      triggerAlert('Atención Registrada', '¡Consulta y atención clínica registrada con éxito en Supabase!', 'success');
      fetchTurnosReales();
    } else {
      // Registrar localmente para demo
      setTurnos(turnos.map(t => t.id_turno === selectedTurnoAtencion.id_turno ? { ...t, estado: 'Atendido' } : t));
      triggerAlert('Atención Registrada', '¡Consulta y atención clínica registrada con éxito (Modo Demo)!', 'success');
    }
    
    // Limpiar estados
    setSelectedTurnoAtencion(null);
    setAtencionDiagnostico('');
    setAtencionObservaciones('');
    setAtencionResultado('');
  };

  // --- REGISTRAR CENTRO DE SALUD (INSERT REAL EN SUPABASE) ---
  const handleCrearCentro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCentroNombre.trim()) return;

    const isMock = currentUser?.id_usuario.startsWith('u-demo') || false;

    if (!isMock) {
      const { error } = await supabase.from('centros_salud').insert([{
        nombre: nuevoCentroNombre,
        direccion: nuevoCentroDir,
        nivel_atencion: nuevoCentroNivel,
        telefono: nuevoCentroTelf,
        imagen_url: nuevoCentroImagenUrl || null,
        latitud: parseFloat(nuevoCentroLat) || 50,
        longitud: parseFloat(nuevoCentroLong) || 50,
        especialidades: nuevoCentroEspecialidades
      }]);

      if (error) {
        if (error.message.includes('does not exist') || error.code === '42703') {
          triggerAlert(
            'Alerta de Base de Datos',
            `Debe ejecutar primero el script SQL de migración en Supabase para agregar las nuevas columnas (imagen_url, latitud, longitud, especialidades). Detalle: ${error.message}`,
            'error'
          );
        } else {
          triggerAlert('Error', `Error al registrar hospital: ${error.message}`, 'error');
        }
      } else {
        triggerAlert('Hospital Registrado', 'Hospital registrado exitosamente en la base de datos de Supabase.', 'success');
        setNuevoCentroNombre('');
        setNuevoCentroDir('');
        setNuevoCentroTelf('');
        setNuevoCentroImagenUrl('');
        setNuevoCentroLat('50');
        setNuevoCentroLong('50');
        setNuevoCentroEspecialidades(['e-1']);

        // Recargar centros
        const { data: dbCentros } = await supabase.from('centros_salud').select('*');
        if (dbCentros) {
          const merged = dbCentros.map(dbc => {
            const local = centrosSantaCruz.find(lc => lc.nombre.toLowerCase().includes(dbc.nombre.toLowerCase()));
            return {
              id_centro: dbc.id_centro,
              nombre: dbc.nombre,
              direccion: dbc.direccion || local?.direccion || 'Dirección de Santa Cruz',
              nivel_atencion: dbc.nivel_atencion,
              telefono: dbc.telefono || local?.telefono || '3330000',
              como_llegar: local?.como_llegar || 'Líneas de micro generales',
              horario_fichas: local?.horario_fichas || '06:00 AM - 12:00 PM',
              distrito: local?.distrito || 'Santa Cruz de la Sierra',
              imagen_url: dbc.imagen_url || local?.imagen_url || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=400',
              latitud: dbc.latitud !== undefined && dbc.latitud !== null ? dbc.latitud : (local?.latitud || 50),
              longitud: dbc.longitud !== undefined && dbc.longitud !== null ? dbc.longitud : (local?.longitud || 50),
              especialidades: dbc.especialidades || local?.especialidades || ['e-1']
            };
          });
          setCentros(merged);
        }
      }
    } else {
      // Registrar localmente para demo
      const nuevoCentroLocal: CentroSalud = {
        id_centro: 'c-' + Date.now(),
        nombre: nuevoCentroNombre,
        direccion: nuevoCentroDir,
        nivel_atencion: nuevoCentroNivel,
        telefono: nuevoCentroTelf,
        como_llegar: 'Líneas de micro locales',
        horario_fichas: '06:00 AM - 12:00 PM',
        distrito: 'Distrito local',
        imagen_url: nuevoCentroImagenUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=400',
        latitud: parseFloat(nuevoCentroLat) || -17.78189,
        longitud: parseFloat(nuevoCentroLong) || -63.18212,
        especialidades: nuevoCentroEspecialidades
      };
      setCentros([...centros, nuevoCentroLocal]);
      triggerAlert('Hospital Registrado', 'Hospital registrado exitosamente (Modo Demo).', 'success');
      setNuevoCentroNombre('');
      setNuevoCentroDir('');
      setNuevoCentroTelf('');
      setNuevoCentroImagenUrl('');
      setNuevoCentroLat('50');
      setNuevoCentroLong('50');
      setNuevoCentroEspecialidades(['e-1']);
    }
  };

  const handleSimularEscaneo = (ciInput: string) => {
    setFiltroBusquedaCargada(ciInput);
    setMostrarEscaneoSimulado(false);
    setCiEscaneada('');
  };

  // Filtros
  const centrosFiltrados = centros.filter(c => c.nivel_atencion === selectedNivel);
  
  const obtenerHorarios = () => {
    const hoyStr = new Date().toISOString().split('T')[0];
    const dbHorariosCentro = horarios.filter(h => h.id_centro === selectedCentroId);

    // Definir los 5 horarios fallback por defecto
    const fallbackSlots = [
      { hora_inicio: '06:00', hora_fin: '06:30' },
      { hora_inicio: '06:30', hora_fin: '07:00' },
      { hora_inicio: '07:00', hora_fin: '07:30' },
      { hora_inicio: '07:30', hora_fin: '08:00' },
      { hora_inicio: '08:00', hora_fin: '08:30' }
    ];

    // Verificar si hay algún horario en la base de datos que sea "personalizado"
    // (es decir, creado por un administrador, que no coincide con las horas de fallback o que está explícitamente disponible)
    const tieneHorariosPersonalizados = dbHorariosCentro.some(h => {
      const coincideConFallback = fallbackSlots.some(f => h.hora_inicio.startsWith(f.hora_inicio));
      return h.disponible || !coincideConFallback;
    });

    if (tieneHorariosPersonalizados) {
      // Si hay personalizados, mostramos únicamente los disponibles de la base de datos
      return dbHorariosCentro.filter(h => h.disponible);
    }

    // Si no hay personalizados (solo hay registros de fallback ocupados, o la BD está vacía),
    // mostramos los fallback que no estén ocupados en la base de datos
    const listadoAuto = fallbackSlots.map((slot, index) => {
      // Buscar si este slot específico ya fue reservado en la base de datos
      const ocupadoEnBD = dbHorariosCentro.some(h => 
        h.fecha === hoyStr && 
        h.hora_inicio.startsWith(slot.hora_inicio) && 
        !h.disponible
      );

      return {
        id_horario: `h-auto-${index + 1}-${selectedCentroId}`,
        id_centro: selectedCentroId,
        fecha: hoyStr,
        hora_inicio: slot.hora_inicio,
        hora_fin: slot.hora_fin,
        disponible: !ocupadoEnBD
      };
    });

    // Retornamos solo los que no están ocupados
    return listadoAuto.filter(h => h.disponible);
  };

  const horariosDisponibles = obtenerHorarios();
  const centroSeleccionadoInfo = centros.find(c => c.id_centro === selectedCentroId);

  const isAuthorized = !isLoggedIn || !currentUser || currentUser.rol === currentRole;

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col font-sans ${isSuperSize ? 'text-2xl' : 'text-base'}`}>
      
      {/* HEADER DE LA APLICACIÓN */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 space-y-2.5">
          <div className="flex justify-between items-center">
            {/* BRAND / LOGO */}
            <div className="flex items-center gap-2.5">
              <img
                src="logo.jpg"
                alt="Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-xl border border-slate-200 p-0.5"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none animate-fadeIn">TurnoYa</h1>
                <p className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Santa Cruz - Bolivia</p>
              </div>
            </div>

            {/* ACCIONES DEL HEADER */}
            <div className="flex items-center gap-2 font-bold text-xs">
              {/* BOTÓN TEXTO ENORME */}
              <button
                type="button"
                onClick={() => setIsSuperSize(!isSuperSize)}
                className={`px-3 py-2 rounded-xl text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${isSuperSize ? 'bg-blue-600 text-white border border-blue-700' : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
              >
                🔎 {isSuperSize ? 'Vista Normal' : 'Texto Grande'}
              </button>

              {/* BOTÓN AUDIO GUÍA (ASISTENTE DE VOZ) */}
              <button
                type="button"
                onClick={() => setAudioGuia(!audioGuia)}
                className={`px-3 py-2 rounded-xl text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${audioGuia ? 'bg-emerald-600 text-white border border-emerald-700' : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
              >
                {audioGuia ? '🔊 Desactivar Voz' : '🔈 Activar Voz'}
              </button>

              {/* NOTIFICACIONES */}
              {isLoggedIn && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifPanel(!showNotifPanel)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl relative border cursor-pointer flex items-center justify-center"
                  >
                    <Bell className="w-5 h-5 text-slate-600" />
                    {notificaciones.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                        {notificaciones.length}
                      </span>
                    )}
                  </button>

                  {showNotifPanel && (
                    <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 text-xs font-semibold space-y-3">
                      <h4 className="font-black text-slate-800 border-b pb-2">Notificaciones de Correo (SMTP)</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {notificaciones.map(n => (
                          <div key={n.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                            <p className="text-blue-700 font-black">{n.titulo}</p>
                            <p className="text-slate-600 text-[10px] leading-snug">{n.mensaje}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* BARRA DE PERFIL DE SESIÓN */}
          {isLoggedIn && currentUser && (
            <div className="bg-blue-50/70 border border-blue-100/80 rounded-2xl px-3.5 py-2 flex items-center justify-between text-xs font-bold text-blue-900 animate-fadeIn">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">{currentUser.rol}</span>
                <span className="text-blue-800 text-[11px] truncate max-w-[150px] sm:max-w-xs">{currentUser.nombre}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-rose-600 hover:text-rose-700 hover:underline font-extrabold text-[11px] cursor-pointer bg-transparent border-0 outline-none"
              >
                Salir &rarr;
              </button>
            </div>
          )}
        </div>
      </header>



      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-8 w-full flex flex-col justify-center">

        {/* ACCESO DENEGADO POR ROL */}
        {isLoggedIn && !isAuthorized ? (
          <div className="max-w-xl w-full mx-auto bg-white rounded-3xl border-2 border-rose-200 p-8 text-center space-y-4 shadow-xl my-12 animate-fadeIn">
            <div className="bg-rose-50 text-rose-600 p-4 rounded-full w-fit mx-auto border border-rose-100">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Acceso Restringido por Rol</h2>
            <p className="text-sm text-slate-500 leading-relaxed font-bold">
              Usted ha iniciado sesión como **{currentUser.rol.toUpperCase()}**. No tiene los permisos de acceso requeridos para ver la sección de **{currentRole.toUpperCase()}**.
            </p>
            <button
              onClick={() => {
                window.location.hash = `#${currentUser.rol}`;
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Ir a mi Panel Seguro ({currentUser.rol.toUpperCase()})
            </button>
          </div>
        ) : !isLoggedIn ? (
          /* ========================================================================= */
          /* PANTALLA DE ACCESO SEGURO (LOGIN / REGISTRO) - SIN ROLES VISIBLES */
          /* ========================================================================= */
          <div className="max-w-xl w-full mx-auto bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden animate-fadeIn py-6">
            
            <div className="p-6 text-center space-y-3 border-b border-slate-100 pb-5">
              <h2 className="text-3xl font-black text-slate-800">Acceso Seguro a TurnoYa</h2>
              <p className="text-sm text-slate-500">
                Evita madrugar y hacer largas filas en los hospitales de Santa Cruz de la Sierra.
              </p>
            </div>

            <div className="p-6 space-y-5">
              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4 font-semibold">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Correo de tu Cuenta</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-base focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Contraseña</label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-base focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* CHECKBOX DE RECORDAR USUARIO */}
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-5 h-5 border border-slate-300 rounded-md focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="remember" className="text-xs text-slate-600 font-bold cursor-pointer select-none">
                      Recordar mi usuario y mantener sesión abierta
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-sm shadow-md transition cursor-pointer"
                  >
                    Ingresar
                  </button>
                  <p className="text-center text-sm text-slate-500">
                    ¿No tienes cuenta?{' '}
                    <button type="button" onClick={() => setAuthMode('register')} className="text-blue-600 font-bold hover:underline cursor-pointer">
                      Regístrate aquí
                    </button>
                  </p>

                  <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
                    <p className="text-[9px] text-slate-400 font-black uppercase">Accesos Rápidos de Prueba (Demo)</p>
                    <div className="flex gap-2 flex-wrap justify-center font-bold">
                      <button type="button" onClick={() => handleBypass('paciente')} className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-600 hover:bg-slate-100 cursor-pointer">Paciente Demo</button>
                      <button type="button" onClick={() => handleBypass('encargado')} className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-600 hover:bg-slate-100 cursor-pointer">Encargado Demo</button>
                      <button type="button" onClick={() => handleBypass('admin')} className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-600 hover:bg-slate-100 cursor-pointer">Admin Demo</button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4 font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Nro de Carnet (C.I.)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={regCI}
                          onChange={(e) => setRegCI(e.target.value)}
                          placeholder="Ej: 12345678"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-base focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        />
                        <input
                          type="text"
                          maxLength={5}
                          value={regComplemento}
                          onChange={(e) => setRegComplemento(e.target.value)}
                          placeholder="Comp (ej. 1K)"
                          className="w-28 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-base focus:ring-2 focus:ring-blue-500 outline-none font-bold text-center"
                          title="Si su carnet lleva complemento (ej: duplicado), colóquelo aquí"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Nombres</label>
                      <input
                        type="text"
                        required
                        value={regNombre}
                        onChange={(e) => setRegNombre(e.target.value)}
                        placeholder="Ej: Juan Andrés"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-base focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Apellidos</label>
                      <input
                        type="text"
                        required
                        value={regApellido}
                        onChange={(e) => setRegApellido(e.target.value)}
                        placeholder="Ej: Revollo Gutiérrez"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-base focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-base focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Contraseña</label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-base focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-sm shadow-md transition cursor-pointer"
                  >
                    Crear Cuenta Paciente
                  </button>
                  <p className="text-center text-sm text-slate-500">
                    ¿Ya tienes cuenta?{' '}
                    <button type="button" onClick={() => setAuthMode('login')} className="text-blue-600 font-bold hover:underline cursor-pointer">
                      Inicia sesión
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* PANTALLAS PRINCIPALES POR ROL (SOLO SI TIENE PERMISO) */
          /* ========================================================================= */
          <div className="space-y-8">

            {/* VISTA DEL PACIENTE (#paciente) */}
            {currentRole === 'paciente' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* WIZARD PASO A PASO */}
                <div id="booking-wizard-card" className="bg-white rounded-3xl border-2 border-slate-200 p-6 md:p-8 shadow-lg space-y-6">
                  
                  <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4">
                    <h3 className="font-black text-slate-800 text-base md:text-lg flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-blue-600" /> OBTENER FICHA DE ATENCIÓN
                    </h3>
                    <span className="text-xs bg-blue-50 text-blue-700 font-black px-3.5 py-1 rounded-full uppercase">Paso {wizardStep} de 5</span>
                  </div>

                  {/* PASO 1: Elegir Nivel de Hospital */}
                  {wizardStep === 1 && (
                    <div className="space-y-4">
                      <p className="text-sm md:text-base text-slate-500 font-bold font-semibold">1. Seleccione el nivel de atención médica:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => { setSelectedNivel(2); setWizardStep(2); }}
                          className="p-6 border-2 border-slate-200 rounded-3xl text-left hover:border-blue-600 hover:bg-blue-50/20 transition cursor-pointer space-y-2 focus:ring-2 focus:ring-blue-500"
                        >
                          <h4 className="font-black text-slate-800 text-base">Segundo Nivel (Hospitales Municipales)</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Especialidades básicas, urgencias generales, pediatría básica e internaciones.</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSelectedNivel(3); setWizardStep(2); }}
                          className="p-6 border-2 border-slate-200 rounded-3xl text-left hover:border-blue-600 hover:bg-blue-50/20 transition cursor-pointer space-y-2 focus:ring-2 focus:ring-blue-500"
                        >
                          <h4 className="font-black text-slate-800 text-base">Tercer Nivel (Alta Complejidad y Especialidades)</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Consultas y subespecialidades complejas, cirugías mayores y tratamientos especializados departamentales.</p>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PASO 2: Elegir Hospital (Con Info completa, ubicación y Cruzero API) */}
                  {wizardStep === 2 && (
                    <div className="space-y-4">
                      <p className="text-sm md:text-base text-slate-500 font-bold font-semibold">2. Seleccione el Hospital:</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                          {centrosFiltrados.map(c => (
                            <button
                              key={c.id_centro}
                              type="button"
                              onClick={() => setSelectedCentroId(c.id_centro)}
                              className={`w-full p-4 border-2 rounded-2xl text-left transition flex justify-between items-center cursor-pointer focus:ring-2 focus:ring-blue-500 ${selectedCentroId === c.id_centro ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-blue-400'}`}
                            >
                              <div>
                                <h5 className="font-black text-slate-800 text-sm leading-snug">{c.nombre}</h5>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{c.distrito}</p>
                              </div>
                              <MapPin className={`w-5 h-5 shrink-0 ${selectedCentroId === c.id_centro ? 'text-blue-600' : 'text-slate-400'}`} />
                            </button>
                          ))}
                        </div>

                        {/* Tarjeta informativa del hospital seleccionado */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-3">
                          {centroSeleccionadoInfo ? (
                            <div className="space-y-3 text-xs text-slate-600 leading-relaxed font-semibold">
                              
                              {/* Imagen Real del Hospital */}
                              <img
                                src={centroSeleccionadoInfo.imagen_url}
                                alt={centroSeleccionadoInfo.nombre}
                                className="w-full h-32 rounded-xl object-cover border border-slate-200 shadow-inner"
                              />

                              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm pb-1 border-b border-slate-200">
                                <Building2 className="w-4 h-4 text-blue-600" /> Datos del Hospital
                              </div>
                              <p><strong>Ubicación:</strong> {centroSeleccionadoInfo.direccion}</p>
                              <p><strong>Distrito:</strong> {centroSeleccionadoInfo.distrito}</p>
                              <p><strong>Horario Fichas:</strong> {centroSeleccionadoInfo.horario_fichas}</p>
                              <p><strong>📞 Teléfono:</strong> {centroSeleccionadoInfo.telefono}</p>
                              
                              {/* BOTÓN VER MAPA DE GOOGLE MAPS */}
                              <button
                                type="button"
                                onClick={() => setShowGoogleMapModal(true)}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                              >
                                <Map className="w-4 h-4 text-blue-600 animate-pulse" /> Ver Ubicación en Google Maps
                              </button>
                              
                              {/* INFORMACION DE CRUZERO INTEGRACION */}
                              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
                                <div className="flex items-center gap-1">
                                  <Bus className="w-4 h-4 text-blue-600" />
                                  <p className="text-[10px] text-blue-700 font-extrabold uppercase tracking-wider">Integración Cruzero</p>
                                </div>
                                <p className="text-blue-900 font-bold text-xs">{centroSeleccionadoInfo.como_llegar}</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveRouteInfo(centroSeleccionadoInfo.como_llegar);
                                    setShowCruzeroMap(true);
                                  }}
                                  className="text-[10px] font-black text-blue-700 underline flex items-center gap-1 cursor-pointer"
                                >
                                  Ver Mapa de micros recomendados
                                </button>
                              </div>
                              
                              {centroSeleccionadoInfo.nivel_atencion === 3 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-2.5 text-[11px] text-amber-800 font-semibold leading-relaxed">
                                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-extrabold text-amber-900">Requisito de Tercer Nivel:</p>
                                    <p className="text-amber-700">Debe presentar su <strong>Hoja de Referencia (Formulario D7/Nº1)</strong> o su <strong>Formulario Nº4 de Tránsito</strong> al momento de su atención.</p>
                                  </div>
                                </div>
                              )}
                              
                              <button
                                type="button"
                                onClick={() => setWizardStep(3)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
                              >
                                Siguiente: Especialidad &rarr;
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 italic text-center">
                              <p className="text-xs font-semibold">Seleccione un hospital de la lista para ver su información de contacto y micros de Cruzero.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <button onClick={() => setWizardStep(1)} className="text-xs text-slate-500 hover:underline pt-2 block font-medium">
                        &larr; Volver al paso anterior
                      </button>
                    </div>
                  )}

                  {/* PASO 3: Elegir Especialidad */}
                  {wizardStep === 3 && (
                    <div className="space-y-4">
                      <p className="text-sm md:text-base text-slate-500 font-bold font-semibold">3. ¿Qué especialidad médica requiere?</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(() => {
                          const centroSeleccionado = centros.find(c => c.id_centro === selectedCentroId);
                          const especialidadesDisponibles = especialidades.filter(esp => {
                            if (!centroSeleccionado?.especialidades) return true; // fallback
                            return centroSeleccionado.especialidades.includes(esp.id_especialidad);
                          });

                          if (especialidadesDisponibles.length === 0) {
                            return (
                              <p className="col-span-full text-center py-4 text-xs text-slate-400 font-bold italic">
                                No hay especialidades configuradas para este hospital.
                              </p>
                            );
                          }

                          return especialidadesDisponibles.map(esp => (
                            <button
                              key={esp.id_especialidad}
                              type="button"
                              onClick={() => { setSelectedEspecialidadId(esp.id_especialidad); setWizardStep(4); }}
                              className="p-5 border-2 border-slate-200 rounded-2xl hover:border-blue-600 text-center hover:bg-blue-50/20 transition flex flex-col items-center justify-center space-y-3 cursor-pointer"
                            >
                              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                {esp.nombre === 'Neurología' ? <Brain className="w-6 h-6" /> : esp.nombre === 'Pediatría' ? <Baby className="w-6 h-6" /> : esp.nombre === 'Cardiología' ? <Activity className="w-6 h-6" /> : <Stethoscope className="w-6 h-6" />}
                              </div>
                              <h5 className="font-extrabold text-slate-800 text-xs leading-tight">{esp.nombre}</h5>
                            </button>
                          ));
                        })()}
                      </div>
                      <button onClick={() => setWizardStep(2)} className="text-xs text-slate-500 hover:underline pt-2 block font-medium">
                        &larr; Volver al paso anterior
                      </button>
                    </div>
                  )}

                  {/* PASO 4: Elegir Horario */}
                  {wizardStep === 4 && (
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex gap-3 text-xs text-amber-800 font-medium leading-relaxed">
                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                        <p>
                          <strong>¡No madrugue!</strong> Al elegir una hora a continuación, su cupo queda asegurado. Preséntese en el hospital únicamente 15 minutos antes de la hora seleccionada.
                        </p>
                      </div>

                      <p className="text-sm md:text-base text-slate-500 font-bold font-semibold">4. Seleccione su hora de atención de mañana:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {horariosDisponibles.map(h => (
                          <button
                            key={h.id_horario}
                            onClick={() => { setSelectedHorarioObj(h); setWizardStep(5); }}
                            className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-600 text-center hover:bg-blue-50/50 transition font-bold text-slate-700 text-xs cursor-pointer"
                          >
                            {h.hora_inicio} AM
                          </button>
                        ))}
                      </div>
                      {horariosDisponibles.length === 0 && (
                        <p className="text-xs text-slate-400 italic font-semibold">No hay horarios libres de mañana en este hospital hoy.</p>
                      )}
                      <button onClick={() => setWizardStep(3)} className="text-xs text-slate-500 hover:underline pt-2 block font-medium">
                        &larr; Volver al paso anterior
                      </button>
                    </div>
                  )}

                  {/* PASO 5: Confirmar Cita */}
                  {wizardStep === 5 && selectedHorarioObj && (
                    <form onSubmit={registrarFicha} className="space-y-5 text-xs font-semibold">
                      <p className="text-sm md:text-base text-slate-500 font-bold">5. Resumen de la Ficha Médica:</p>
                      
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-slate-700">
                        <p><strong>Hospital:</strong> {centros.find(c => c.id_centro === selectedCentroId)?.nombre}</p>
                        <p><strong>Especialidad:</strong> {especialidades.find(esp => esp.id_especialidad === selectedEspecialidadId)?.nombre}</p>
                        <p><strong>Consultorio Asignado:</strong> {obtenerConsultorio(especialidades.find(esp => esp.id_especialidad === selectedEspecialidadId)?.nombre || '')}</p>
                        <p><strong>Fecha y Hora:</strong> {selectedHorarioObj.fecha} a las {selectedHorarioObj.hora_inicio} AM</p>
                      </div>

                      {/* Checklist interactivo obligatorio de Requisitos */}
                      <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl space-y-2 text-slate-700">
                        <p className="font-extrabold text-[10px] text-blue-800 uppercase tracking-wider block">📋 Confirme que cuenta con los requisitos físicos obligatorios:</p>
                        <div className="space-y-2 text-[11px] text-slate-600">
                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input type="checkbox" required className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
                            <span>Tengo mi <strong>Cédula de Identidad original vigente</strong></span>
                          </label>
                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input type="checkbox" required className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
                            <span>Tengo una <strong>Fotocopia legible de mi C.I.</strong></span>
                          </label>
                          {centros.find(c => c.id_centro === selectedCentroId)?.nivel_atencion === 3 && (
                            <label className="flex items-start gap-2.5 cursor-pointer text-rose-700">
                              <input type="checkbox" required className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 mt-0.5 cursor-pointer" />
                              <span className="font-black">Tengo la <strong>Hoja de Referencia (Formulario D7)</strong> original firmada y sellada</span>
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Breve descripción de sus síntomas (Opcional)</label>
                        <input
                          type="text"
                          value={motivoConsulta}
                          onChange={(e) => setMotivoConsulta(e.target.value)}
                          placeholder="Ej: Dolor de espalda / Receta mensual"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-base focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setWizardStep(4)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold transition text-xs cursor-pointer"
                        >
                          Atrás
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-md shadow-blue-200 transition text-xs cursor-pointer"
                        >
                          Confirmar y Sacar Ficha
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* MODAL DE MAPA DE CRUZERO */}
                {showCruzeroMap && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 p-5 space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                          <Bus className="w-5 h-5 text-blue-600" /> Ruta Recomendada (Cruzero)
                        </h4>
                        <button onClick={() => setShowCruzeroMap(false)} className="text-slate-400 hover:text-slate-800">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="bg-slate-100 border rounded-2xl p-6 text-center space-y-3">
                        <Map className="w-16 h-16 text-blue-600 mx-auto animate-pulse" />
                        <p className="text-xs font-bold text-slate-700">Líneas de Micros para llegar al Hospital:</p>
                        <p className="text-sm font-black text-blue-900 bg-white p-3 rounded-xl border border-blue-200">{activeRouteInfo}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCruzeroMap(false)}
                        className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold text-xs transition"
                      >
                        Entendido
                      </button>
                    </div>
                  </div>
                )}

                {/* MODAL DE UBICACIÓN EN GOOGLE MAPS */}
                {showGoogleMapModal && centroSeleccionadoInfo && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 p-5 space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                          <Map className="w-5 h-5 text-blue-600 animate-pulse" /> Ubicación: {centroSeleccionadoInfo.nombre}
                        </h4>
                        <button onClick={() => setShowGoogleMapModal(false)} className="text-slate-400 hover:text-slate-800 cursor-pointer">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* Google Map real */}
                      <div className="bg-slate-100 border border-slate-200 rounded-2xl h-80 overflow-hidden relative shadow-inner">
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={`https://maps.google.com/maps?q=${centroSeleccionadoInfo.latitud},${centroSeleccionadoInfo.longitud}&z=16&output=embed`}
                        ></iframe>
                      </div>

                      <div className="text-[10px] text-slate-500 font-bold leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                        <p><strong>Dirección:</strong> {centroSeleccionadoInfo.direccion}</p>
                        <p className="mt-1"><strong>Líneas de Micros:</strong> {centroSeleccionadoInfo.como_llegar}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowGoogleMapModal(false)}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-xs transition cursor-pointer shadow-md shadow-blue-100"
                      >
                        Entendido
                      </button>
                    </div>
                  </div>
                )}

                {/* MIS TURNOS Y IMPRESIÓN */}
                <section className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <h4 className="font-extrabold text-slate-800 text-base md:text-lg">Mis Fichas de Atención</h4>
                    
                    {/* TABS DE FILTRO DE PACIENTE */}
                    <div className="flex bg-slate-100 p-1 rounded-xl font-bold text-[10px] sm:text-xs">
                      <button
                        type="button"
                        onClick={() => { setPatientFilterTab('activas'); setPatientPage(1); }}
                        className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${patientFilterTab === 'activas' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Activas ({turnos.filter(t => t.id_paciente === currentUser?.id_usuario && (t.estado === 'Pendiente' || t.estado === 'En Atención')).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPatientFilterTab('historial'); setPatientPage(1); }}
                        className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${patientFilterTab === 'historial' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Historial ({turnos.filter(t => t.id_paciente === currentUser?.id_usuario && (t.estado === 'Atendido' || t.estado === 'Cancelado' || t.estado === 'Ausente')).length})
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(() => {
                      const filteredPatientTurnos = turnos.filter(t => {
                        if (t.id_paciente !== currentUser?.id_usuario) return false;
                        if (patientFilterTab === 'activas') {
                          return t.estado === 'Pendiente' || t.estado === 'En Atención';
                        } else {
                          return t.estado === 'Atendido' || t.estado === 'Cancelado' || t.estado === 'Ausente';
                        }
                      });

                      if (filteredPatientTurnos.length === 0) {
                        return (
                          <div className="text-center py-10 bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-xs">
                            <p className="text-xs text-slate-400 font-bold italic">No se encontraron fichas médicas en esta categoría.</p>
                          </div>
                        );
                      }

                      // Paginación local del paciente (3 por página)
                      const itemsPerPatientPage = 3;
                      const totalPatientPages = Math.ceil(filteredPatientTurnos.length / itemsPerPatientPage) || 1;
                      const currentPageAdjusted = Math.min(patientPage, totalPatientPages);
                      const startIndex = (currentPageAdjusted - 1) * itemsPerPatientPage;
                      const paginatedPatientTurnos = filteredPatientTurnos.slice(startIndex, startIndex + itemsPerPatientPage);

                      return (
                        <>
                          <div className="space-y-3">
                            {paginatedPatientTurnos.map(turno => {
                              const isExpanded = expandedTurnoId === turno.id_turno;
                              return (
                                <div key={turno.id_turno} className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col gap-1 text-xs font-semibold">
                                  {/* Encabezado colapsable */}
                                  <div
                                    onClick={() => setExpandedTurnoId(isExpanded ? '' : turno.id_turno)}
                                    className="flex items-center justify-between w-full cursor-pointer select-none gap-3"
                                  >
                                    <div className="space-y-1.5 min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h5 className="font-black text-slate-800 text-xs sm:text-sm truncate leading-tight">{turno.nombre_centro}</h5>
                                        <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">{turno.especialidad_personal_salud}</span>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${turno.estado === 'Atendido' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : turno.estado === 'Cancelado' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                          {turno.estado}
                                        </span>
                                      </div>
                                      <div className="flex gap-2.5 text-slate-500 font-bold text-[9px] sm:text-[10px]">
                                        <span className="flex items-center gap-0.5"><Clock className="w-3.5 h-3.5 text-blue-500" /> {turno.fecha} ({turno.hora})</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-xl text-[9px] sm:text-[10px] font-mono font-black">
                                        #{turno.id_turno.substring(2, 8).toUpperCase()}
                                      </span>
                                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                  </div>

                                  {/* Detalles expandidos */}
                                  {isExpanded && (
                                    <div className="border-t border-slate-100 pt-4 mt-3 space-y-4 animate-fadeIn">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] sm:text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <p><strong>Médico:</strong> {turno.nombre_personal_salud}</p>
                                        <p><strong>Consultorio:</strong> <span className="text-blue-700 font-black">{obtenerConsultorio(turno.especialidad_personal_salud)}</span></p>
                                        <p className="sm:col-span-2"><strong>Hospital:</strong> {turno.nombre_centro}</p>
                                        <p className="sm:col-span-2"><strong>Código único:</strong> {turno.id_turno}</p>
                                      </div>

                                      <div className="flex flex-wrap gap-2 font-bold">
                                        {turno.estado === 'Pendiente' && (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => imprimirFicha(turno)}
                                              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-[10px] sm:text-xs cursor-pointer"
                                            >
                                              <Printer className="w-4 h-4 text-slate-600" /> Imprimir Ficha
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleCancelarTurno(turno)}
                                              className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-[10px] sm:text-xs cursor-pointer"
                                            >
                                              <XCircle className="w-4 h-4 text-rose-500" /> Cancelar Ficha
                                            </button>
                                          </>
                                        )}
                                        {turno.estado === 'Atendido' && (
                                          <button
                                            type="button"
                                            onClick={() => imprimirFicha(turno)}
                                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-[10px] sm:text-xs cursor-pointer"
                                          >
                                            <Printer className="w-4 h-4 text-slate-600" /> Reimprimir Comprobante
                                          </button>
                                        )}
                                      </div>

                                      {/* Monitor de Cola Virtual en Vivo */}
                                      {turno.estado === 'Pendiente' && (() => {
                                        const queue = calcularEsperaCola(turno, turnos);
                                        return (
                                          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 space-y-2 text-[10px] text-slate-700">
                                            <div className="flex justify-between items-center">
                                              <span className="font-black text-blue-800 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} /> Monitor de Fila Virtual en Vivo
                                              </span>
                                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-black text-[8px] animate-pulse">Fila Activa</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-center pt-1 font-bold text-slate-600">
                                              <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs">
                                                <p className="text-[8px] text-slate-400 uppercase">En Consulta</p>
                                                <p className="text-xs text-blue-600 font-black">{queue.fichaEnConsulta}</p>
                                              </div>
                                              <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs">
                                                <p className="text-[8px] text-slate-400 uppercase">Pacientes delante</p>
                                                <p className="text-xs text-amber-600 font-black">{queue.personasDelante}</p>
                                              </div>
                                              <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs">
                                                <p className="text-[8px] text-slate-400 uppercase">Tu posición</p>
                                                <p className="text-xs text-emerald-600 font-black"># {queue.posicionFila}</p>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Controles de paginación del Paciente */}
                          {totalPatientPages > 1 && (
                            <div className="flex justify-between items-center bg-white border-2 border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-700 shadow-xs">
                              <button
                                type="button"
                                disabled={currentPageAdjusted === 1}
                                onClick={() => setPatientPage(prev => Math.max(prev - 1, 1))}
                                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
                              >
                                &larr; Anterior
                              </button>
                              <span>Página {currentPageAdjusted} de {totalPatientPages} ({filteredPatientTurnos.length} fichas)</span>
                              <button
                                type="button"
                                disabled={currentPageAdjusted === totalPatientPages}
                                onClick={() => setPatientPage(prev => Math.min(prev + 1, totalPatientPages))}
                                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
                              >
                                Siguiente &rarr;
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </section>
              </div>
            )}

            {/* VISTA DEL ENCARGADO / VENTANILLA DE ATENCIÓN (#encargado) */}
            {currentRole === 'encargado' && (
              <div className="space-y-6">
                
                <div className="bg-indigo-900 text-indigo-100 rounded-3xl p-6 shadow-md flex justify-between items-center flex-wrap gap-4 animate-fadeIn">
                  <div className="space-y-1">
                    <span className="text-[9px] bg-indigo-800 text-indigo-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      Ventanilla de Control de Fichas
                    </span>
                    <h2 className="text-xl font-black text-white">Bandeja de Control Inmediato</h2>
                    <p className="text-xs text-indigo-200">
                      Marque como "PROCESADO" el turno de los pacientes de forma instantánea al finalizar su consulta médica.
                    </p>
                  </div>
                  <button
                    onClick={() => setMostrarEscaneoSimulado(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer border border-indigo-500"
                  >
                    <ScanLine className="w-4 h-4" /> Escanear QR Ficha
                  </button>
                </div>

                {/* INTERFAZ DE ESCANEO DE CÁMARA REAL EN TIEMPO REAL */}
                {mostrarEscaneoSimulado && (
                  <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col justify-between p-6 animate-fadeIn text-white font-sans">
                    <style>{`
                      @keyframes scanSweep {
                        0% { top: 4%; }
                        50% { top: 96%; }
                        100% { top: 4%; }
                      }
                    `}</style>

                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-slate-800 pb-4 w-full max-w-md mx-auto shrink-0">
                      <div className="flex items-center gap-2.5">
                        <QrCode className="w-6 h-6 text-indigo-400 animate-pulse" />
                        <div>
                          <h4 className="font-black text-sm text-slate-100">Escáner de Fichas en Vivo</h4>
                          <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Cámara y Simulación Activas</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setMostrarEscaneoSimulado(false)}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white p-2.5 rounded-full border border-slate-800 cursor-pointer transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Camera view / scanner square */}
                    <div className="flex-1 flex flex-col items-center justify-center py-4 w-full max-w-md mx-auto">
                      <div className="w-full aspect-square relative bg-black rounded-3xl overflow-hidden border-2 border-indigo-500 shadow-2xl">
                        {/* LASER SCANNING LINE */}
                        <div 
                          className="absolute left-[4%] right-[4%] h-0.5 bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.8)] z-10"
                          style={{ animation: 'scanSweep 2.5s infinite ease-in-out' }}
                        ></div>
                        {/* SCANNER VIEWPORT CORNER BORDERS */}
                        <div className="absolute top-6 left-6 w-6 h-6 border-t-4 border-l-4 border-indigo-400 z-10"></div>
                        <div className="absolute top-6 right-6 w-6 h-6 border-t-4 border-r-4 border-indigo-400 z-10"></div>
                        <div className="absolute bottom-6 left-6 w-6 h-6 border-b-4 border-l-4 border-indigo-400 z-10"></div>
                        <div className="absolute bottom-6 right-6 w-6 h-6 border-b-4 border-r-4 border-indigo-400 z-10"></div>
                        
                        {/* QR reader wrapper target */}
                        <div id="qr-reader" className="w-full h-full object-cover"></div>
                      </div>
                      <p className="text-center text-xs text-slate-400 font-bold mt-4">
                        Apunte la cámara trasera hacia el código QR de la boleta de atención del paciente.
                      </p>
                    </div>

                    {/* Footer con entrada manual y simulador */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 max-w-md mx-auto w-full shadow-lg shrink-0 text-slate-300">
                      {/* Simular en caso de que no tenga cámara física */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider block text-center">
                          Simular Ficha Detectada (Pruebas en PC)
                        </label>
                        {turnos.filter(t => t.estado === 'Pendiente').length > 0 ? (
                          <select
                            onChange={(e) => {
                              setCiEscaneada(e.target.value);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white outline-none cursor-pointer"
                            value={ciEscaneada}
                          >
                            <option value="">-- Seleccionar ficha pendiente --</option>
                            {turnos.filter(t => t.estado === 'Pendiente').map(t => (
                              <option key={t.id_turno} value={t.ci_paciente} className="bg-slate-900 text-white">
                                Ficha #{t.id_turno.substring(2,8).toUpperCase()} - C.I. {t.ci_paciente} ({t.nombre_paciente})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-[10px] text-slate-500 italic text-center">No hay fichas pendientes en base de datos.</p>
                        )}
                      </div>

                      <div className="border-t border-slate-800/80 my-2"></div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider block text-center">
                          O Ingrese la C.I. manualmente
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={ciEscaneada}
                            onChange={(e) => setCiEscaneada(e.target.value)}
                            placeholder="Ej: 7766554"
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center text-sm font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!ciEscaneada.trim()) {
                                triggerAlert("Error", "Por favor ingrese una C.I. válida o seleccione una ficha de simulación", "error");
                                return;
                              }
                              handleSimularEscaneo(ciEscaneada);
                              setMostrarEscaneoSimulado(false);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-2xl font-bold text-xs cursor-pointer shadow-md transition"
                          >
                            Procesar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Listado y Búsqueda */}
                <div className="space-y-4">
                  
                  {/* TABS DE FILTRO DE ENCARGADO */}
                  <div className="flex bg-indigo-50/70 p-1 rounded-2xl font-bold text-xs border border-indigo-100/50">
                    <button
                      type="button"
                      onClick={() => { setEncargadoFilterTab('pendientes'); setEncargadoPage(1); }}
                      className={`flex-1 py-2.5 rounded-xl transition cursor-pointer text-center ${encargadoFilterTab === 'pendientes' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-600 hover:text-indigo-900'}`}
                    >
                      Pendientes ({turnos.filter(t => t.estado === 'Pendiente' || t.estado === 'En Atención').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEncargadoFilterTab('procesados'); setEncargadoPage(1); }}
                      className={`flex-1 py-2.5 rounded-xl transition cursor-pointer text-center ${encargadoFilterTab === 'procesados' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-600 hover:text-indigo-900'}`}
                    >
                      Procesados ({turnos.filter(t => t.estado === 'Atendido').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEncargadoFilterTab('cancelados'); setEncargadoPage(1); }}
                      className={`flex-1 py-2.5 rounded-xl transition cursor-pointer text-center ${encargadoFilterTab === 'cancelados' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-600 hover:text-indigo-900'}`}
                    >
                      Cancelados ({turnos.filter(t => t.estado === 'Cancelado').length})
                    </button>
                  </div>

                  {/* Buscador Rápido para la encargada */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Buscar por C.I. de paciente o Código de Ficha para procesar..."
                      value={filtroBusquedaCargada}
                      onChange={(e) => setFiltroBusquedaCargada(e.target.value)}
                      className="text-sm text-slate-800 bg-transparent border-0 outline-none w-full font-bold"
                    />
                    {filtroBusquedaCargada && (
                      <button onClick={() => setFiltroBusquedaCargada('')} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
                        Limpiar
                      </button>
                    )}
                  </div>

                  {/* Resultados de Fichas */}
                  <div className="bg-white rounded-3xl border-2 border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                    {(() => {
                      // 1. Filtrar por búsqueda rápida
                      let list = turnos;
                      if (filtroBusquedaCargada.trim()) {
                        const q = filtroBusquedaCargada.toLowerCase();
                        list = list.filter(t => 
                          t.ci_paciente.toLowerCase().includes(q) || 
                          t.id_turno.toLowerCase().includes(q) ||
                          t.nombre_paciente.toLowerCase().includes(q)
                        );
                      }

                      // 2. Filtrar por Pestaña
                      if (encargadoFilterTab === 'pendientes') {
                        list = list.filter(t => t.estado === 'Pendiente' || t.estado === 'En Atención');
                      } else if (encargadoFilterTab === 'procesados') {
                        list = list.filter(t => t.estado === 'Atendido');
                      } else {
                        list = list.filter(t => t.estado === 'Cancelado' || t.estado === 'Ausente');
                      }

                      // 3. Paginar
                      const totalItems = list.length;
                      const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
                      
                      // Autoajustar la página si excede el rango
                      const currentPage = encargadoPage > totalPages ? totalPages : encargadoPage;
                      const paginatedList = list.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                      if (paginatedList.length === 0) {
                        return (
                          <div className="p-12 text-center text-slate-400 text-xs italic font-semibold">
                            No se encontraron fichas en esta pestaña con el filtro de búsqueda indicado.
                          </div>
                        );
                      }

                      return (
                        <>
                          {paginatedList.map(turno => (
                            <div key={turno.id_turno} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold animate-fadeIn">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-black text-slate-800 text-sm leading-none">{turno.nombre_paciente}</h4>
                                  <span className="text-[10px] text-slate-400 font-bold">C.I.: {turno.ci_paciente}</span>
                                  <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">{turno.especialidad_personal_salud}</span>
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${turno.estado === 'Atendido' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                    {turno.estado}
                                  </span>
                                </div>
                                
                                <p className="text-[10px] text-slate-500 font-bold">
                                  Hospital: <strong>{turno.nombre_centro}</strong> | Hora: <strong>{turno.hora}</strong>
                                </p>
                              </div>

                              {/* Botón de Tachar de Inmediato como Atendido */}
                              <div className="flex gap-2 shrink-0 w-full md:w-auto font-bold">
                                {turno.estado === 'Pendiente' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => llamarPacienteVoz(turno.nombre_paciente)}
                                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 p-2.5 rounded-xl cursor-pointer"
                                      title="Llamar paciente por altavoz"
                                    >
                                      <Volume2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedTurnoAtencion(turno)}
                                      className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <Check className="w-4 h-4" /> Registrar Atención (Tachar)
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {/* CONTROLES DE PAGINACIÓN */}
                          <div className="bg-slate-50 p-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-200 text-xs font-bold text-slate-600">
                            <span>Mostrando página {currentPage} de {totalPages} ({totalItems} fichas totales)</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setEncargadoPage(currentPage - 1)}
                                className={`px-3.5 py-1.5 rounded-lg border text-[11px] font-black cursor-pointer transition ${currentPage === 1 ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'}`}
                              >
                                &larr; Ant
                              </button>
                              <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setEncargadoPage(currentPage + 1)}
                                className={`px-3.5 py-1.5 rounded-lg border text-[11px] font-black cursor-pointer transition ${currentPage === totalPages ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'}`}
                              >
                                Sig &rarr;
                              </button>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                </div>

                {/* MODAL REGISTRAR ATENCIÓN CLÍNICA */}
                {selectedTurnoAtencion && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4 border">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-black text-slate-800 text-lg flex items-center gap-1.5">
                          <FileText className="w-5 h-5 text-emerald-600" /> Registrar Atención Médica (CU04)
                        </h4>
                        <button onClick={() => setSelectedTurnoAtencion(null)} className="text-slate-400 hover:text-slate-800">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                        <p><strong>Paciente:</strong> {selectedTurnoAtencion.nombre_paciente}</p>
                        <p><strong>C.I.:</strong> {selectedTurnoAtencion.ci_paciente}</p>
                        <p><strong>Hospital:</strong> {selectedTurnoAtencion.nombre_centro}</p>
                        <p><strong>Especialidad:</strong> {selectedTurnoAtencion.especialidad_personal_salud}</p>
                      </div>

                      <form onSubmit={handleRegistrarAtencion} className="space-y-4 font-semibold text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Diagnóstico Clínico (Obligatorio)</label>
                          <textarea
                            required
                            rows={2}
                            value={atencionDiagnostico}
                            onChange={(e) => setAtencionDiagnostico(e.target.value)}
                            placeholder="Ej: Gripe común y cansancio general"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Observaciones y Reposo (Opcional)</label>
                          <textarea
                            rows={2}
                            value={atencionObservaciones}
                            onChange={(e) => setAtencionObservaciones(e.target.value)}
                            placeholder="Ej: Reposo de 3 días y abundante hidratación"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Resultado / Receta Médica (Opcional)</label>
                          <textarea
                            rows={2}
                            value={atencionResultado}
                            onChange={(e) => setAtencionResultado(e.target.value)}
                            placeholder="Ej: Paracetamol 500mg c/8h por 3 días"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                          />
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => setSelectedTurnoAtencion(null)}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold transition text-xs cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition text-xs cursor-pointer"
                          >
                            Registrar Atención (Tachar)
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VISTA DEL ADMINISTRADOR (#admin) */}
            {currentRole === 'admin' && (
              <div className="space-y-6">
                <h3 className="font-extrabold text-slate-800 text-base">Panel de Gestión General</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* CONFIGURAR HORARIOS (ADMIN) */}
                  <form onSubmit={handleCrearHorario} className="bg-white border-2 border-slate-200 rounded-3xl p-5 space-y-3 text-xs shadow-xs font-semibold">
                    <h4 className="font-extrabold text-slate-800 text-xs pb-1 border-b border-slate-100">Registrar Horarios de Fichas por Hospital</h4>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold">Seleccione el Hospital</label>
                      <select
                        value={nuevoHorarioCentro}
                        onChange={(e) => setNuevoHorarioCentro(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                      >
                        {centros.map(c => (
                          <option key={c.id_centro} value={c.id_centro}>
                            {c.nombre} (Nivel {c.nivel_atencion})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Fecha</label>
                        <input
                          type="date"
                          value={nuevoHorarioFecha}
                          onChange={(e) => setNuevoHorarioFecha(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Hora Inicio</label>
                        <input
                          type="text"
                          value={nuevoHorarioInicio}
                          onChange={(e) => setNuevoHorarioInicio(e.target.value)}
                          placeholder="06:00"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Hora Fin</label>
                        <input
                          type="text"
                          value={nuevoHorarioFin}
                          onChange={(e) => setNuevoHorarioFin(e.target.value)}
                          placeholder="06:30"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold transition text-xs cursor-pointer shadow-xs"
                    >
                      Guardar Bloque Horario
                    </button>
                  </form>

                  {/* Crear Centros de Salud */}
                  <form onSubmit={handleCrearCentro} className="bg-white border-2 border-slate-200 rounded-3xl p-5 space-y-3 text-xs shadow-xs font-semibold">
                    <h4 className="font-extrabold text-slate-800 text-xs pb-1 border-b border-slate-100">Registrar Centro de Salud (Santa Cruz)</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Nombre del Hospital</label>
                        <input
                          type="text"
                          required
                          value={nuevoCentroNombre}
                          onChange={(e) => setNuevoCentroNombre(e.target.value)}
                          placeholder="Ej: Hospital Municipal Francés"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Dirección</label>
                        <input
                          type="text"
                          value={nuevoCentroDir}
                          onChange={(e) => setNuevoCentroDir(e.target.value)}
                          placeholder="Ej: Av. Santos Dumont (6to Anillo)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Nivel</label>
                        <select
                          value={nuevoCentroNivel}
                          onChange={(e) => setNuevoCentroNivel(parseInt(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none font-medium"
                        >
                          <option value={2}>2do Nivel</option>
                          <option value={3}>3er Nivel</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Teléfono</label>
                        <input
                          type="text"
                          value={nuevoCentroTelf}
                          onChange={(e) => setNuevoCentroTelf(e.target.value)}
                          placeholder="Ej: 356-9988"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Foto del Hospital (URL)</label>
                        <input
                          type="text"
                          value={nuevoCentroImagenUrl}
                          onChange={(e) => setNuevoCentroImagenUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Coordenada X en Mapa (Latitud, 0-100 %)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={nuevoCentroLat}
                          onChange={(e) => setNuevoCentroLat(e.target.value)}
                          placeholder="Ej: 40"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Coordenada Y en Mapa (Longitud, 0-100 %)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={nuevoCentroLong}
                          onChange={(e) => setNuevoCentroLong(e.target.value)}
                          placeholder="Ej: 82"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-100 pt-2">
                      <label className="text-[10px] text-slate-500 font-bold block pb-1">Especialidades Disponibles en este Centro</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {especialidades.map(esp => {
                          const isChecked = nuevoCentroEspecialidades.includes(esp.id_especialidad);
                          return (
                            <label key={esp.id_especialidad} className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border rounded-xl p-2 cursor-pointer transition select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setNuevoCentroEspecialidades(nuevoCentroEspecialidades.filter(id => id !== esp.id_especialidad));
                                  } else {
                                    setNuevoCentroEspecialidades([...nuevoCentroEspecialidades, esp.id_especialidad]);
                                  }
                                }}
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                              />
                              <span className="font-bold text-[10px] text-slate-700 leading-tight">{esp.nombre}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold transition text-xs cursor-pointer shadow-xs mt-2"
                    >
                      Guardar Hospital
                    </button>
                  </form>

                </div>

                {/* CONFIGURACIÓN DE REPORTES Y ESTADÍSTICAS (CU05 / HU11) */}
                <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-2 gap-2">
                    <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
                      <BarChart3 className="w-5 h-5 text-indigo-600" /> Reportes Estadísticos de Fichas (CU05)
                    </h4>
                    <button
                      onClick={() => {
                        const reportWindow = window.open('', '_blank');
                        if (!reportWindow) return;
                        
                        const centroSeleccionado = centros.find(c => c.id_centro === adminFiltroCentroId);
                        const hospitalNombre = centroSeleccionado ? centroSeleccionado.nombre : 'Todos los Hospitales';
                        const rangoFechas = (adminFiltroFechaDesde || adminFiltroFechaHasta) 
                          ? `Filtro de Fecha: ${adminFiltroFechaDesde || 'Inicio'} hasta ${adminFiltroFechaHasta || 'Fin'}`
                          : 'Rango de Fecha: Histórico Completo';

                        reportWindow.document.write(`
                          <html>
                            <head>
                              <title>Reporte de Turnos - TurnoYa</title>
                              <style>
                                body { font-family: sans-serif; padding: 40px; color: #334155; }
                                h1 { color: #1e3a8a; margin-bottom: 5px; }
                                .meta { color: #64748b; font-size: 14px; margin-bottom: 20px; }
                                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
                                th { background-color: #f8fafc; }
                                .summary-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                              </style>
                            </head>
                            <body>
                              <h1>TurnoYa - Reporte Estadístico</h1>
                              <div class="meta">
                                <p><strong>Hospital / Centro:</strong> ${hospitalNombre}</p>
                                <p><strong>Periodo:</strong> ${rangoFechas}</p>
                                <p>Fecha de generación: ${new Date().toLocaleString()}</p>
                              </div>
                              <hr />
                              <div class="summary-box">
                                <h3>Resumen de Fichas Filtradas</h3>
                                <p><strong>Total Fichas Solicitadas:</strong> ${turnosFiltradosAdmin.length}</p>
                                <p><strong>Atendidos (Atención Médica):</strong> ${turnosFiltradosAdmin.filter(t => t.estado === 'Atendido').length}</p>
                                <p><strong>Pendientes:</strong> ${turnosFiltradosAdmin.filter(t => t.estado === 'Pendiente').length}</p>
                                <p><strong>Cancelados:</strong> ${turnosFiltradosAdmin.filter(t => t.estado === 'Cancelado').length}</p>
                              </div>
                              
                              <h3>Listado de Fichas (${turnosFiltradosAdmin.length})</h3>
                              <table>
                                <thead>
                                  <tr>
                                    <th>ID Turno</th>
                                    <th>Paciente</th>
                                    <th>Hospital</th>
                                    <th>Especialidad</th>
                                    <th>Fecha y Hora</th>
                                    <th>Estado</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  ${turnosFiltradosAdmin.map(t => `
                                    <tr>
                                      <td>${t.id_turno.substring(0,8).toUpperCase()}</td>
                                      <td>${t.nombre_paciente}</td>
                                      <td>${t.nombre_centro}</td>
                                      <td>${t.especialidad_personal_salud}</td>
                                      <td>${t.fecha} - ${t.hora}</td>
                                      <td>${t.estado}</td>
                                    </tr>
                                  `).join('')}
                                </tbody>
                              </table>
                              <script>window.onload = function() { window.print(); }</script>
                            </body>
                          </html>
                        `);
                        reportWindow.document.close();
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl font-black text-xs transition flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4" /> Exportar Reporte (PDF/Imprimir)
                    </button>
                  </div>

                  {/* Panel de Filtros para Administrador */}
                  <div className="bg-slate-50 border rounded-2xl p-4 space-y-3">
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Filtros de Búsqueda y Exportación</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Hospital / Centro</label>
                        <select
                          value={adminFiltroCentroId}
                          onChange={(e) => setAdminFiltroCentroId(e.target.value)}
                          className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 outline-indigo-600 cursor-pointer"
                        >
                          <option value="todos">🏥 Todos los Hospitales</option>
                          {centros.map(c => (
                            <option key={c.id_centro} value={c.id_centro}>
                              {c.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Fecha Desde</label>
                        <input
                          type="date"
                          value={adminFiltroFechaDesde}
                          onChange={(e) => setAdminFiltroFechaDesde(e.target.value)}
                          className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 outline-indigo-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Fecha Hasta</label>
                        <input
                          type="date"
                          value={adminFiltroFechaHasta}
                          onChange={(e) => setAdminFiltroFechaHasta(e.target.value)}
                          className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 outline-indigo-600"
                        />
                      </div>
                    </div>
                    {(adminFiltroCentroId !== 'todos' || adminFiltroFechaDesde || adminFiltroFechaHasta) && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            setAdminFiltroCentroId('todos');
                            setAdminFiltroFechaDesde('');
                            setAdminFiltroFechaHasta('');
                          }}
                          className="text-[10px] font-black text-rose-600 hover:underline cursor-pointer"
                        >
                          Limpiar filtros
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tarjetas de Métricas */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-50 border rounded-2xl p-4 text-center">
                      <p className="text-[10px] text-slate-500 font-extrabold uppercase">Total Solicitudes</p>
                      <p className="text-2xl font-black text-slate-800">{turnosFiltradosAdmin.length}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                      <p className="text-[10px] text-emerald-600 font-extrabold uppercase">Atendidos</p>
                      <p className="text-2xl font-black text-emerald-800">{turnosFiltradosAdmin.filter(t => t.estado === 'Atendido').length}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                      <p className="text-[10px] text-amber-600 font-extrabold uppercase">Pendientes</p>
                      <p className="text-2xl font-black text-amber-800">{turnosFiltradosAdmin.filter(t => t.estado === 'Pendiente').length}</p>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center">
                      <p className="text-[10px] text-rose-600 font-extrabold uppercase">Cancelados</p>
                      <p className="text-2xl font-black text-rose-800">{turnosFiltradosAdmin.filter(t => t.estado === 'Cancelado').length}</p>
                    </div>
                  </div>

                  {/* Demanda de Especialidades */}
                  <div className="space-y-3 pt-2">
                    <h5 className="font-extrabold text-slate-500 text-xs uppercase">Demanda por Especialidad</h5>
                    <div className="space-y-2.5">
                      {['Medicina General', 'Pediatría', 'Neurología', 'Cardiología'].map(esp => {
                        const count = turnosFiltradosAdmin.filter(t => t.especialidad_personal_salud === esp).length;
                        const percentage = turnosFiltradosAdmin.length > 0 ? (count / turnosFiltradosAdmin.length) * 100 : 0;
                        return (
                          <div key={esp} className="space-y-1 text-xs font-semibold">
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-700">{esp}</span>
                              <span className="text-slate-500">{count} Fichas ({percentage.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-6 px-6 bg-white mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-bold">
          <p>© 2026 TurnoYa - UPDS Santa Cruz de la Sierra.</p>
          <div className="flex gap-4">
            <span>Sistemas de Información II</span>
            <span>•</span>
            <span>Juan Andrés Revollo y Rivaldo Ramírez</span>
          </div>
        </div>
      </footer>

      {/* SWAL ALERT PERSONALIZADA (ESTILO SWEETALERT) */}
      {swalAlert && swalAlert.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4 border text-center flex flex-col items-center">
            {swalAlert.tipo === 'success' ? (
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full border border-emerald-100 mb-2">
                <Check className="w-8 h-8" />
              </div>
            ) : swalAlert.tipo === 'error' ? (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-full border border-rose-100 mb-2">
                <XCircle className="w-8 h-8" />
              </div>
            ) : (
              <div className="bg-blue-50 text-blue-600 p-3 rounded-full border border-blue-100 mb-2">
                <Activity className="w-8 h-8" />
              </div>
            )}
            <h4 className="font-black text-slate-800 text-base">{swalAlert.titulo}</h4>
            <p className="text-slate-500 font-bold leading-relaxed">{swalAlert.mensaje}</p>
            <button
              onClick={() => setSwalAlert(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition text-xs cursor-pointer mt-4"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* SWAL CONFIRM PERSONALIZADA (ESTILO SWEETALERT) */}
      {swalConfirm && swalConfirm.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4 border text-center flex flex-col items-center">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-full border border-amber-100 mb-2">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h4 className="font-black text-slate-800 text-base">{swalConfirm.titulo}</h4>
            <p className="text-slate-500 font-bold leading-relaxed">{swalConfirm.mensaje}</p>
            <div className="flex gap-3 w-full pt-4">
              <button
                onClick={() => setSwalConfirm(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold transition text-xs cursor-pointer"
              >
                No, cancelar
              </button>
              <button
                onClick={() => {
                  swalConfirm.onConfirm();
                  setSwalConfirm(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition text-xs cursor-pointer"
              >
                Sí, confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
