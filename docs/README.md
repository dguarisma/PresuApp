# Documentación - App de Control de Gastos

## Descripción General

Esta aplicación de control de gastos permite a los usuarios gestionar múltiples presupuestos, categorizar gastos, visualizar datos mediante gráficos y compartir o exportar la información. Está construida con React, Next.js y utiliza localStorage para almacenar los datos.

## Características Principales

### Gestión de Presupuestos
- Crear, editar y eliminar presupuestos
- Establecer montos presupuestarios
- Ver resumen de gastos vs. presupuesto

### Categorías y Gastos
- Crear categorías personalizadas
- Añadir gastos a cada categoría
- Eliminar categorías o gastos individuales

### Visualización de Datos
- Gráficos de distribución de gastos por categoría
- Gráficos de presupuesto vs. gastos
- Indicadores visuales de progreso

### Exportación y Compartir
- Exportar datos a Excel (CSV)
- Compartir resumen por WhatsApp
- Formato optimizado para fácil lectura

### Base de Datos Interna
- Sistema centralizado de gestión de datos
- Operaciones CRUD completas
- Datos de ejemplo preestablecidos

## Estructura Técnica

### Componentes Principales
- `BudgetList`: Lista de presupuestos disponibles
- `ExpenseTracker`: Gestión de un presupuesto específico
- `CategoryList`: Visualización y gestión de categorías
- `ExpenseCharts`: Visualización gráfica de datos
- `ExportBudget`: Funcionalidades de exportación y compartir

### Sistema de Datos
- `db.ts`: Capa de abstracción para operaciones de datos
- Utiliza localStorage como almacenamiento persistente
- Manejo de errores integrado

### Interfaz de Usuario
- Diseño responsive para móviles y escritorio
- Modo claro/oscuro
- Feedback visual para acciones del usuario
- Componentes reutilizables de shadcn/ui

## Guía de Uso

### Crear un Nuevo Presupuesto
1. En la página principal, haz clic en "Crear Nuevo Presupuesto"
2. Ingresa un nombre descriptivo
3. Haz clic en "Crear Presupuesto"

### Añadir Categorías y Gastos
1. En la página del presupuesto, ve a la pestaña "Categorías"
2. Usa el formulario para añadir una nueva categoría
3. Selecciona la categoría y añade gastos con nombre y monto

### Visualizar Datos
1. En la pestaña "Dashboard", verás gráficos de distribución
2. Puedes alternar entre diferentes visualizaciones
3. El resumen muestra el estado actual del presupuesto

### Exportar o Compartir
1. Usa los botones en la parte superior para exportar a Excel
2. O para compartir un resumen por WhatsApp
3. Los datos se formatean automáticamente

## Mejoras Planificadas

Ver el archivo CHANGELOG.md para conocer las mejoras planificadas y el historial de cambios.
\`\`\`

Ahora, vamos a crear un componente para mostrar la documentación en la aplicación:
