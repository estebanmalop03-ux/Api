const CLAVE_CONFIG_TABLA = 'inventario_personalizacion_v1';

const COLUMNAS_PREDETERMINADAS = [
  { clave: 'id', titulo: 'ID', visible: true, editable: false },
  { clave: 'categoria', titulo: 'Categoría', visible: true, editable: false },
  { clave: 'marca', titulo: 'Marca', visible: true, editable: true },
  { clave: 'modelo', titulo: 'Modelo', visible: true, editable: true },
  { clave: 'serie', titulo: 'Serie', visible: true, editable: true },
  { clave: 'procesador', titulo: 'Procesador', visible: true, editable: true },
  { clave: 'ram', titulo: 'RAM', visible: true, editable: true },
  { clave: 'tipo_almacenamiento', titulo: 'Tipo almacenamiento', visible: true, editable: true },
  { clave: 'capacidad_almacenamiento', titulo: 'Capacidad', visible: true, editable: true },
  { clave: 'tarjeta_grafica', titulo: 'Tarjeta gráfica', visible: true, editable: true },
  { clave: 'cantidad', titulo: 'Cantidad', visible: true, editable: false },
  { clave: 'estado', titulo: 'Estado', visible: true, editable: false },
  { clave: 'ubicacion', titulo: 'Ubicación', visible: false, editable: true },
  { clave: 'actualizado_en', titulo: 'Actualizado', visible: false, editable: false }
];

const PRESETS_COLUMNAS = {
  general: ['id', 'categoria', 'marca', 'modelo', 'serie', 'cantidad', 'estado', 'ubicacion'],
  computo: [
    'id',
    'categoria',
    'marca',
    'modelo',
    'serie',
    'procesador',
    'ram',
    'tipo_almacenamiento',
    'capacidad_almacenamiento',
    'tarjeta_grafica',
    'estado'
  ],
  cables: ['id', 'categoria', 'marca', 'modelo', 'serie', 'cantidad', 'estado', 'ubicacion'],
  todas: COLUMNAS_PREDETERMINADAS.map((c) => c.clave)
};

const ICONOS_CATEGORIA = {
  laptops:
    '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="11" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M2 19H22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  pc:
    '<svg viewBox="0 0 24 24" fill="none"><rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="16" r="1.3" fill="currentColor"/><path d="M9 7H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  cables:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M8 7V4M16 7V4M6 7H18V11C18 13.5 16 15.5 13.5 15.5H10.5C8 15.5 6 13.5 6 11V7Z" stroke="currentColor" stroke-width="1.8"/><path d="M12 15.5V20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  predeterminado:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M4 7L12 3L20 7V17L12 21L4 17V7Z" stroke="currentColor" stroke-width="1.8"/></svg>'
};

const estadoApp = {
  equipos: [],
  esquema: {
    categoriasBase: ['Laptops', 'PC', 'Cables', 'Monitores', 'Periféricos', 'Redes', 'Otros'],
    estadosValidos: ['Disponible', 'En uso', 'Mantenimiento', 'Baja']
  },
  filtros: {
    categoria: 'Todas',
    estado: 'Todos',
    busqueda: ''
  },
  orden: {
    campo: 'id',
    direccion: 'desc'
  },
  edicionRapida: false,
  personalizacion: cargarPersonalizacion()
};

