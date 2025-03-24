
# Producto

## Contexto del Producto

El proyecto es un SaaS B2B dirigido a pymes (especialmente en el mercado colombiano, con proyección hacia otros países de Latinoamérica) que necesitan digitalizar y automatizar la gestión de gastos corporativos. La solución busca reducir el tiempo administrativo y los errores asociados a los procesos manuales, facilitando el registro, la gestión de anticipos y la visualización del estado financiero a través de un sistema web. En esta etapa del MVP se priorizan los módulos de Registro de Gastos, Anticipo y Estado de Cuenta, sin incluir aprobaciones para el registro de gastos y sin integraciones directas con ERP.

---

## Módulo 1: Registro de Gastos

**Objetivo:** Permitir que el empleado registre sus gastos en tiempo real, de forma directa y sin requerir procesos de aprobación, capturando la información necesaria tanto mediante OCR como de forma manual.

### Funcionalidades

1. **Reporte en Tiempo Real:**  
   - **Interfaz de Registro:** El empleado puede ingresar un gasto de forma inmediata a través de una interfaz web.  
   - **Entrada de Datos Automática:** Se activa el proceso de captura de datos en el instante en que se sube el comprobante.

2. **Captura mediante OCR/ICR:**  
   - **Extracción Automática:** El sistema procesa la imagen del comprobante (factura, recibo, ticket, etc.) para extraer los siguientes campos:
     - Fecha  
     - Monto  
     - Proveedor  
     - Concepto  
   - **Validación en Tiempo Real:** Los datos extraídos se muestran para que el empleado confirme o corrija la información extraída.

3. **Registro Manual:**  
   - **Opción Alternativa:** Si el empleado decide no utilizar la función de OCR o si ésta no es precisa, puede ingresar manualmente:
     - Fecha, monto, proveedor y concepto.
   - **Campos Adicionales:** En ambos modos (automático y manual) se debe registrar:
     - Nota o detalle (ej. "compra de material")  
     - Centro de costos (se ingresa directamente o se selecciona de un catálogo predefinido)  
     - Moneda (para indicar la divisa del gasto)

4. **Almacenamiento y Registro Automático:**  
   - **Asignación Implícita:** El sistema registra automáticamente quién realiza el ingreso y la fecha/hora del registro. No es necesario agrupar explícitamente por empleado o por período, ya que estos datos se capturan en cada registro para análisis futuro.

---

## Módulo 2: Anticipo

**Objetivo:** Permitir que el empleado solicite anticipos de fondos, aplicando reglas de aprobación basadas en topes y roles de liderazgo, gestionar sus estados (incluyendo desembolso) y facilitar la conciliación posterior con los gastos registrados.

### Funcionalidades Detalladas

1. **Solicitud de Anticipo:**  
   - **Formulario de Solicitud:** El empleado ingresa una solicitud de anticipo con los siguientes campos:  
     - Valor (monto solicitado)  
     - Motivo (razón de la solicitud)  
     - Centro de costos (para asociarlo al proyecto o área correspondiente)  
     - Fecha máxima (fecha límite para utilizar o conciliar el anticipo)  
   - La solicitud se registra y se asocia automáticamente al perfil del empleado y a la fecha/hora del ingreso.

2. **Flujo de Aprobación:**  
   - **Reglas de Aprobación:** Se aplican reglas basadas en topes de valor. Si el monto supera un tope predefinido, la solicitud se envía para revisión y aprobación por un líder o supervisor.  
   - **Definición de Estados Iniciales:**  
     - **Pendiente:** Solicitud enviada y a la espera de revisión.  
     - **Aprobado:** Solicitud aprobada por el responsable correspondiente.
  
3. **Proceso de Desembolso:**  
   - **Nuevo Estado – Desembolso:**  
     - Una vez aprobada la solicitud, se activa un estado adicional de “Desembolso”.  
     - El área financiera se encarga de procesar la transferencia de fondos al empleado.  
     - Este estado indica que el empleado ya cuenta con el dinero solicitado.
  
4. **Gestión de Estados del Anticipo:**  
   - **Estados del Anticipo:**  
     - Pendiente  
     - Aprobado  
     - Desembolsado  
     - Rechazado  
     - Conciliado (cuando se vincula el anticipo con los gastos reales)  
     - Cancelado  
   - **Notificaciones:** Cada transición de estado se notifica al empleado para mantenerlo informado del progreso de su solicitud.

5. **Vinculación con Gastos:**  
   - **Asociación Posterior:** Cuando el empleado registra gastos relacionados, el sistema permite vincular dichos registros con la solicitud de anticipo correspondiente para conciliar el monto adelantado con el gasto real.

---

## Módulo 3: Estado de Cuenta

**Objetivo:** Proveer una visión consolidada de los gastos y anticipos, facilitando el seguimiento y análisis de la situación financiera del usuario.

### Funcionalidades

1. **Resumen del Estado de Cuenta:**  
   - **Visualización de Totales:** El sistema presentará un resumen que incluya:
     - Total de gastos realizados (suma de todos los gastos registrados por el usuario o en la empresa, según el nivel de acceso)  
     - Total de anticipos solicitados (y/o otorgados), de forma separada.
  
2. **Actualización en Tiempo Real:**  
   - **Dashboard:** La vista de estado de cuenta se actualizará automáticamente a medida que se registren nuevos gastos o se gestionen anticipos.
  
3. **Filtros y Reportes:**  
   - **Desglose Detallado:** Aunque la agrupación explícita por empleado o período no es necesaria en el registro, el sistema deberá permitir que el usuario filtre y visualice los totales por diferentes criterios (por ejemplo, por fecha o centro de costos) para facilitar análisis posteriores.

---

## Orden de Construcción Lógica

1. **Desarrollo del Módulo de Registro de Gastos:**  
   - Construir la interfaz para ingresar gastos, implementando la captura por OCR y la opción de ingreso manual.  
   - Integrar los campos adicionales (nota, centro de costos, moneda) y registrar automáticamente el usuario y la fecha/hora de ingreso.

2. **Implementación del Módulo de Anticipo:**  
   - Diseñar el formulario de solicitud de anticipo con los campos requeridos.  
   - Configurar el flujo de aprobación basado en topes de valor y roles de liderazgo.  
   - Definir y gestionar los estados del anticipo, asegurando la vinculación con futuros gastos para la conciliación.

3. **Construcción del Módulo de Estado de Cuenta:**  
   - Desarrollar el dashboard o panel de visualización que consolide los totales de gastos y anticipos.  
   - Incluir filtros básicos que permitan visualizar la información de forma segmentada según criterios relevantes (fecha, centro de costos, etc.).



A continuación, se presenta la versión actualizada de los casos de uso para el MVP, integrando los ajustes solicitados:
