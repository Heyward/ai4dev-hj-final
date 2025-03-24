
# Desarrollo

## Formato/ejemplo hisotira de usuario

A continuación, se muestra un formato estándar para historias de usuario, con un ejemplo inicial (US001), que podrás replicar y adaptar a cada funcionalidad:


**ID:** US001  
**Título:** Registro de gastos en tiempo real

**Narrativa:**  
Como *empleado*, quiero poder registrar mis gastos en tiempo real (ya sea mediante OCR o de forma manual) para que la información quede registrada de forma inmediata y sin requerir aprobaciones, facilitando el seguimiento y la conciliación de mis gastos.

**Criterios de Aceptación:**  
- Se debe permitir subir una imagen del comprobante y, mediante OCR, extraer los campos: fecha, monto, proveedor y concepto.  
- El sistema debe ofrecer la opción de ingresar manualmente los mismos datos si el OCR falla o el empleado lo prefiere.  
- Además de los datos extraídos, se deben registrar campos adicionales: nota o detalle, centro de costos y moneda.  
- El registro se asocia automáticamente al perfil del usuario y se almacena con la fecha y hora de la operación.

**Notas y Contexto Adicional:**  
- Esta funcionalidad es parte del módulo de Registro de Gastos del MVP, enfocado en agilizar el proceso de captura sin flujos de aprobación.  
- Se espera que la interfaz sea intuitiva y se integre dentro de una aplicación web responsive (criterio de calidad general del proyecto).

**Definición de “Hecho”:**  
- La funcionalidad pasa pruebas unitarias y de integración.  
- El usuario puede subir comprobantes y ver los datos extraídos, además de poder ingresar datos manualmente.  
- La información se almacena correctamente y se visualiza en un reporte de gastos.


---

## Epicas Módulo 1

A continuación se presenta la versión ajustada de las épicas para el Módulo 1: Registro de Gastos, con identificadores y los cambios solicitados:

---

**EP001 – Captura y Extracción Automática de Datos**  
*Descripción:*  
Permitir al empleado subir un comprobante (imagen) y, mediante tecnología OCR/ICR, extraer automáticamente los siguientes campos:  
- Fecha  
- Monto  
- Proveedor  
- ID del proveedor (por ejemplo, NIT en Colombia)  
- Concepto (ejemplo: “compra de material”)  
La información extraída se mostrará para que el empleado la confirme o corrija en tiempo real.  
*Objetivo:*  
Agilizar el registro de gastos reduciendo la entrada manual y minimizando errores en la captura de datos.

---

**EP002 – Registro Manual de Gastos**  
*Descripción:*  
Ofrecer la opción para que el empleado ingrese manualmente los datos del gasto en caso de que el OCR no funcione o prefiera hacerlo directamente. Los campos a registrar serán:  
- Fecha  
- Monto  
- Proveedor  
- ID del proveedor (NIT)  
- Concepto (ejemplo: “compra de material”)  
- Centro de costos  
- Moneda  
*Objetivo:*  
Garantizar que el sistema registre de manera confiable todos los gastos, independientemente del método de captura.

---

**EP003 – Almacenamiento y Gestión del Registro**  
*Descripción:*  
Registrar de forma automática cada gasto junto con la metadata esencial (usuario, fecha y hora de ingreso) sin necesidad de agrupaciones explícitas, ya que el sistema organizará los datos internamente para análisis posteriores.  
*Objetivo:*  
Asegurar la trazabilidad y consulta eficiente de cada registro para facilitar futuros procesos contables o conciliaciones.

---

**EP004 – Interfaz de Usuario Intuitiva para el Registro de Gastos**  
*Descripción:*  
Desarrollar una interfaz web que permita a los empleados registrar sus gastos de forma rápida y sencilla. Esta interfaz deberá:  
- Facilitar tanto la captura mediante OCR como el ingreso manual de datos.  
- Mostrar mensajes claros de validación y permitir la edición de la información antes de almacenarla.  
- Garantizar una experiencia de usuario intuitiva y adaptable en diferentes dispositivos (este criterio forma parte de los estándares de calidad del producto).  
*Objetivo:*  
Facilitar la adopción del sistema y reducir el tiempo de registro, sin requerir soporte o tutoriales avanzados.

---

**EP005 – Exportación e Integración de Datos**  
*Descripción:*  
Implementar la funcionalidad que permita exportar los registros de gastos en formatos estándar (Excel, CSV) para su uso en análisis financieros o conciliaciones manuales en sistemas contables externos.  
*Objetivo:*  
Proveer herramientas básicas de integración y análisis sin la necesidad de desarrollos de integración compleja en esta etapa del MVP.


---

##  Historias de usuario

A continuación, se presentan las historias de usuario con la asociación del ID de épica (EP001):

---

**ID de Épica:** EP001  
**ID:** US001  
**Título:** Captura Automática de Comprobante mediante OCR

**Narrativa:**  
Como *empleado*, quiero subir una imagen del comprobante para que el sistema, utilizando tecnología OCR/ICR, extraiga automáticamente los siguientes campos:  
- Fecha  
- Monto  
- Proveedor  
- ID del proveedor (por ejemplo, NIT en Colombia)  
- Concepto (ejemplo: “compra de material”)  
De modo que no tenga que ingresar manualmente esta información.

**Criterios de Aceptación:**  
- El usuario puede seleccionar y subir una imagen del comprobante a través de la interfaz web.  
- La tecnología OCR/ICR extrae de forma automática los campos: fecha, monto, proveedor, ID del proveedor y concepto.  
- Los datos extraídos se muestran en pantalla para que el empleado los revise y confirme.  
- La información se asocia automáticamente al perfil del usuario y se registra junto con la fecha y hora de la operación.

**Notas y Contexto Adicional:**  
- Esta historia es parte de la épica EP001 – Captura y Extracción Automática de Datos, orientada a agilizar la captura de información en el registro de gastos.  
- Se espera que la función de OCR opere de forma rápida y precisa, permitiendo validación visual inmediata.

**Definición de “Hecho”:**  
- El usuario puede subir un comprobante y visualizar en pantalla los datos extraídos.  
- Los campos requeridos se completan correctamente y se almacenan en la base de datos.  
- La funcionalidad pasa pruebas unitarias e integración.

---

**ID de Épica:** EP001  
**ID:** US002  
**Título:** Revisión y Corrección de Datos Extraídos por OCR

**Narrativa:**  
Como *empleado*, quiero revisar y, en caso necesario, corregir los datos extraídos del comprobante por OCR para asegurar que la información registrada es precisa, evitando errores en mi reporte de gastos.

**Criterios de Aceptación:**  
- Tras la extracción automática, se presenta un formulario con los campos: fecha, monto, proveedor, ID del proveedor y concepto.  
- El usuario puede editar cualquier campo en el formulario si el OCR no extrajo correctamente la información.  
- Los cambios manuales se guardan correctamente y actualizan el registro del gasto.  
- La operación de corrección se registra con la fecha y hora de la modificación.

**Notas y Contexto Adicional:**  
- Esta historia complementa la captura automática, permitiendo al usuario validar y ajustar la información antes de su almacenamiento definitivo.  
- Se debe garantizar una experiencia de usuario clara e intuitiva.

**Definición de “Hecho”:**  
- El usuario puede modificar los datos extraídos y guardar los cambios sin inconvenientes.  
- Las correcciones se reflejan en el reporte final y se registran con la metadata correspondiente.

---

**ID de Épica:** EP001  
**ID:** US003  
**Título:** Registro Manual de Datos de Comprobante

**Narrativa:**  
Como *empleado*, quiero tener la opción de ingresar manualmente los datos del comprobante en caso de que la captura automática mediante OCR no funcione o no sea precisa, para asegurar que mi gasto se registre correctamente.

**Criterios de Aceptación:**  
- El sistema ofrece una opción visible para el ingreso manual de datos si el OCR falla o el usuario decide no utilizarlo.  
- El formulario manual incluye los siguientes campos:  
  - Fecha  
  - Monto  
  - Proveedor  
  - ID del proveedor (NIT)  
  - Concepto (ejemplo: “compra de material”)  
  - Centro de costos  
  - Moneda  
- Al enviar el formulario, los datos se almacenan de forma similar a los registros automáticos, asociándose al perfil del usuario y a la fecha/hora del registro.

**Notas y Contexto Adicional:**  
- Esta opción es fundamental para garantizar la continuidad del proceso de registro de gastos cuando la captura automática no sea viable.  
- La interfaz para el ingreso manual debe ser coherente con la opción de captura automática.

**Definición de “Hecho”:**  
- El usuario puede acceder al formulario manual y completar todos los campos requeridos.  
- La información ingresada se guarda correctamente y se integra en el reporte de gastos, con la misma estructura de registro que la captura automática.

---

Estas historias de usuario, asociadas a la épica EP001, proporcionan la base para desarrollar la funcionalidad de captura y extracción automática de datos en el módulo de Registro de Gastos. ¿Deseas algún ajuste adicional o más ejemplos?