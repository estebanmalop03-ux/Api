const CATEGORIAS_EQUIPO = ['Laptops', 'PC'];

const CATEGORIAS_BASE = [
  'Laptops',
  'PC',
  'Cables',
  'Monitores',
  'Periféricos',
  'Redes',
  'Otros'
];

const ESTADOS_VALIDOS = ['Disponible', 'En uso', 'Mantenimiento', 'Baja'];

const CAMPOS_BASE = ['categoria', 'marca', 'modelo', 'serie'];

const CAMPOS_HARDWARE = [
  'procesador',
  'ram',
  'tipo_almacenamiento',
  'capacidad_almacenamiento',
  'tarjeta_grafica'
];

const ETIQUETAS_CAMPO = {
  categoria: 'Categoría',
  marca: 'Marca',
  modelo: 'Modelo',
  serie: 'Serie',
  procesador: 'Procesador',
  ram: 'RAM',
  tipo_almacenamiento: 'Tipo de almacenamiento',
  capacidad_almacenamiento: 'Capacidad de almacenamiento',
  tarjeta_grafica: 'Tarjeta gráfica',
  cantidad: 'Cantidad',
  estado: 'Estado',
  ubicacion: 'Ubicación'
};

function limpiarTexto(valor) {
  if (valor === undefined || valor === null) {
    return '';
  }
  return String(valor).trim();
}

function normalizarClave(texto) {
  return limpiarTexto(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function requiereEspecificaciones(categoria) {
  const clave = normalizarClave(categoria);
  return clave === 'laptops' || clave === 'laptop' || clave === 'pc';
}

function normalizarCategoria(categoria) {
  const texto = limpiarTexto(categoria);
  if (!texto) {
    return '';
  }
  const clave = normalizarClave(texto);
  const encontrada = CATEGORIAS_BASE.find((item) => normalizarClave(item) === clave);
  if (encontrada) {
    return encontrada;
  }
  if (clave === 'laptop') {
    return 'Laptops';
  }
  if (clave === 'cable') {
    return 'Cables';
  }
  return texto;
}

function validarEquipo(entrada) {
  const errores = [];
  const categoria = normalizarCategoria(entrada.categoria);
  const marca = limpiarTexto(entrada.marca);
  const modelo = limpiarTexto(entrada.modelo);
  const serie = limpiarTexto(entrada.serie);
  const ubicacion = limpiarTexto(entrada.ubicacion);
  const estadoEntrada = limpiarTexto(entrada.estado);
  const estado = ESTADOS_VALIDOS.includes(estadoEntrada) ? estadoEntrada : 'Disponible';

  let cantidad = 1;
  if (entrada.cantidad !== undefined && entrada.cantidad !== null && entrada.cantidad !== '') {
    const numero = Number(entrada.cantidad);
    if (!Number.isInteger(numero) || numero < 0) {
      errores.push('La cantidad debe ser un número entero igual o mayor a 0.');
    } else {
      cantidad = numero;
    }
  }

  const datosLimpios = {
    categoria,
    marca,
    modelo,
    serie,
    procesador: limpiarTexto(entrada.procesador),
    ram: limpiarTexto(entrada.ram),
    tipo_almacenamiento: limpiarTexto(entrada.tipo_almacenamiento),
    capacidad_almacenamiento: limpiarTexto(entrada.capacidad_almacenamiento),
    tarjeta_grafica: limpiarTexto(entrada.tarjeta_grafica),
    cantidad,
    estado,
    ubicacion
  };

  for (const campo of CAMPOS_BASE) {
    if (!datosLimpios[campo]) {
      errores.push(`El campo "${ETIQUETAS_CAMPO[campo]}" es obligatorio.`);
    }
  }

  if (requiereEspecificaciones(categoria)) {
    for (const campo of CAMPOS_HARDWARE) {
      if (!datosLimpios[campo]) {
        errores.push(
          `Para la categoría "${categoria}", el campo "${ETIQUETAS_CAMPO[campo]}" es obligatorio.`
        );
      }
    }
  }

  return {
    valido: errores.length === 0,
    errores,
    datosLimpios
  };
}

module.exports = {
  CATEGORIAS_EQUIPO,
  CATEGORIAS_BASE,
  ESTADOS_VALIDOS,
  CAMPOS_BASE,
  CAMPOS_HARDWARE,
  ETIQUETAS_CAMPO,
  limpiarTexto,
  normalizarClave,
  requiereEspecificaciones,
  normalizarCategoria,
  validarEquipo
};
