## Estructura de ficheros backend (NESTJS)

A continuación se muestra la estructura de ficheros para el backend en NestJS, basada en una arquitectura orientada por dominio (Domain-Driven Design). Esta organización separa las responsabilidades en diferentes capas para lograr un código modular, mantenible y escalable.

```
/src
 ├── /domain
 │    ├── /expense
 │    │     ├── entities/
 │    │     │     └── expense.entity.ts        // Entidad de gasto
 │    │     ├── interfaces/
 │    │     │     └── expense-repository.interface.ts  // Interfaz del repositorio
 │    │     ├── services/
 │    │     │     └── expense.service.ts       // Lógica de negocio
 │    │     └── exceptions/
 │    │           └── expense.exceptions.ts    // Excepciones del dominio
 │    ├── /advance
 │    │     ├── entities/
 │    │     │     └── advance.entity.ts
 │    │     ├── interfaces/
 │    │     │     └── advance-repository.interface.ts
 │    │     ├── services/
 │    │     │     └── advance.service.ts
 │    │     └── exceptions/
 │    │           └── advance.exceptions.ts
 │    ├── /user
 │    │     ├── entities/
 │    │     │     └── user.entity.ts
 │    │     ├── interfaces/
 │    │     │     └── user-repository.interface.ts
 │    │     └── services/
 │    │           └── user.service.ts
 │    └── /cost-center
 │          ├── entities/
 │          │     └── cost-center.entity.ts
 │          ├── interfaces/
 │          │     └── cost-center-repository.interface.ts
 │          └── services/
 │                └── cost-center.service.ts
 │
 ├── /application
 │    ├── /expense
 │    │     └── expense.use-case.ts
 │    ├── /advance
 │    │     └── advance.use-case.ts
 │    └── /user
 │          └── user.use-case.ts
 │
 ├── /infrastructure
 │    ├── /database
 │    │     ├── postgres.config.ts
 │    │     └── /repositories
 │    │             ├── expense.repository.ts
 │    │             ├── advance.repository.ts
 │    │             ├── user.repository.ts
 │    │             └── cost-center.repository.ts
 │    ├── /services
 │    │     ├── ocr.service.ts
 │    │     └── notification.service.ts
 │    └── /api
 │          ├── /controllers
 │          │       ├── expense.controller.ts
 │          │       ├── advance.controller.ts
 │          │       ├── user.controller.ts
 │          │       └── cost-center.controller.ts
 │          └── app.module.ts
 │
 ├── /shared
 │    ├── /utils
 │    │     ├── logger.service.ts
 │    │     └── error-handler.ts
 │    └── /config
 │          ├── app.config.ts
 │          └── env.config.ts
 │
 └── main.ts                             // Punto de entrada de la aplicación NestJS
 
/test                                    // Directorio de pruebas
/nest-cli.json                           // Configuración de NestJS
/package.json                            // Dependencias y scripts
/tsconfig.json                           // Configuración de TypeScript
/README.md                               // Documentación general del proyecto
```

### Explicación de la estructura

- **/domain:**  
  Aquí se encuentran los modelos de dominio (entidades, interfaces de repositorios y servicios de dominio). Cada subdominio (gastos, anticipos, usuarios, centros de costos) se agrupa en su propia carpeta.

- **/application:**  
  Se definen los casos de uso que coordinan las operaciones entre el dominio y la infraestructura. Esta capa se encarga de orquestar la lógica de negocio de forma agnóstica a los detalles de implementación.

- **/infrastructure:**  
  Contiene la implementación concreta de interfaces definidas en el dominio, como la conexión a la base de datos (repositorios) y la integración con servicios externos (OCR, notificaciones). Además, se encuentran las rutas de la API y la configuración del servidor.

- **/shared:**  
  Recursos y utilidades compartidas a lo largo del proyecto, como configuraciones, logger y manejadores de errores.

- **/tests:**  
  Conjunto de pruebas unitarias e integrales para validar la funcionalidad del dominio y la correcta integración con la infraestructura.

Esta estructura favorece el desacoplamiento entre capas y permite que cada parte evolucione de forma independiente, facilitando el mantenimiento y la escalabilidad del proyecto.