const el = {
  kpiRegistros: document.getElementById('kpi-registros'),
  kpiUnidades: document.getElementById('kpi-unidades'),
  kpiComputo: document.getElementById('kpi-computo'),
  kpiAccesorios: document.getElementById('kpi-accesorios'),
  estadoExcel: document.getElementById('estado-excel'),
  enlaceExcelWeb: document.getElementById('enlace-excel-web'),
  entradaBusqueda: document.getElementById('entrada-busqueda'),
  filtroEstado: document.getElementById('filtro-estado'),
  pestanasCategoria: document.getElementById('pestanas-categoria'),
  btnEdicionCelda: document.getElementById('btn-edicion-celda'),
  btnPersonalizar: document.getElementById('btn-personalizar'),
  panelPersonalizacion: document.getElementById('panel-personalizacion'),
  listaColumnasConfig: document.getElementById('lista-columnas-config'),
  tablaInventario: document.getElementById('tabla-inventario'),
  encabezadoTabla: document.getElementById('encabezado-tabla'),
  cuerpoTabla: document.getElementById('cuerpo-tabla'),
  contadorResultados: document.getElementById('contador-resultados'),
  estadoVacio: document.getElementById('estado-vacio'),
  modalEquipo: document.getElementById('modal-equipo'),
  formularioEquipo: document.getElementById('formulario-equipo'),
  tituloModal: document.getElementById('titulo-modal'),
  alertaFormulario: document.getElementById('alerta-formulario'),
  campoId: document.getElementById('campo-id'),
  campoCategoria: document.getElementById('campo-categoria'),
  envolturaOtraCategoria: document.getElementById('envoltura-otra-categoria'),
  campoOtraCategoria: document.getElementById('campo-otra-categoria'),
  campoMarca: document.getElementById('campo-marca'),
  campoModelo: document.getElementById('campo-modelo'),
  campoSerie: document.getElementById('campo-serie'),
  campoCantidad: document.getElementById('campo-cantidad'),
  campoEstado: document.getElementById('campo-estado'),
  campoUbicacion: document.getElementById('campo-ubicacion'),
  bloqueHardware: document.getElementById('bloque-hardware'),
  campoProcesador: document.getElementById('campo-procesador'),
  campoRam: document.getElementById('campo-ram'),
  campoTipoAlmacenamiento: document.getElementById('campo-tipo-almacenamiento'),
  campoCapacidadAlmacenamiento: document.getElementById('campo-capacidad-almacenamiento'),
  campoTarjetaGrafica: document.getElementById('campo-tarjeta-grafica'),
  modalExcelWeb: document.getElementById('modal-excel-web'),
  formularioExcelWeb: document.getElementById('formulario-excel-web'),
  configRutaExcel: document.getElementById('config-ruta-excel'),
  configEnlaceWeb: document.getElementById('config-enlace-web'),
  modalImportar: document.getElementById('modal-importar'),
  formularioImportar: document.getElementById('formulario-importar'),
  archivoExcel: document.getElementById('archivo-excel'),
  modoImportacion: document.getElementById('modo-importacion'),
  toast: document.getElementById('notificacion-toast')
};

function normalizar(texto) {
  return String(texto || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function esCategoriaComputo(categoria) {
  const clave = normalizar(categoria);
  return clave === 'laptops' || clave === 'laptop' || clave === 'pc';
}

function cargarPersonalizacion() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_CONFIG_TABLA));
    if (guardado && Array.isArray(guardado.columnas)) {
      const mapa = new Map(COLUMNAS_PREDETERMINADAS.map((col) => [col.clave, col]));
      const ordenadas = [];
      for (const item of guardado.columnas) {
        const base = mapa.get(item.clave);
        if (base) {
          ordenadas.push({ ...base, visible: Boolean(item.visible) });
          mapa.delete(item.clave);
        }
      }
      for (const faltante of mapa.values()) {
        ordenadas.push({ ...faltante });
      }
      return {
        densidad: ['compacta', 'normal', 'amplia'].includes(guardado.densidad)
          ? guardado.densidad
          : 'normal',
        columnas: ordenadas
      };
    }
  } catch {}
  return {
    densidad: 'normal',
    columnas: COLUMNAS_PREDETERMINADAS.map((col) => ({ ...col }))
  };
}

function guardarPersonalizacion() {
  localStorage.setItem(CLAVE_CONFIG_TABLA, JSON.stringify(estadoApp.personalizacion));
}

function mostrarToast(mensaje) {
  el.toast.textContent = mensaje;
  el.toast.classList.remove('oculto');
  clearTimeout(mostrarToast.temporizador);
  mostrarToast.temporizador = setTimeout(() => {
    el.toast.classList.add('oculto');
  }, 3200);
}

async function solicitarApi(url, opciones = {}) {
  const respuesta = await fetch(url, opciones);
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const detalle = Array.isArray(datos.errores) ? datos.errores.join(' ') : datos.mensaje;
    throw new Error(detalle || 'Error en la comunicación con la API.');
  }
  return datos;
}

function obtenerIconoCategoria(categoria) {
  const clave = normalizar(categoria);
  if (clave === 'laptops' || clave === 'laptop') {
    return ICONOS_CATEGORIA.laptops;
  }
  if (clave === 'pc') {
    return ICONOS_CATEGORIA.pc;
  }
  if (clave === 'cables' || clave === 'cable') {
    return ICONOS_CATEGORIA.cables;
  }
  return ICONOS_CATEGORIA.predeterminado;
}

function formatearFecha(iso) {
  if (!iso) {
    return '-';
  }
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    return iso;
  }
  return fecha.toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

function llenarSelectores() {
  el.filtroEstado.innerHTML = '<option value="Todos">Todos los estados</option>';
  el.campoEstado.innerHTML = '';
  for (const est of estadoApp.esquema.estadosValidos) {
    const opFiltro = document.createElement('option');
    opFiltro.value = est;
    opFiltro.textContent = est;
    el.filtroEstado.appendChild(opFiltro);

    const opForm = document.createElement('option');
    opForm.value = est;
    opForm.textContent = est;
    el.campoEstado.appendChild(opForm);
  }

  el.campoCategoria.innerHTML = '';
  for (const cat of estadoApp.esquema.categoriasBase) {
    const opcion = document.createElement('option');
    opcion.value = cat;
    opcion.textContent = cat;
    el.campoCategoria.appendChild(opcion);
  }
  const opcionPersonalizada = document.createElement('option');
  opcionPersonalizada.value = '__otra__';
  opcionPersonalizada.textContent = 'Otra categoría personalizada...';
  el.campoCategoria.appendChild(opcionPersonalizada);
}

function renderizarPestanasCategoria() {
  const categoriasEnDatos = estadoApp.equipos.map((item) => item.categoria).filter(Boolean);
  const unicas = ['Todas', ...new Set([...estadoApp.esquema.categoriasBase, ...categoriasEnDatos])];

  el.pestanasCategoria.innerHTML = '';
  for (const categoria of unicas) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = `pestana-filtro${estadoApp.filtros.categoria === categoria ? ' activa' : ''}`;
    boton.textContent = categoria;
    boton.addEventListener('click', () => {
      estadoApp.filtros.categoria = categoria;
      renderizarPestanasCategoria();
      renderizarTabla();
    });
    el.pestanasCategoria.appendChild(boton);
  }
}

function actualizarResumenKpi() {
  const registros = estadoApp.equipos;
  let unidades = 0;
  let computo = 0;
  let accesorios = 0;

  for (const item of registros) {
    const cant = Number(item.cantidad) || 0;
    unidades += cant;
    if (esCategoriaComputo(item.categoria)) {
      computo += cant;
    } else {
      accesorios += cant;
    }
  }

  el.kpiRegistros.textContent = String(registros.length);
  el.kpiUnidades.textContent = String(unidades);
  el.kpiComputo.textContent = String(computo);
  el.kpiAccesorios.textContent = String(accesorios);
}

function obtenerEquiposFiltradosYOrdenados() {
  const cat = normalizar(estadoApp.filtros.categoria);
  const est = normalizar(estadoApp.filtros.estado);
  const busq = normalizar(estadoApp.filtros.busqueda);

  const filtrados = estadoApp.equipos.filter((item) => {
    if (cat !== 'todas' && normalizar(item.categoria) !== cat) {
      return false;
    }
    if (est !== 'todos' && normalizar(item.estado) !== est) {
      return false;
    }
    if (busq) {
      const texto = normalizar(Object.values(item).join(' '));
      if (!texto.includes(busq)) {
        return false;
      }
    }
    return true;
  });

  const { campo, direccion } = estadoApp.orden;
  const factor = direccion === 'asc' ? 1 : -1;

  return filtrados.sort((a, b) => {
    const valA = a[campo] ?? '';
    const valB = b[campo] ?? '';
    if (campo === 'cantidad') {
      return (Number(valA) - Number(valB)) * factor;
    }
    return String(valA).localeCompare(String(valB), 'es', { numeric: true }) * factor;
  });
}

function renderizarControlesColumnas() {
  el.listaColumnasConfig.innerHTML = '';
  const columnas = estadoApp.personalizacion.columnas;

  columnas.forEach((col, indice) => {
    const fila = document.createElement('div');
    fila.className = 'item-columna-config';

    const etiqueta = document.createElement('label');
    const casilla = document.createElement('input');
    casilla.type = 'checkbox';
    casilla.checked = col.visible;
    casilla.addEventListener('change', () => {
      col.visible = casilla.checked;
      guardarPersonalizacion();
      renderizarTabla();
    });
    etiqueta.appendChild(casilla);
    etiqueta.appendChild(document.createTextNode(col.titulo));

    const controles = document.createElement('div');
    controles.className = 'controles-orden-col';

    const btnSubir = document.createElement('button');
    btnSubir.type = 'button';
    btnSubir.className = 'boton boton-sutil boton-chico';
    btnSubir.textContent = '↑';
    btnSubir.disabled = indice === 0;
    btnSubir.addEventListener('click', () => moverColumna(indice, -1));

    const btnBajar = document.createElement('button');
    btnBajar.type = 'button';
    btnBajar.className = 'boton boton-sutil boton-chico';
    btnBajar.textContent = '↓';
    btnBajar.disabled = indice === columnas.length - 1;
    btnBajar.addEventListener('click', () => moverColumna(indice, 1));

    controles.append(btnSubir, btnBajar);
    fila.append(etiqueta, controles);
    el.listaColumnasConfig.appendChild(fila);
  });

  document.querySelectorAll('input[name="densidad"]').forEach((radio) => {
    radio.checked = radio.value === estadoApp.personalizacion.densidad;
  });
}

function moverColumna(indice, desplazamiento) {
  const cols = estadoApp.personalizacion.columnas;
  const destino = indice + desplazamiento;
  if (destino < 0 || destino >= cols.length) {
    return;
  }
  const [movida] = cols.splice(indice, 1);
  cols.splice(destino, 0, movida);
  guardarPersonalizacion();
  renderizarControlesColumnas();
  renderizarTabla();
}

function aplicarDensidadTabla() {
  el.tablaInventario.className = `tabla-hoja densidad-${estadoApp.personalizacion.densidad}`;
}

function crearCeldaCantidad(item) {
  const contenedor = document.createElement('div');
  contenedor.className = 'control-cantidad';

  const btnMenos = document.createElement('button');
  btnMenos.type = 'button';
  btnMenos.className = 'boton boton-sutil boton-chico';
  btnMenos.textContent = '−';
  btnMenos.title = 'Quitar 1 unidad';
  btnMenos.addEventListener('click', () => ajustarCantidad(item.id, -1));

  const texto = document.createElement('span');
  texto.className = 'valor-cantidad';
  texto.textContent = String(item.cantidad ?? 1);

  const btnMas = document.createElement('button');
  btnMas.type = 'button';
  btnMas.className = 'boton boton-sutil boton-chico';
  btnMas.textContent = '+';
  btnMas.title = 'Agregar 1 unidad';
  btnMas.addEventListener('click', () => ajustarCantidad(item.id, 1));

  contenedor.append(btnMenos, texto, btnMas);
  return contenedor;
}

function activarEdicionCelda(td, item, claveColumna) {
  if (!estadoApp.edicionRapida || td.querySelector('input')) {
    return;
  }
  const valorAnterior = item[claveColumna] || '';
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'entrada-celda-rapida';
  input.value = valorAnterior;
  td.textContent = '';
  td.appendChild(input);
  input.focus();
  input.select();

  const finalizar = async (guardar) => {
    const nuevoValor = input.value.trim();
    if (!guardar || nuevoValor === valorAnterior) {
      renderizarTabla();
      return;
    }
    try {
      const carga = { ...item, [claveColumna]: nuevoValor };
      const resp = await solicitarApi(`/api/equipos/${encodeURIComponent(item.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carga)
      });
      actualizarRegistroLocal(resp.registro);
      mostrarToast('Celda actualizada y guardada en Excel.');
    } catch (error) {
      mostrarToast(error.message);
      renderizarTabla();
    }
  };

  input.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') {
      finalizar(true);
    } else if (evento.key === 'Escape') {
      finalizar(false);
    }
  });
  input.addEventListener('blur', () => finalizar(true));
}

function renderizarTabla() {
  aplicarDensidadTabla();
  const columnasVisibles = estadoApp.personalizacion.columnas.filter((col) => col.visible);
  const filas = obtenerEquiposFiltradosYOrdenados();

  el.contadorResultados.textContent = `Mostrando ${filas.length} de ${estadoApp.equipos.length} registros`;

  const trHead = document.createElement('tr');
  for (const col of columnasVisibles) {
    const th = document.createElement('th');
    const botonOrden = document.createElement('button');
    botonOrden.type = 'button';
    botonOrden.className = 'encabezado-ordenable';
    const indicador =
      estadoApp.orden.campo === col.clave
        ? estadoApp.orden.direccion === 'asc'
          ? ' ▲'
          : ' ▼'
        : '';
    botonOrden.textContent = `${col.titulo}${indicador}`;
    botonOrden.addEventListener('click', () => {
      if (estadoApp.orden.campo === col.clave) {
        estadoApp.orden.direccion = estadoApp.orden.direccion === 'asc' ? 'desc' : 'asc';
      } else {
        estadoApp.orden.campo = col.clave;
        estadoApp.orden.direccion = 'asc';
      }
      renderizarTabla();
    });
    th.appendChild(botonOrden);
    trHead.appendChild(th);
  }
  const thAcciones = document.createElement('th');
  thAcciones.textContent = 'Acciones';
  trHead.appendChild(thAcciones);
  el.encabezadoTabla.innerHTML = '';
  el.encabezadoTabla.appendChild(trHead);

  el.cuerpoTabla.innerHTML = '';
  if (filas.length === 0) {
    el.estadoVacio.classList.remove('oculto');
    return;
  }
  el.estadoVacio.classList.add('oculto');

  for (const item of filas) {
    const tr = document.createElement('tr');

    for (const col of columnasVisibles) {
      const td = document.createElement('td');

      if (col.clave === 'categoria') {
        const envoltorio = document.createElement('span');
        envoltorio.className = 'celda-categoria';
        const icono = document.createElement('span');
        icono.className = 'icono-categoria';
        icono.innerHTML = obtenerIconoCategoria(item.categoria);
        envoltorio.append(icono, document.createTextNode(item.categoria || '-'));
        td.appendChild(envoltorio);
      } else if (col.clave === 'cantidad') {
        td.appendChild(crearCeldaCantidad(item));
      } else if (col.clave === 'estado') {
        const badge = document.createElement('span');
        badge.className = `insignia-tabla${item.estado === 'Disponible' ? ' destacada' : ''}`;
        badge.textContent = item.estado || 'Disponible';
        td.appendChild(badge);
      } else if (col.clave === 'actualizado_en') {
        td.textContent = formatearFecha(item.actualizado_en);
      } else {
        td.textContent = item[col.clave] || '—';
        if (estadoApp.edicionRapida && col.editable) {
          td.classList.add('celda-editable');
          td.title = 'Haz doble clic para editar directamente';
          td.addEventListener('dblclick', () => activarEdicionCelda(td, item, col.clave));
        }
      }

      tr.appendChild(td);
    }

    const tdAcciones = document.createElement('td');
    const grupo = document.createElement('div');
    grupo.className = 'acciones-fila';

    const btnEditar = document.createElement('button');
    btnEditar.type = 'button';
    btnEditar.className = 'boton boton-sutil boton-chico';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => abrirModalEquipo(item));

    const btnEliminar = document.createElement('button');
    btnEliminar.type = 'button';
    btnEliminar.className = 'boton boton-secundario boton-chico';
    btnEliminar.textContent = 'Quitar';
    btnEliminar.addEventListener('click', () => eliminarEquipo(item));

    grupo.append(btnEditar, btnEliminar);
    tdAcciones.appendChild(grupo);
    tr.appendChild(tdAcciones);
    el.cuerpoTabla.appendChild(tr);
  }
}

function actualizarVisibilidadHardware() {
  const seleccion = el.campoCategoria.value;
  const esOtra = seleccion === '__otra__';
  el.envolturaOtraCategoria.classList.toggle('oculto', !esOtra);

  const categoriaReal = esOtra ? el.campoOtraCategoria.value : seleccion;
  const mostrarSpecs = esCategoriaComputo(categoriaReal);
  el.bloqueHardware.classList.toggle('oculto', !mostrarSpecs);
}

function abrirModalEquipo(item = null) {
  el.alertaFormulario.classList.add('oculto');
  el.formularioEquipo.reset();

  if (item) {
    el.tituloModal.textContent = `Editar registro ${item.id}`;
    el.campoId.value = item.id;
    const existeEnBase = estadoApp.esquema.categoriasBase.includes(item.categoria);
    if (existeEnBase) {
      el.campoCategoria.value = item.categoria;
      el.campoOtraCategoria.value = '';
    } else {
      el.campoCategoria.value = '__otra__';
      el.campoOtraCategoria.value = item.categoria || '';
    }
    el.campoMarca.value = item.marca || '';
    el.campoModelo.value = item.modelo || '';
    el.campoSerie.value = item.serie || '';
    el.campoCantidad.value = item.cantidad ?? 1;
    el.campoEstado.value = item.estado || 'Disponible';
    el.campoUbicacion.value = item.ubicacion || '';
    el.campoProcesador.value = item.procesador || '';
    el.campoRam.value = item.ram || '';
    el.campoTipoAlmacenamiento.value = item.tipo_almacenamiento || '';
    el.campoCapacidadAlmacenamiento.value = item.capacidad_almacenamiento || '';
    el.campoTarjetaGrafica.value = item.tarjeta_grafica || '';
  } else {
    el.tituloModal.textContent = 'Agregar equipo al inventario';
    el.campoId.value = '';
    const filtroActivo = estadoApp.filtros.categoria;
    if (filtroActivo !== 'Todas' && estadoApp.esquema.categoriasBase.includes(filtroActivo)) {
      el.campoCategoria.value = filtroActivo;
    } else {
      el.campoCategoria.value = 'Laptops';
    }
    el.campoCantidad.value = 1;
    el.campoEstado.value = 'Disponible';
  }

  actualizarVisibilidadHardware();
  el.modalEquipo.showModal();
}

function actualizarRegistroLocal(registro) {
  const indice = estadoApp.equipos.findIndex((item) => item.id === registro.id);
  if (indice >= 0) {
    estadoApp.equipos[indice] = registro;
  } else {
    estadoApp.equipos.unshift(registro);
  }
  actualizarResumenKpi();
  renderizarPestanasCategoria();
  renderizarTabla();
}

async function guardarEquipo(evento) {
  evento.preventDefault();
  el.alertaFormulario.classList.add('oculto');

  const categoria =
    el.campoCategoria.value === '__otra__'
      ? el.campoOtraCategoria.value.trim()
      : el.campoCategoria.value;

  const cuerpo = {
    categoria,
    marca: el.campoMarca.value,
    modelo: el.campoModelo.value,
    serie: el.campoSerie.value,
    cantidad: Number(el.campoCantidad.value),
    estado: el.campoEstado.value,
    ubicacion: el.campoUbicacion.value,
    procesador: esCategoriaComputo(categoria) ? el.campoProcesador.value : '',
    ram: esCategoriaComputo(categoria) ? el.campoRam.value : '',
    tipo_almacenamiento: esCategoriaComputo(categoria) ? el.campoTipoAlmacenamiento.value : '',
    capacidad_almacenamiento: esCategoriaComputo(categoria)
      ? el.campoCapacidadAlmacenamiento.value
      : '',
    tarjeta_grafica: esCategoriaComputo(categoria) ? el.campoTarjetaGrafica.value : ''
  };

  const id = el.campoId.value;
  const ruta = id ? `/api/equipos/${encodeURIComponent(id)}` : '/api/equipos';
  const metodo = id ? 'PUT' : 'POST';

  try {
    const respuesta = await solicitarApi(ruta, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo)
    });
    actualizarRegistroLocal(respuesta.registro);
    el.modalEquipo.close();
    mostrarToast(respuesta.mensaje);
  } catch (error) {
    el.alertaFormulario.textContent = error.message;
    el.alertaFormulario.classList.remove('oculto');
  }
}

async function ajustarCantidad(id, delta) {
  try {
    const respuesta = await solicitarApi(`/api/equipos/${encodeURIComponent(id)}/cantidad`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta })
    });
    actualizarRegistroLocal(respuesta.registro);
    mostrarToast(`Existencias actualizadas en Excel (${respuesta.registro.cantidad}).`);
  } catch (error) {
    mostrarToast(error.message);
  }
}

async function eliminarEquipo(item) {
  const confirmado = window.confirm(
    `¿Deseas quitar del inventario "${item.marca} ${item.modelo}" (Serie: ${item.serie})?`
  );
  if (!confirmado) {
    return;
  }

  try {
    const respuesta = await solicitarApi(`/api/equipos/${encodeURIComponent(item.id)}`, {
      method: 'DELETE'
    });
    estadoApp.equipos = estadoApp.equipos.filter((actual) => actual.id !== item.id);
    actualizarResumenKpi();
    renderizarPestanasCategoria();
    renderizarTabla();
    mostrarToast(respuesta.mensaje);
  } catch (error) {
    mostrarToast(error.message);
  }
}

async function cargarConfiguracionExcel() {
  try {
    const config = await solicitarApi('/api/excel/configuracion');
    el.configRutaExcel.value = config.rutaArchivo || '';
    el.configEnlaceWeb.value = config.enlaceExcelWeb || '';
    if (config.enlaceExcelWeb) {
      el.enlaceExcelWeb.href = config.enlaceExcelWeb;
      el.enlaceExcelWeb.classList.remove('oculto');
    } else {
      el.enlaceExcelWeb.classList.add('oculto');
    }
    const nombreArchivo = (config.rutaArchivo || '').split(/[/\\]/).pop();
    el.estadoExcel.textContent = nombreArchivo
      ? `Excel activo: ${nombreArchivo}`
      : 'Libro Excel activo';
  } catch {}
}

async function cargarDatosIniciales() {
  try {
    const [esquema, datosInventario] = await Promise.all([
      solicitarApi('/api/esquema'),
      solicitarApi('/api/equipos')
    ]);
    estadoApp.esquema = esquema;
    estadoApp.equipos = datosInventario.equipos || [];
    llenarSelectores();
    actualizarResumenKpi();
    renderizarPestanasCategoria();
    renderizarControlesColumnas();
    renderizarTabla();
    await cargarConfiguracionExcel();
  } catch (error) {
    mostrarToast(error.message);
  }
}

function registrarEventos() {
  el.entradaBusqueda.addEventListener('input', () => {
    estadoApp.filtros.busqueda = el.entradaBusqueda.value;
    renderizarTabla();
  });

  el.filtroEstado.addEventListener('change', () => {
    estadoApp.filtros.estado = el.filtroEstado.value;
    renderizarTabla();
  });

  document.querySelectorAll('.tarjeta-resumen').forEach((tarjeta) => {
    tarjeta.addEventListener('click', () => {
      estadoApp.filtros.categoria = tarjeta.dataset.filtroRapido || 'Todas';
      renderizarPestanasCategoria();
      renderizarTabla();
    });
  });

  el.btnEdicionCelda.addEventListener('click', () => {
    estadoApp.edicionRapida = !estadoApp.edicionRapida;
    el.btnEdicionCelda.setAttribute('aria-pressed', String(estadoApp.edicionRapida));
    el.btnEdicionCelda.textContent = estadoApp.edicionRapida
      ? 'Edición rápida Excel: Activa (doble clic)'
      : 'Edición rápida Excel: Apagada';
    renderizarTabla();
  });

  el.btnPersonalizar.addEventListener('click', () => {
    const abierto = el.panelPersonalizacion.classList.toggle('oculto') === false;
    el.btnPersonalizar.setAttribute('aria-expanded', String(abierto));
  });

  document.querySelectorAll('[data-preset]').forEach((boton) => {
    boton.addEventListener('click', () => {
      const visibles = new Set(PRESETS_COLUMNAS[boton.dataset.preset] || []);
      estadoApp.personalizacion.columnas.forEach((col) => {
        col.visible = visibles.has(col.clave);
      });
      guardarPersonalizacion();
      renderizarControlesColumnas();
      renderizarTabla();
    });
  });

  document.getElementById('btn-restablecer-tabla').addEventListener('click', () => {
    estadoApp.personalizacion = {
      densidad: 'normal',
      columnas: COLUMNAS_PREDETERMINADAS.map((col) => ({ ...col }))
    };
    guardarPersonalizacion();
    renderizarControlesColumnas();
    renderizarTabla();
    mostrarToast('Personalización de tabla restablecida.');
  });

  document.querySelectorAll('input[name="densidad"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        estadoApp.personalizacion.densidad = radio.value;
        guardarPersonalizacion();
        aplicarDensidadTabla();
      }
    });
  });

  document.getElementById('btn-nuevo').addEventListener('click', () => abrirModalEquipo());
  document.getElementById('btn-vacio-agregar').addEventListener('click', () => abrirModalEquipo());
  document.getElementById('btn-cerrar-modal').addEventListener('click', () => el.modalEquipo.close());
  document.getElementById('btn-cancelar-modal').addEventListener('click', () => el.modalEquipo.close());

  el.campoCategoria.addEventListener('change', actualizarVisibilidadHardware);
  el.campoOtraCategoria.addEventListener('input', actualizarVisibilidadHardware);
  el.formularioEquipo.addEventListener('submit', guardarEquipo);

  document.getElementById('btn-config-excel').addEventListener('click', async () => {
    await cargarConfiguracionExcel();
    el.modalExcelWeb.showModal();
  });
  document.getElementById('btn-cerrar-excel').addEventListener('click', () => el.modalExcelWeb.close());
  document.getElementById('btn-cancelar-excel').addEventListener('click', () => el.modalExcelWeb.close());

  el.formularioExcelWeb.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    try {
      const resp = await solicitarApi('/api/excel/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rutaArchivo: el.configRutaExcel.value,
          enlaceExcelWeb: el.configEnlaceWeb.value
        })
      });
      el.modalExcelWeb.close();
      mostrarToast(resp.mensaje);
      await cargarDatosIniciales();
    } catch (error) {
      mostrarToast(error.message);
    }
  });

  document.getElementById('btn-importar').addEventListener('click', () => {
    el.formularioImportar.reset();
    el.modalImportar.showModal();
  });
  document.getElementById('btn-cerrar-importar').addEventListener('click', () => el.modalImportar.close());
  document.getElementById('btn-cancelar-importar').addEventListener('click', () => el.modalImportar.close());

  el.formularioImportar.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const archivo = el.archivoExcel.files[0];
    if (!archivo) {
      mostrarToast('Selecciona un archivo .xlsx para importar.');
      return;
    }
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('modo', el.modoImportacion.value);

    try {
      const resp = await solicitarApi('/api/excel/importar', {
        method: 'POST',
        body: formData
      });
      el.modalImportar.close();
      mostrarToast(
        `${resp.mensaje} (${resp.resumen.agregados} agregados, ${resp.resumen.actualizados} actualizados)`
      );
      await cargarDatosIniciales();
    } catch (error) {
      mostrarToast(error.message);
    }
  });
}

registrarEventos();
cargarDatosIniciales();
