"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, LogOut, Trash2, Edit, UserCog } from "lucide-react"
import userProfileService, { type UserProfile } from "@/services/user-profile-service"
import { useToast } from "@/hooks/use-toast"
import fileStorageService from "@/services/file-storage-service"

export default function UserProfileManager() {
  const { toast } = useToast()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newProfileName, setNewProfileName] = useState("")
  const [newProfileEmail, setNewProfileEmail] = useState("")
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null)
  const [profileToDelete, setProfileToDelete] = useState<UserProfile | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // Cargar perfiles al iniciar
  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = () => {
    const allProfiles = userProfileService.getAllProfiles()
    setProfiles(allProfiles)
    setActiveProfile(userProfileService.getActiveProfile())
  }

  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      try {
        const newProfile = userProfileService.createProfile(newProfileName, newProfileEmail)
        setProfiles([...profiles, newProfile])
        setActiveProfile(newProfile)
        setNewProfileName("")
        setNewProfileEmail("")
        setIsCreating(false)

        toast({
          title: "Perfil creado",
          description: `El perfil "${newProfile.name}" ha sido creado y activado.`,
        })

        // Recargar la página para aplicar el nuevo perfil
        window.location.reload()
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo crear el perfil de usuario.",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpdateProfile = () => {
    if (editingProfile && newProfileName.trim()) {
      try {
        const updatedProfile = userProfileService.updateProfile(editingProfile.id, {
          name: newProfileName,
          email: newProfileEmail || undefined,
        })

        if (updatedProfile) {
          loadProfiles()
          setIsEditing(false)
          setEditingProfile(null)
          setNewProfileName("")
          setNewProfileEmail("")

          toast({
            title: "Perfil actualizado",
            description: `El perfil "${updatedProfile.name}" ha sido actualizado.`,
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el perfil de usuario.",
          variant: "destructive",
        })
      }
    }
  }

  const handleSwitchProfile = (profileId: string) => {
    try {
      const success = userProfileService.setActiveProfile(profileId)

      if (success) {
        toast({
          title: "Perfil cambiado",
          description: "Cambiando al perfil seleccionado...",
        })

        // Recargar la página para aplicar el nuevo perfil
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar al perfil seleccionado.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProfile = () => {
    if (!profileToDelete) return

    try {
      const success = userProfileService.deleteProfile(profileToDelete.id)

      if (success) {
        loadProfiles()
        setIsDeleteDialogOpen(false)
        setProfileToDelete(null)

        toast({
          title: "Perfil eliminado",
          description: `El perfil "${profileToDelete.name}" ha sido eliminado.`,
        })

        // Si se eliminó el perfil activo, recargar la página
        if (profileToDelete.isActive) {
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el perfil de usuario.",
        variant: "destructive",
      })
    }
  }

  const startEditProfile = (profile: UserProfile) => {
    setEditingProfile(profile)
    setNewProfileName(profile.name)
    setNewProfileEmail(profile.email || "")
    setIsEditing(true)
  }

  const confirmDeleteProfile = (profile: UserProfile) => {
    setProfileToDelete(profile)
    setIsDeleteDialogOpen(true)
  }

  const handleExportProfile = async (profile: UserProfile) => {
    try {
      setIsExporting(true)

      // Guardar el estado actual si es el perfil activo
      if (profile.isActive) {
        // El estado ya está guardado en localStorage
      } else {
        // Necesitamos obtener los datos del perfil
        const profileData = userProfileService.exportProfileData(profile.id)

        // Crear un objeto con los datos del perfil
        const exportData = {
          profile,
          data: profileData,
          exportDate: new Date().toISOString(),
          version: "1.0.0",
        }

        // Convertir a JSON y descargar
        const jsonString = JSON.stringify(exportData, null, 2)
        const blob = new Blob([jsonString], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `perfil-${profile.name.replace(/\s+/g, "-").toLowerCase()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      toast({
        title: "Perfil exportado",
        description: `El perfil "${profile.name}" ha sido exportado correctamente.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar el perfil de usuario.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportProfile = async () => {
    try {
      setIsImporting(true)

      // Crear un input de tipo file
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "application/json"

      // Manejar la selección de archivo
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0]
        if (!file) return

        // Leer el archivo
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            const importData = JSON.parse(content)

            // Verificar que el archivo tiene el formato correcto
            if (!importData.profile || !importData.data) {
              throw new Error("Formato de archivo no válido")
            }

            // Crear un nuevo perfil con los datos importados
            const newProfile = userProfileService.createProfile(
              importData.profile.name,
              importData.profile.email,
              importData.profile.avatar,
            )

            // Importar los datos al perfil
            userProfileService.importProfileData(newProfile.id, importData.data)

            // Recargar perfiles
            loadProfiles()

            toast({
              title: "Perfil importado",
              description: `El perfil "${newProfile.name}" ha sido importado correctamente.`,
            })

            // Preguntar si desea cambiar al perfil importado
            if (confirm(`¿Desea cambiar al perfil "${newProfile.name}" ahora?`)) {
              handleSwitchProfile(newProfile.id)
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "El archivo seleccionado no es un perfil válido.",
              variant: "destructive",
            })
          } finally {
            setIsImporting(false)
          }
        }

        reader.onerror = () => {
          toast({
            title: "Error",
            description: "No se pudo leer el archivo seleccionado.",
            variant: "destructive",
          })
          setIsImporting(false)
        }

        reader.readAsText(file)
      }

      // Simular clic en el input
      input.click()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo importar el perfil de usuario.",
        variant: "destructive",
      })
      setIsImporting(false)
    }
  }

  // Generar iniciales para el avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <UserCog className="mr-2 h-5 w-5" />
          Perfiles de Usuario
        </CardTitle>
        <CardDescription>
          Gestiona perfiles de usuario para separar los datos de diferentes personas en este dispositivo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profiles">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profiles">Perfiles</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="space-y-4 pt-4">
            {/* Perfil activo */}
            {activeProfile && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Perfil Activo</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 border-2 border-primary">
                      <AvatarFallback>{getInitials(activeProfile.name)}</AvatarFallback>
                      {activeProfile.avatar && (
                        <AvatarImage src={activeProfile.avatar || "/placeholder.svg"} alt={activeProfile.name} />
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{activeProfile.name}</h3>
                      {activeProfile.email && <p className="text-sm text-muted-foreground">{activeProfile.email}</p>}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportProfile(activeProfile)}
                    disabled={isExporting}
                  >
                    Exportar Perfil
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditProfile(activeProfile)}
                    disabled={isEditing}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Lista de perfiles */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Todos los perfiles</h3>
              {profiles.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No hay perfiles de usuario. Crea uno para comenzar.
                </p>
              ) : (
                <div className="space-y-2">
                  {profiles.map((profile) => (
                    <Card key={profile.id} className={profile.isActive ? "bg-primary/5" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                              {profile.avatar && (
                                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                              )}
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{profile.name}</h4>
                              {profile.email && <p className="text-xs text-muted-foreground">{profile.email}</p>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!profile.isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSwitchProfile(profile.id)}
                                title="Cambiar a este perfil"
                              >
                                <LogOut className="h-4 w-4 mr-1" />
                                Usar
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditProfile(profile)}
                              className="h-8 w-8"
                              title="Editar perfil"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {profiles.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => confirmDeleteProfile(profile)}
                                className="h-8 w-8 text-destructive"
                                title="Eliminar perfil"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setIsCreating(true)} disabled={isCreating}>
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Perfil
              </Button>
              <Button variant="outline" onClick={handleImportProfile} disabled={isImporting}>
                Importar Perfil
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Información del perfil activo</h3>
                {activeProfile ? (
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Nombre:</span> {activeProfile.name}
                    </p>
                    {activeProfile.email && (
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {activeProfile.email}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium">Creado:</span>{" "}
                      {new Date(activeProfile.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Último acceso:</span>{" "}
                      {new Date(activeProfile.lastLogin).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay perfil activo.</p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Exportar e importar datos</h3>
                <p className="text-sm text-muted-foreground">
                  Puedes exportar todos tus datos para hacer una copia de seguridad o transferirlos a otro dispositivo.
                </p>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" onClick={() => fileStorageService.exportAllData()} className="flex-1">
                    Exportar Todos los Datos
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const result = await fileStorageService.importData()
                      if (result.success) {
                        toast({
                          title: "Datos importados",
                          description: "Los datos han sido importados correctamente.",
                        })
                        setTimeout(() => {
                          window.location.reload()
                        }, 1000)
                      } else {
                        toast({
                          title: "Error",
                          description: result.message,
                          variant: "destructive",
                        })
                      }
                    }}
                    className="flex-1"
                  >
                    Importar Datos
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Diálogo para crear perfil */}
      <AlertDialog open={isCreating} onOpenChange={setIsCreating}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Crear nuevo perfil</AlertDialogTitle>
            <AlertDialogDescription>
              Crea un nuevo perfil de usuario para separar tus datos de otros usuarios en este dispositivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="profile-name" className="text-sm font-medium">
                Nombre del perfil
              </label>
              <Input
                id="profile-name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="profile-email" className="text-sm font-medium">
                Email (opcional)
              </label>
              <Input
                id="profile-email"
                type="email"
                value={newProfileEmail}
                onChange={(e) => setNewProfileEmail(e.target.value)}
                placeholder="Ej: juan@example.com"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateProfile} disabled={!newProfileName.trim()}>
              Crear Perfil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para editar perfil */}
      <AlertDialog open={isEditing} onOpenChange={setIsEditing}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Editar perfil</AlertDialogTitle>
            <AlertDialogDescription>Actualiza la información de tu perfil de usuario.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-profile-name" className="text-sm font-medium">
                Nombre del perfil
              </label>
              <Input
                id="edit-profile-name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-profile-email" className="text-sm font-medium">
                Email (opcional)
              </label>
              <Input
                id="edit-profile-email"
                type="email"
                value={newProfileEmail}
                onChange={(e) => setNewProfileEmail(e.target.value)}
                placeholder="Ej: juan@example.com"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsEditing(false)
                setEditingProfile(null)
                setNewProfileName("")
                setNewProfileEmail("")
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateProfile} disabled={!newProfileName.trim()}>
              Guardar Cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para confirmar eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Eliminar perfil</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el perfil "{profileToDelete?.name}"? Esta acción no se puede deshacer
              y todos los datos asociados a este perfil se perderán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setProfileToDelete(null)
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfile}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
