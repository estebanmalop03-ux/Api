const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const {
  limpiarTexto,
  normalizarClave,
  normalizarCategoria,
  ESTADOS_VALIDOS
} = require('./validacion');

const DIRECTORIO_DATOS = path.join(__dirname, '..', 'datos');
const RUTA_CONFIGURACION = path.join(DIRECTORIO_DATOS, 'configuracion.json');
const RUTA_EXCEL_PREDETERMINADA = path.join(DIRECTORIO_DATOS, 'inventario.xlsx');

const COLUMNAS_EXCEL = [
  { clave: 'id', titulo: 'ID', ancho: 12 },
  { clave: 'categoria', titulo: 'Categoría', ancho: 16 },
  { clave: 'marca', titulo: 'Marca', ancho: 16 },
  { clave: 'modelo', titulo: 'Modelo', ancho: 22 },
  { clave: 'serie', titulo: 'Serie', ancho: 22 },
  { clave: 'procesador', titulo: 'Procesador', ancho: 24 },
  { clave: 'ram', titulo: 'RAM', ancho: 14 },
  { clave: 'tipo_almacenamiento', titulo: 'Tipo de almacenamiento', ancho: 24 },
  { clave: 'capacidad_almacenamiento', titulo: 'Capacidad de almacenamiento', ancho: 26 },
  { clave: 'tarjeta_grafica', titulo: 'Tarjeta gráfica', ancho: 26 },
  { clave: 'cantidad', titulo: 'Cantidad', ancho: 12 },
  { clave: 'estado', titulo: 'Estado', ancho: 16 },
  { clave: 'ubicacion', titulo: 'Ubicación', ancho: 18 },
  { clave: 'actualizado_en', titulo: 'Actualizado', ancho: 22 }
];

const MAPA_ENCABEZADOS = {
  id: 'id',
  categoria: 'categoria',
  marca: 'marca',
  modelo: 'modelo',
  serie: 'serie',
  procesador: 'procesador',
  ram: 'ram',
  'tipo de almacenamiento': 'tipo_almacenamiento',
  tipo_almacenamiento: 'tipo_almacenamiento',
  'capacidad de almacenamiento': 'capacidad_almacenamiento',
  'capacidad del almacenamiento': 'capacidad_almacenamiento',
  capacidad_almacenamiento: 'capacidad_almacenamiento',
  'tarjeta grafica': 'tarjeta_grafica',
  tarjeta_grafica: 'tarjeta_grafica',
  cantidad: 'cantidad',
  estado: 'estado',
  ubicacion: 'ubicacion',
  actualizado: 'actualizado_en',
  actualizado_en: 'actualizado_en'
};

const DATOS_INICIALES = [
  {
    id: 'INV-0001',
    categoria: 'Laptops',
    marca: 'Lenovo',
    modelo: 'ThinkPad T14 Gen 4',
    serie: 'PF4X91L0',
    procesador: 'Intel Core i7-1355U',
    ram: '16 GB DDR5',
    tipo_almacenamiento: 'SSD NVMe',
    capacidad_almacenamiento: '512 GB',
    tarjeta_grafica: 'Intel Iris Xe',
    cantidad: 1,
    estado: 'Disponible',
    ubicacion: 'Almacén Central',
    actualizado_en: new Date().toISOString()
  },
  {
    id: 'INV-0002',
    categoria: 'PC',
    marca: 'Dell',
    modelo: 'OptiPlex 7010 Tower',
    serie: '8H2K9Y3',
    procesador: 'Intel Core i5-13500',
    ram: '32 GB DDR4',
    tipo_almacenamiento: 'SSD NVMe',
    capacidad_almacenamiento: '1 TB',
    tarjeta_grafica: 'NVIDIA GTX 1660 Super',
    cantidad: 1,
    estado: 'En uso',
    ubicacion: 'Área de Sistemas',
    actualizado_en: new Date().toISOString()
  },
  {
    id: 'INV-0003',
    categoria: 'Cables',
    marca: 'Ugreen',
    modelo: 'HDMI 2.1 Ultra Alta Velocidad 2m',
    serie: 'UG-HD21-2026',
    procesador: '',
    ram: '',
    tipo_almacenamiento: '',
    capacidad_almacenamiento: '',
    tarjeta_grafica: '',
    cantidad: 12,
    estado: 'Disponible',
    ubicacion: 'Estante B2',
    actualizado_en: new Date().toISOString()
  }
];

