const path = require('path');
const express = require('express');
const multer = require('multer');
const {
  CATEGORIAS_BASE,
  CATEGORIAS_EQUIPO,
  ESTADOS_VALIDOS,
  CAMPOS_BASE,
  CAMPOS_HARDWARE,
  limpiarTexto,
  normalizarClave,
  validarEquipo
} = require('./servicios/validacion');
const {
  COLUMNAS_EXCEL,
  leerConfiguracion,
  guardarConfiguracion,
  generarSiguienteId,
  construirResumen,
  obtenerEquipos,
  operarInventario,
  importarDesdeBuffer,
  generarBufferExportacion
} = require('./servicios/almacenExcel');

const aplicacion = express();
const PUERTO = process.env.PORT || 3000;
const cargaMemoria = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

aplicacion.use(express.json({ limit: '2mb' }));
aplicacion.use(express.static(path.join(__dirname, 'public')));

function filtrarEquipos(equipos, consulta) {
  const catFiltro = normalizarClave(consulta.categoria);
  const estFiltro = normalizarClave(consulta.estado);
  const textoBusqueda = normalizarClave(consulta.busqueda);

  return equipos.filter((item) => {
    if (catFiltro && catFiltro !== 'todas' && normalizarClave(item.categoria) !== catFiltro) {
      return false;
    }
    if (estFiltro && estFiltro !== 'todos' && normalizarClave(item.estado) !== estFiltro) {
      return false;
    }
    if (textoBusqueda) {
      const combinado = normalizarClave(
        [
          item.id,
          item.categoria,
          item.marca,
          item.modelo,
          item.serie,
          item.procesador,
          item.ram,
          item.tipo_almacenamiento,
          item.capacidad_almacenamiento,
          item.tarjeta_grafica,
          item.ubicacion
        ].join(' ')
      );
      if (!combinado.includes(textoBusqueda)) {
        return false;
      }
    }
    return true;
  });
}

