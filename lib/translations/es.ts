export const es = {
  // Navegación
  navigation: {
    home: "Inicio",
    accessibility: "Accesibilidad",
    settings: "Configuración",
  },

  // Títulos generales
  titles: {
    myBudgets: "Mis Presupuestos",
    manageBudgets: "Gestiona tus presupuestos y controla tus gastos",
    createBudget: "Crear Nuevo Presupuesto",
    budgetName: "Nombre del presupuesto",
    budgetExamples: "Ejemplos: Presupuesto Mensual, Gastos de Obra, Proyecto Comercial, Viaje Familiar",
    noBudgets: "No hay presupuestos",
    createFirstBudget: "Crea tu primer presupuesto para comenzar a gestionar tus gastos de manera efectiva.",
  },

  // Botones y acciones
  actions: {
    create: "Crear",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    view: "Ver",
    share: "Compartir",
    export: "Exportar",
    import: "Importar",
    add: "Añadir",
    remove: "Eliminar",
    update: "Actualizar",
    creating: "Creando...",
    deleting: "Eliminando...",
    loading: "Cargando...",
    confirm: "Confirmar",
  },

  // Presupuestos
  budget: {
    budget: "Presupuesto",
    setBudgetAmount: "Establece el monto total de tu presupuesto",
    amount: "Monto",
    enterBudget: "Ingresa tu presupuesto",
    editBudget: "Editar Presupuesto",
    categories: "Categorías",
    category: "Categoría",
    addCategory: "Añadir categoría",
    categoryName: "Nombre de la categoría",
    noCategories: "No hay categorías. Agrega una para comenzar a registrar gastos.",
    deleteCategory: "Eliminar categoría",
    deleteConfirm: "¿Estás seguro de que deseas eliminar esta categoría?",
    deleteWarning: "Esta acción no se puede deshacer y se perderán todos los datos asociados.",
  },

  // Gastos
  expenses: {
    expense: "Gasto",
    expenses: "Gastos",
    addExpense: "Añadir gasto",
    expenseName: "Nombre del gasto",
    amount: "Monto",
    date: "Fecha",
    selectDate: "Seleccionar fecha",
    notes: "Notas",
    notesPlaceholder: "Añade detalles adicionales sobre este gasto",
    optional: "opcional",
    noExpenses: "No hay gastos en esta categoría.",
    addExpensePrompt: "Agrega uno usando el formulario de arriba.",
    total: "Total",
    spent: "Gastado",
    remaining: "Restante",
  },

  // Etiquetas
  tags: {
    tags: "Etiquetas",
    addTag: "Añadir etiqueta",
    availableTags: "Etiquetas disponibles",
    noTags: "No hay etiquetas disponibles",
    manageTags: "Gestión de etiquetas",
    noTagsPrompt: "No hay etiquetas disponibles. Añade algunas para organizar tus gastos.",
  },

  // Resumen y estadísticas
  summary: {
    summary: "Resumen",
    budgetSummary: "Resumen de gastos y presupuesto disponible",
    progress: "Progreso",
    alertHigh: "¡Alerta! Has consumido casi todo tu presupuesto.",
    alertMedium: "Precaución: Has consumido más del 70% de tu presupuesto.",
    alertLow: "Vas bien. Aún tienes suficiente presupuesto disponible.",
    dashboard: "Dashboard",
    analysis: "Análisis",
    trends: "Tendencias",
    reports: "Informes",
  },

  // Configuración
  settings: {
    settings: "Configuración",
    appSettings: "Configuración de la aplicación",
    generalPreferences: "Preferencias generales",
    notifications: "Notificaciones",
    darkMode: "Modo oscuro",
    offlineMode: "Modo sin conexión",
    regionalization: "Regionalización",
    currency: "Moneda",
    language: "Idioma",
    dataManagement: "Gestión de datos",
    exportData: "Exportar datos",
    deleteAllData: "Borrar todos los datos",
    deleteConfirm: "¿Estás seguro?",
    deleteWarning:
      "Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus presupuestos, gastos y configuraciones de la aplicación.",
    currencyNote: "Esta configuración afectará a todos los valores monetarios en la aplicación.",
    installApp: "Instalar aplicación",
  },

  // Accesibilidad
  accessibility: {
    accessibility: "Accesibilidad",
    highContrast: "Alto contraste",
    largeText: "Texto grande",
    reducedMotion: "Reducir movimiento",
    fontSize: "Tamaño de texto",
    smaller: "Más pequeño",
    larger: "Más grande",
    visualOptions: "Opciones visuales",
    motionAnimations: "Movimiento y animaciones",
    textSample: "Este es un ejemplo de texto con el tamaño actual.",
    textSampleDesc: "Ajusta el control deslizante para cambiar el tamaño del texto en toda la aplicación.",
    saveChanges: "Guardar todos los cambios",
  },

  // Notificaciones y mensajes
  notifications: {
    success: "Éxito",
    error: "Error",
    warning: "Advertencia",
    info: "Información",
    budgetCreated: "Presupuesto creado",
    budgetCreatedDesc: "El presupuesto ha sido creado correctamente.",
    budgetDeleted: "Presupuesto eliminado",
    budgetDeletedDesc: "El presupuesto ha sido eliminado correctamente.",
    dataExported: "Datos exportados",
    dataExportedDesc: "Se ha descargado una copia de seguridad de tus datos.",
    dataDeleted: "Datos eliminados",
    dataDeletedDesc: "Todos los datos de la aplicación han sido eliminados correctamente.",
    settingsSaved: "Configuración guardada",
    settingsSavedDesc: "Tus preferencias han sido actualizadas.",
    currencyUpdated: "Moneda actualizada",
    currencyUpdatedDesc: "Se ha cambiado la moneda a {name} ({symbol})",
    languageUpdated: "Idioma actualizado",
    languageUpdatedDesc: "Se ha cambiado el idioma a {language}",
    installComplete: "Instalación completada",
    installCompleteDesc: "PresuApp se ha instalado correctamente.",
    installing: "Instalando PresuApp",
    installingDesc: "La aplicación se está instalando en tu dispositivo.",
  },

  // Otros
  other: {
    version: "PresuApp v1.0.0",
    copyright: "© {year} Todos los derechos reservados",
    loading: "Cargando...",
    noData: "No hay datos disponibles",
    search: "Buscar",
    filter: "Filtrar",
    sort: "Ordenar",
    all: "Todos",
    none: "Ninguno",
    today: "Hoy",
    yesterday: "Ayer",
    thisWeek: "Esta semana",
    thisMonth: "Este mes",
    thisYear: "Este año",
    custom: "Personalizado",
  },

  // App específico
  app: {
    offlineMode: "Sin conexión - Trabajando en modo offline",
    slogan: "Controla tus gastos, logra tus objetivos",
    copyright: "© 2025 PresuApp - Todos los derechos reservados",
  },
}