let colaOperaciones = Promise.resolve();

function encolar(tarea) {
  const ejecucion = colaOperaciones.then(tarea, tarea);
  colaOperaciones = ejecucion.catch(() => {});
  return ejecucion;
}

function asegurarDirectorio(rutaArchivo) {
  const carpeta = path.dirname(rutaArchivo);
  if (!fs.existsSync(carpeta)) {
    fs.mkdirSync(carpeta, { recursive: true });
  }
}

function leerConfiguracion() {
  asegurarDirectorio(RUTA_CONFIGURACION);
  if (!fs.existsSync(RUTA_CONFIGURACION)) {
    const inicial = {
      rutaArchivo: RUTA_EXCEL_PREDETERMINADA,
      enlaceExcelWeb: ''
    };
    fs.writeFileSync(RUTA_CONFIGURACION, JSON.stringify(inicial, null, 2), 'utf8');
    return inicial;
  }
  try {
    const contenido = JSON.parse(fs.readFileSync(RUTA_CONFIGURACION, 'utf8'));
    return {
      rutaArchivo: limpiarTexto(contenido.rutaArchivo) || RUTA_EXCEL_PREDETERMINADA,
      enlaceExcelWeb: limpiarTexto(contenido.enlaceExcelWeb)
    };
  } catch {
    return {
      rutaArchivo: RUTA_EXCEL_PREDETERMINADA,
      enlaceExcelWeb: ''
    };
  }
}

function guardarConfiguracion(nuevaConfig) {
  const actual = leerConfiguracion();
  const actualizada = {
    rutaArchivo: limpiarTexto(nuevaConfig.rutaArchivo) || actual.rutaArchivo,
    enlaceExcelWeb:
      nuevaConfig.enlaceExcelWeb !== undefined
        ? limpiarTexto(nuevaConfig.enlaceExcelWeb)
        : actual.enlaceExcelWeb
  };
  if (!actualizada.rutaArchivo.toLowerCase().endsWith('.xlsx')) {
    throw new Error('La ruta del archivo debe terminar en .xlsx');
  }
  asegurarDirectorio(RUTA_CONFIGURACION);
  fs.writeFileSync(RUTA_CONFIGURACION, JSON.stringify(actualizada, null, 2), 'utf8');
  return actualizada;
}

function generarSiguienteId(equipos) {
  let maximo = 0;
  for (const item of equipos) {
    const coincidencia = /^INV-(\d+)$/i.exec(limpiarTexto(item.id));
    if (coincidencia) {
      const numero = Number(coincidencia[1]);
      if (numero > maximo) {
        maximo = numero;
      }
    }
  }
  return `INV-${String(maximo + 1).padStart(4, '0')}`;
}

function extraerValorCelda(celda) {
  if (celda === undefined || celda === null) {
    return '';
  }
  if (typeof celda === 'object') {
    if (celda.text !== undefined) {
      return limpiarTexto(celda.text);
    }
    if (celda.result !== undefined) {
      return limpiarTexto(celda.result);
    }
    if (Array.isArray(celda.richText)) {
      return limpiarTexto(celda.richText.map((parte) => parte.text).join(''));
    }
  }
  return limpiarTexto(celda);
}