aplicacion.get('/api/salud', async (_req, res) => {
  try {
    const config = leerConfiguracion();
    const equipos = await obtenerEquipos();
    res.json({
      estado: 'activo',
      totalRegistros: equipos.length,
      rutaArchivo: config.rutaArchivo,
      enlaceExcelWeb: config.enlaceExcelWeb
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar el estado del sistema.', detalle: error.message });
  }
});

aplicacion.get('/api/esquema', (_req, res) => {
  res.json({
    categoriasBase: CATEGORIAS_BASE,
    categoriasHardware: CATEGORIAS_EQUIPO,
    estadosValidos: ESTADOS_VALIDOS,
    camposBase: CAMPOS_BASE,
    camposHardware: CAMPOS_HARDWARE,
    columnas: COLUMNAS_EXCEL
  });
});

aplicacion.get('/api/equipos', async (req, res) => {
  try {
    const equipos = await obtenerEquipos();
    const filtrados = filtrarEquipos(equipos, req.query);
    res.json({
      total: filtrados.length,
      resumen: construirResumen(equipos),
      equipos: filtrados
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudo leer el inventario desde Excel.', detalle: error.message });
  }
});

aplicacion.get('/api/equipos/:id', async (req, res) => {
  try {
    const equipos = await obtenerEquipos();
    const encontrado = equipos.find((item) => item.id === req.params.id);
    if (!encontrado) {
      return res.status(404).json({ mensaje: 'Registro no encontrado en el inventario.' });
    }
    res.json(encontrado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar el registro.', detalle: error.message });
  }
});

aplicacion.post('/api/equipos', async (req, res) => {
  const validacion = validarEquipo(req.body || {});
  if (!validacion.valido) {
    return res.status(400).json({
      mensaje: 'Datos incompletos o inválidos para el registro.',
      errores: validacion.errores
    });
  }

  try {
    const resultado = await operarInventario((equipos) => {
      const serieNueva = normalizarClave(validacion.datosLimpios.serie);
      const duplicado = equipos.find((item) => normalizarClave(item.serie) === serieNueva);
      if (duplicado) {
        return { errorConflicto: `Ya existe un registro con el número de serie "${validacion.datosLimpios.serie}".` };
      }
      const nuevoRegistro = {
        id: generarSiguienteId(equipos),
        ...validacion.datosLimpios,
        actualizado_en: new Date().toISOString()
      };
      return {
        equipos: [nuevoRegistro, ...equipos],
        registro: nuevoRegistro
      };
    });

    if (resultado.errorConflicto) {
      return res.status(409).json({ mensaje: resultado.errorConflicto });
    }
    res.status(201).json({
      mensaje: 'Equipo agregado y guardado en Excel correctamente.',
      registro: resultado.registro
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudo guardar el registro en Excel.', detalle: error.message });
  }
});

aplicacion.put('/api/equipos/:id', async (req, res) => {
  const validacion = validarEquipo(req.body || {});
  if (!validacion.valido) {
    return res.status(400).json({
      mensaje: 'Datos incompletos o inválidos para actualizar.',
      errores: validacion.errores
    });
  }

  try {
    const resultado = await operarInventario((equipos) => {
      const indice = equipos.findIndex((item) => item.id === req.params.id);
      if (indice < 0) {
        return { noEncontrado: true };
      }

      const serieNueva = normalizarClave(validacion.datosLimpios.serie);
      const duplicado = equipos.find(
        (item, idx) => idx !== indice && normalizarClave(item.serie) === serieNueva
      );
      if (duplicado) {
        return { errorConflicto: `Otro registro ya utiliza el número de serie "${validacion.datosLimpios.serie}".` };
      }

      const actualizado = {
        id: equipos[indice].id,
        ...validacion.datosLimpios,
        actualizado_en: new Date().toISOString()
      };
      const copia = [...equipos];
      copia[indice] = actualizado;
      return { equipos: copia, registro: actualizado };
    });

    if (resultado.noEncontrado) {
      return res.status(404).json({ mensaje: 'No se encontró el registro a actualizar.' });
    }
    if (resultado.errorConflicto) {
      return res.status(409).json({ mensaje: resultado.errorConflicto });
    }
    res.json({
      mensaje: 'Registro actualizado en Excel correctamente.',
      registro: resultado.registro
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el registro en Excel.', detalle: error.message });
  }
});

aplicacion.patch('/api/equipos/:id/cantidad', async (req, res) => {
  const delta = req.body && req.body.delta !== undefined ? Number(req.body.delta) : null;
  const cantidadExacta =
    req.body && req.body.cantidad !== undefined ? Number(req.body.cantidad) : null;

  if (delta === null && cantidadExacta === null) {
    return res.status(400).json({ mensaje: 'Debes indicar "delta" o "cantidad".' });
  }

  try {
    const resultado = await operarInventario((equipos) => {
      const indice = equipos.findIndex((item) => item.id === req.params.id);
      if (indice < 0) {
        return { noEncontrado: true };
      }
      const actual = equipos[indice];
      const nuevaCantidad =
        cantidadExacta !== null
          ? Math.max(0, Math.trunc(cantidadExacta))
          : Math.max(0, (Number(actual.cantidad) || 0) + Math.trunc(delta));

      const actualizado = {
        ...actual,
        cantidad: nuevaCantidad,
        actualizado_en: new Date().toISOString()
      };
      const copia = [...equipos];
      copia[indice] = actualizado;
      return { equipos: copia, registro: actualizado };
    });

    if (resultado.noEncontrado) {
      return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    }
    res.json({
      mensaje: 'Cantidad actualizada en Excel.',
      registro: resultado.registro
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al ajustar la cantidad.', detalle: error.message });
  }
});

aplicacion.delete('/api/equipos/:id', async (req, res) => {
  try {
    const resultado = await operarInventario((equipos) => {
      const indice = equipos.findIndex((item) => item.id === req.params.id);
      if (indice < 0) {
        return { noEncontrado: true };
      }
      const eliminado = equipos[indice];
      const restantes = equipos.filter((item) => item.id !== req.params.id);
      return { equipos: restantes, eliminado };
    });

    if (resultado.noEncontrado) {
      return res.status(404).json({ mensaje: 'Registro no encontrado para eliminar.' });
    }
    res.json({
      mensaje: 'Registro eliminado del libro Excel.',
      eliminado: resultado.eliminado
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el registro.', detalle: error.message });
  }
});

aplicacion.get('/api/excel/exportar', async (_req, res) => {
  try {
    const buffer = await generarBufferExportacion();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="inventario.xlsx"');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al exportar el libro Excel.', detalle: error.message });
  }
});

aplicacion.post('/api/excel/importar', cargaMemoria.single('archivo'), async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ mensaje: 'Debes adjuntar un archivo .xlsx válido.' });
  }
  const modo = limpiarTexto(req.body && req.body.modo) === 'reemplazar' ? 'reemplazar' : 'agregar';

  try {
    const resultado = await importarDesdeBuffer(req.file.buffer, modo);
    res.json({
      mensaje: 'Datos importados desde Excel correctamente.',
      resumen: resultado.resumenImportacion
    });
  } catch (error) {
    res.status(400).json({ mensaje: 'No se pudo importar el archivo Excel.', detalle: error.message });
  }
});

aplicacion.get('/api/excel/configuracion', (_req, res) => {
  res.json(leerConfiguracion());
});

aplicacion.put('/api/excel/configuracion', async (req, res) => {
  try {
    const configActualizada = guardarConfiguracion(req.body || {});
    await obtenerEquipos();
    res.json({
      mensaje: 'Configuración de Excel Web guardada correctamente.',
      configuracion: configActualizada
    });
  } catch (error) {
    res.status(400).json({ mensaje: error.message || 'No se pudo guardar la configuración.' });
  }
});

aplicacion.listen(PUERTO, () => {
  console.log(`Servidor de inventario ejecutándose en http://localhost:${PUERTO}`);
});
