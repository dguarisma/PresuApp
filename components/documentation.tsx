"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, History, Lightbulb } from "lucide-react"

export function Documentation() {
  const [activeTab, setActiveTab] = useState("features")

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <FileText className="mr-2 h-6 w-6 text-primary" />
          Documentación de la Aplicación
        </CardTitle>
        <CardDescription>
          Información sobre las características, cambios y mejoras futuras de la aplicación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="features" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Características
            </TabsTrigger>
            <TabsTrigger value="changelog" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="future" className="flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Mejoras Futuras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="space-y-4">
            <h3 className="text-xl font-semibold">Características Principales</h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium">Gestión de Presupuestos</h4>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Crear, editar y eliminar presupuestos</li>
                  <li>Establecer montos presupuestarios</li>
                  <li>Ver resumen de gastos vs. presupuesto</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium">Categorías y Gastos</h4>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Crear categorías personalizadas</li>
                  <li>Añadir gastos a cada categoría</li>
                  <li>Eliminar categorías o gastos individuales</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium">Visualización de Datos</h4>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Gráficos de distribución de gastos por categoría</li>
                  <li>Gráficos de presupuesto vs. gastos</li>
                  <li>Indicadores visuales de progreso</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium">Exportación y Compartir</h4>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Exportar datos a Excel (CSV)</li>
                  <li>Compartir resumen por WhatsApp</li>
                  <li>Formato optimizado para fácil lectura</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium">Base de Datos Interna</h4>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Sistema centralizado de gestión de datos</li>
                  <li>Operaciones CRUD completas</li>
                  <li>Datos de ejemplo preestablecidos</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="changelog" className="space-y-4">
            <h3 className="text-xl font-semibold">Historial de Cambios</h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium">Exportación y Compartir</h4>
                <p className="text-muted-foreground mb-2">
                  Se implementaron funcionalidades para exportar y compartir datos:
                </p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Exportación a Excel (CSV) con todos los gastos organizados por categorías</li>
                  <li>Compartir por WhatsApp con resumen del presupuesto</li>
                  <li>Opciones personalizadas para crear nuevas categorías</li>
                  <li>Mejoras en la interfaz y experiencia de usuario</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium">Base de Datos Interna</h4>
                <p className="text-muted-foreground mb-2">Se creó un sistema de "base de datos" interna:</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Centralización de la lógica de acceso a datos</li>
                  <li>Gestión completa de presupuestos, categorías y gastos</li>
                  <li>Datos de ejemplo preestablecidos</li>
                  <li>Integración con todos los componentes de la aplicación</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="future" className="space-y-4">
            <h3 className="text-xl font-semibold">Mejoras Futuras</h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium">Autenticación de Usuarios</h4>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Sistema de login/registro para múltiples usuarios</li>
                  <li>Perfiles personalizados con configuraciones</li>
                  <li>Roles y permisos para compartir presupuestos</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium">Gestión Avanzada de Fechas</h4>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Filtros por período (día, semana, mes, año)</li>
                  <li>Calendario visual de gastos</li>
                  <li>Gastos recurrentes y recordatorios</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium">Análisis y Reportes</h4>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Análisis de tendencias a lo largo del tiempo</li>
                  <li>Reportes personalizables según criterios</li>
                  <li>Comparativas entre períodos o categorías</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium">Experiencia de Usuario</h4>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Versión PWA instalable en dispositivos</li>
                  <li>Notificaciones push para alertas</li>
                  <li>Modo offline con funcionalidad completa</li>
                  <li>Mejoras de accesibilidad</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