function leerHojaAEquipos(hoja) {
  if (!hoja || hoja.rowCount < 2) {
    return [];
  }
  const encabezados = {};
  const filaEncabezado = hoja.getRow(1);
  filaEncabezado.eachCell((celda, indiceColumna) => {
    const nombreNormalizado = normalizarClave(extraerValorCelda(celda.value));
    const claveMapeada = MAPA_ENCABEZADOS[nombreNormalizado];
    if (claveMapeada) {
      encabezados[indiceColumna] = claveMapeada;
    }
  });

  const equipos = [];
  for (let filaIdx = 2; filaIdx <= hoja.rowCount; filaIdx++) {
    const fila = hoja.getRow(filaIdx);
    const registro = {
      id: '',
      categoria: '',
      marca: '',
      modelo: '',
      serie: '',
      procesador: '',
      ram: '',
      tipo_almacenamiento: '',
      capacidad_almacenamiento: '',
      tarjeta_grafica: '',
      cantidad: 1,
      estado: 'Disponible',
      ubicacion: '',
      actualizado_en: new Date().toISOString()
    };

    let tieneContenido = false;
    for (const [colStr, clave] of Object.entries(encabezados)) {
      const valor = extraerValorCelda(fila.getCell(Number(colStr)).value);
      if (valor !== '') {
        tieneContenido = true;
      }
      if (clave === 'cantidad') {
        const num = Number(valor);
        registro.cantidad = Number.isInteger(num) && num >= 0 ? num : 1;
      } else if (clave === 'categoria') {
        registro.categoria = normalizarCategoria(valor);
      } else if (clave === 'estado') {
        registro.estado = ESTADOS_VALIDOS.includes(valor) ? valor : 'Disponible';
      } else {
        registro[clave] = valor;
      }
    }

    if (tieneContenido && (registro.categoria || registro.marca || registro.modelo || registro.serie)) {
      equipos.push(registro);
    }
  }

  for (const equipo of equipos) {
    if (!equipo.id) {
      equipo.id = generarSiguienteId(equipos);
    }
  }

  return equipos;
}

function aplicarEstiloEncabezado(fila) {
  fila.height = 26;
  fila.eachCell((celda) => {
    celda.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFF6EFE6' } };
    celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3A261E' } };
    celda.alignment = { vertical: 'middle', horizontal: 'left' };
    celda.border = {
      top: { style: 'thin', color: { argb: 'FF3A261E' } },
      bottom: { style: 'medium', color: { argb: 'FFC2602B' } },
      left: { style: 'thin', color: { argb: 'FF3A261E' } },
      right: { style: 'thin', color: { argb: 'FF3A261E' } }
    };
  });
}

function aplicarEstiloFila(fila, indice) {
  fila.height = 22;
  const fondo = indice % 2 === 0 ? 'FFF6EFE6' : 'FFFFFFFF';
  fila.eachCell((celda, numeroColumna) => {
    celda.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF3A261E' } };
    celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fondo } };
    celda.alignment = {
      vertical: 'middle',
      horizontal: numeroColumna === 11 ? 'center' : 'left'
    };
    celda.border = {
      bottom: { style: 'thin', color: { argb: 'FFC2602B' } },
      left: { style: 'thin', color: { argb: 'FF3A261E' } },
      right: { style: 'thin', color: { argb: 'FF3A261E' } }
    };
  });
}

function construirResumen(equipos) {
  const porCategoria = {};
  let totalUnidades = 0;

  for (const item of equipos) {
    const cat = item.categoria || 'Otros';
    if (!porCategoria[cat]) {
      porCategoria[cat] = { categoria: cat, registros: 0, unidades: 0 };
    }
    porCategoria[cat].registros += 1;
    porCategoria[cat].unidades += Number(item.cantidad) || 0;
    totalUnidades += Number(item.cantidad) || 0;
  }

  return {
    totalRegistros: equipos.length,
    totalUnidades,
    porCategoria: Object.values(porCategoria)
  };
}

async function escribirLibroExcel(rutaDestino, equipos) {
  asegurarDirectorio(rutaDestino);
  const libro = new ExcelJS.Workbook();
  libro.creator = 'Sistema de Inventario Web';
  libro.modified = new Date();

  const hojaInventario = libro.addWorksheet('Inventario', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  hojaInventario.columns = COLUMNAS_EXCEL.map((col) => ({
    header: col.titulo,
    key: col.clave,
    width: col.ancho
  }));

  aplicarEstiloEncabezado(hojaInventario.getRow(1));

  equipos.forEach((equipo, indice) => {
    const fila = hojaInventario.addRow(equipo);
    aplicarEstiloFila(fila, indice);
  });

  hojaInventario.autoFilter = {
    from: 'A1',
    to: `N${Math.max(1, equipos.length + 1)}`
  };

  const hojaResumen = libro.addWorksheet('Resumen');
  hojaResumen.columns = [
    { header: 'Categoría', key: 'categoria', width: 24 },
    { header: 'Registros', key: 'registros', width: 16 },
    { header: 'Unidades totales', key: 'unidades', width: 20 }
  ];
  aplicarEstiloEncabezado(hojaResumen.getRow(1));

  const resumen = construirResumen(equipos);
  resumen.porCategoria.forEach((filaResumen, idx) => {
    const fila = hojaResumen.addRow(filaResumen);
    aplicarEstiloFila(fila, idx);
  });

  const filaTotal = hojaResumen.addRow({
    categoria: 'TOTAL GENERAL',
    registros: resumen.totalRegistros,
    unidades: resumen.totalUnidades
  });
  filaTotal.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFC2602B' } };

  await libro.xlsx.writeFile(rutaDestino);
}

async function cargarEquiposInterno() {
  const { rutaArchivo } = leerConfiguracion();
  if (!fs.existsSync(rutaArchivo)) {
    await escribirLibroExcel(rutaArchivo, DATOS_INICIALES);
    return DATOS_INICIALES.map((item) => ({ ...item }));
  }

  const libro = new ExcelJS.Workbook();
  await libro.xlsx.readFile(rutaArchivo);
  const hoja = libro.getWorksheet('Inventario') || libro.worksheets[0];
  return leerHojaAEquipos(hoja);
}

function obtenerEquipos() {
  return encolar(() => cargarEquiposInterno());
}

function guardarEquipos(equipos) {
  return encolar(async () => {
    const { rutaArchivo } = leerConfiguracion();
    await escribirLibroExcel(rutaArchivo, equipos);
    return equipos;
  });
}

function operarInventario(transformador) {
  return encolar(async () => {
    const { rutaArchivo } = leerConfiguracion();
    const equiposActuales = await cargarEquiposInterno();
    const resultado = await transformador(equiposActuales);
    if (resultado && Array.isArray(resultado.equipos)) {
      await escribirLibroExcel(rutaArchivo, resultado.equipos);
    }
    return resultado;
  });
}

async function importarDesdeBuffer(buffer, modo = 'agregar') {
  const libroImportado = new ExcelJS.Workbook();
  await libroImportado.xlsx.load(buffer);
  const hoja = libroImportado.getWorksheet('Inventario') || libroImportado.worksheets[0];
  const registrosImportados = leerHojaAEquipos(hoja);

  if (registrosImportados.length === 0) {
    throw new Error('El archivo Excel no contiene registros válidos en la hoja.');
  }

  return operarInventario((existentes) => {
    const base = modo === 'reemplazar' ? [] : [...existentes];
    let agregados = 0;
    let actualizados = 0;

    for (const item of registrosImportados) {
      const claveSerie = normalizarClave(item.serie);
      const indiceExistente = claveSerie
        ? base.findIndex((actual) => normalizarClave(actual.serie) === claveSerie)
        : -1;

      if (indiceExistente >= 0) {
        base[indiceExistente] = {
          ...base[indiceExistente],
          ...item,
          id: base[indiceExistente].id,
          actualizado_en: new Date().toISOString()
        };
        actualizados += 1;
      } else {
        base.push({
          ...item,
          id: generarSiguienteId(base),
          actualizado_en: new Date().toISOString()
        });
        agregados += 1;
      }
    }

    return {
      equipos: base,
      resumenImportacion: { agregados, actualizados, total: base.length }
    };
  });
}

async function generarBufferExportacion() {
  return encolar(async () => {
    const { rutaArchivo } = leerConfiguracion();
    await cargarEquiposInterno();
    return fs.promises.readFile(rutaArchivo);
  });
}

module.exports = {
  COLUMNAS_EXCEL,
  leerConfiguracion,
  guardarConfiguracion,
  generarSiguienteId,
  construirResumen,
  obtenerEquipos,
  guardarEquipos,
  operarInventario,
  importarDesdeBuffer,
  generarBufferExportacion
};
