export interface ProjectDetail {
  slug: string;
  name: string;
  tagline: string;
  accent: string; // color hex para el mundo 3D y acentos
  overview: string;
  stackUsed: { tech: string; reason: string }[];
  whatExplored: string[];
  github: string;
  demo?: string;
  status?: string;
}

export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  'inventario-app': {
    slug: 'inventario-app',
    name: 'Inventario App',
    tagline: 'Sistema de gestión de inventario con Angular 22',
    accent: '#00ffcc',
    status: 'IA en desarrollo',
    overview:
      'Proyecto de aprendizaje práctico enfocado en dominar Signals, Signal Forms y patrones reales de UI como drawers controlados por query params. Consume una API REST propia (inventario-api) construida en paralelo con Express y TypeScript.',
    stackUsed: [
      { tech: 'Angular 22', reason: 'Arquitectura híbrida: componentes standalone en shared/, NgModule en cada feature' },
      { tech: 'Signals + Signal Forms', reason: 'signal, computed, model, input, output, effect, viewChild, toSignal para todo el estado' },
      { tech: 'rxResource', reason: 'Búsqueda de productos combinando múltiples endpoints con forkJoin + map' },
      { tech: 'Query params como estado', reason: 'Los drawers (detalle, edición, creación) se controlan 100% vía URL — deep-linking y navegación con "atrás" del navegador funcionan nativamente' },
      { tech: 'Express + TypeScript', reason: 'Backend propio (inventario-api) con persistencia en JSON, en camino a DDD + Event Sourcing' },
    ],
    whatExplored: [
      'Cómo usar query params como única fuente de verdad para el estado de UI, en vez de signals booleanos sueltos que hay que sincronizar manualmente',
      'Diseño de un sistema de drawers anidados (producto → variante) sin que uno "filtre" hacia el otro al cerrarse',
      'Formularios reactivos con Signal Forms (la nueva API de Angular) en vez de ReactiveFormsModule tradicional',
      'Arquitectura híbrida real: cuándo conviene standalone y cuándo NgModule dentro del mismo proyecto',
    ],
    github: 'https://github.com/JeanHaro/inventario-app',
  },

  'typed-storage': {
    slug: 'typed-storage',
    name: '@jeanharo98/typed-storage',
    tagline: 'Ecosistema de 4 paquetes npm — localStorage type-safe',
    accent: '#7b2fff',
    overview:
      'localStorage y sessionStorage type-safe con una API tipo signal, TTL, sincronización entre pestañas, migraciones de schema y fallback automático a memoria. Publicado en npm con wrappers nativos para Angular y React.',
    stackUsed: [
      { tech: 'TypeScript puro', reason: 'Cero dependencias — el core no depende de ningún framework' },
      { tech: 'API tipo Signal', reason: 'signal() para leer, signal.set() para escribir, inspirado en la API de Angular Signals' },
      { tech: 'IndexedDB (createHeavyStorage)', reason: 'API async separada para datos grandes que exceden el límite de ~5MB de localStorage' },
      { tech: 'npm monorepo', reason: 'typed-storage (core), typed-storage-angular, typed-storage-react y typed-storage-devtools como paquetes independientes' },
    ],
    whatExplored: [
      'Diseño de una API pública que se siente nativa tanto en Angular como en React sin acoplarse a ninguno',
      'Sistema de migraciones de schema versionado (v1→v2→v3) que transforma datos guardados automáticamente sin romper usuarios existentes',
      'Los límites reales de "encriptar" datos en el frontend — documenté explícitamente por qué el XOR+Base64 es solo ofuscación, no seguridad real, y cuándo usar httpOnly cookies en su lugar',
      'Publicación y versionado de paquetes npm bajo un scope propio (@jeanharo98)',
    ],
    github: 'https://github.com/JeanHaro/typed-storage',
    demo: 'https://www.npmjs.com/package/@jeanharo98/typed-storage',
  },

  'front-sports-academy': {
    slug: 'front-sports-academy',
    name: 'Sports Academy',
    tagline: 'Plataforma full-stack de matrículas y pagos',
    accent: '#00e5b8',
    overview:
      'Aplicación completa para "Forcrack Perú" — gestión de matrículas, control de pagos mensuales y horarios de una academia deportiva, con autenticación de doble factor y generación de comprobantes en PDF.',
    stackUsed: [
      { tech: 'Angular', reason: 'Componentes, pipes, servicios, interfaces y guards propios' },
      { tech: 'Backend propio (back-sports-academy)', reason: 'API REST consumida en paralelo, autenticación con doble verificación por correo' },
      { tech: 'RxJS', reason: 'Observadores para manejo de estado asíncrono' },
      { tech: 'PDFMake', reason: 'Generación de comprobantes de matrícula en PDF descargables' },
    ],
    whatExplored: [
      'Doble factor de autenticación real: código enviado al correo del administrador antes de dar acceso',
      'Creación de validadores de formulario propios más allá de los Validators nativos de Angular',
      'Diseño de un pipe personalizado para formateo de datos',
      'Flujo completo de matrícula → pago → comprobante, de principio a fin',
    ],
    github: 'https://github.com/JeanHaro/front-sports-academy',
  },

  'ddd-core': {
    slug: 'ddd-core',
    name: '@jeanharo98/ddd-core',
    tagline: 'Building blocks de Domain-Driven Design para TypeScript',
    accent: '#ff2fff',
    overview:
      'Result, ValueObject, Entity, AggregateRoot, DomainEvent, Guard y Mapper — las piezas base para modelar dominios ricos en TypeScript sin acoplarse a Prisma, TypeORM, NestJS ni Express. Cero dependencias.',
    stackUsed: [
      { tech: 'TypeScript', reason: '100% del código, sin ninguna dependencia externa' },
      { tech: 'Result<T, E>', reason: 'Manejo de errores de dominio sin excepciones — isSuccess/isFailure explícitos' },
      { tech: 'ValueObject vs Entity', reason: 'Separación clara: identidad por valor vs identidad por ID' },
      { tech: 'Mapper interface', reason: 'Contrato explícito que fuerza separar el dominio de los modelos de persistencia' },
    ],
    whatExplored: [
      'Por qué Prisma/TypeORM empujan un diseño "data-first" por defecto y cómo DDD invierte esa relación: el dominio primero, la persistencia como detalle de infraestructura',
      'Domain Events y AggregateRoot — cómo registrar eventos de dominio sin acoplarlos a un event bus específico',
      'Diseño de una librería verdaderamente framework-agnostic, testeable sin base de datos ni HTTP',
      'El patrón Guard para validaciones genéricas reutilizables entre proyectos, separado de las reglas específicas del dominio',
    ],
    github: 'https://github.com/JeanHaro/ddd-core',
    demo: 'https://www.npmjs.com/package/@jeanharo98/ddd-core',
  },
};
