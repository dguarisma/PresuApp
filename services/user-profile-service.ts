/**
 * Servicio para gestionar perfiles de usuario locales
 * Permite tener datos separados para diferentes usuarios en el mismo dispositivo
 */

// Interfaz para el perfil de usuario
export interface UserProfile {
  id: string
  name: string
  email?: string
  avatar?: string
  createdAt: string
  lastLogin: string
  isActive: boolean
}

// Prefijos para las claves en localStorage
const PROFILES_KEY = "user_profiles"
const ACTIVE_PROFILE_KEY = "active_profile"
const PROFILE_DATA_PREFIX = "profile_"

class UserProfileService {
  // Obtener todos los perfiles de usuario
  public getAllProfiles(): UserProfile[] {
    try {
      const profilesJson = localStorage.getItem(PROFILES_KEY)
      if (!profilesJson) {
        return []
      }
      return JSON.parse(profilesJson)
    } catch (error) {
      console.error("Error al obtener perfiles de usuario:", error)
      return []
    }
  }

  // Obtener el perfil activo
  public getActiveProfile(): UserProfile | null {
    try {
      const activeProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY)
      if (!activeProfileId) {
        return null
      }

      const profiles = this.getAllProfiles()
      return profiles.find((profile) => profile.id === activeProfileId) || null
    } catch (error) {
      console.error("Error al obtener perfil activo:", error)
      return null
    }
  }

  // Crear un nuevo perfil de usuario
  public createProfile(name: string, email?: string, avatar?: string): UserProfile {
    try {
      const profiles = this.getAllProfiles()

      // Generar un ID único
      const id = `user_${Date.now()}`

      const newProfile: UserProfile = {
        id,
        name: name.trim(),
        email,
        avatar,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
      }

      // Guardar el nuevo perfil
      const updatedProfiles = [...profiles, newProfile]
      localStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles))

      // Establecer como perfil activo
      this.setActiveProfile(id)

      // Inicializar el almacenamiento para este perfil
      this.initializeProfileStorage(id)

      return newProfile
    } catch (error) {
      console.error("Error al crear perfil de usuario:", error)
      throw new Error("No se pudo crear el perfil de usuario")
    }
  }

  // Actualizar un perfil existente
  public updateProfile(id: string, data: Partial<UserProfile>): UserProfile | null {
    try {
      const profiles = this.getAllProfiles()
      const index = profiles.findIndex((profile) => profile.id === id)

      if (index === -1) return null

      const updatedProfile = { ...profiles[index], ...data }
      profiles[index] = updatedProfile

      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
      return updatedProfile
    } catch (error) {
      console.error(`Error al actualizar perfil ${id}:`, error)
      return null
    }
  }

  // Eliminar un perfil
  public deleteProfile(id: string): boolean {
    try {
      const profiles = this.getAllProfiles()
      const updatedProfiles = profiles.filter((profile) => profile.id !== id)

      localStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles))

      // Si el perfil eliminado era el activo, establecer otro como activo
      if (this.getActiveProfile()?.id === id) {
        if (updatedProfiles.length > 0) {
          this.setActiveProfile(updatedProfiles[0].id)
        } else {
          localStorage.removeItem(ACTIVE_PROFILE_KEY)
        }
      }

      // Eliminar los datos asociados a este perfil
      this.clearProfileStorage(id)

      return true
    } catch (error) {
      console.error(`Error al eliminar perfil ${id}:`, error)
      return false
    }
  }

  // Establecer un perfil como activo
  public setActiveProfile(id: string): boolean {
    try {
      const profiles = this.getAllProfiles()
      const profile = profiles.find((p) => p.id === id)

      if (!profile) return false

      // Actualizar la fecha de último inicio de sesión
      this.updateProfile(id, { lastLogin: new Date().toISOString(), isActive: true })

      // Establecer como perfil activo
      localStorage.setItem(ACTIVE_PROFILE_KEY, id)

      // Activar el almacenamiento para este perfil
      this.activateProfileStorage(id)

      return true
    } catch (error) {
      console.error(`Error al establecer perfil activo ${id}:`, error)
      return false
    }
  }

  // Inicializar el almacenamiento para un nuevo perfil
  private initializeProfileStorage(profileId: string): void {
    // Crear un objeto para almacenar las claves originales y sus valores
    const profileStorage: Record<string, string> = {}

    // Guardar el almacenamiento inicial
    localStorage.setItem(`${PROFILE_DATA_PREFIX}${profileId}`, JSON.stringify(profileStorage))
  }

  // Activar el almacenamiento para un perfil
  private activateProfileStorage(profileId: string): void {
    // Guardar el estado actual del localStorage para el perfil anterior
    const activeProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY)
    if (activeProfileId && activeProfileId !== profileId) {
      this.saveCurrentStorageState(activeProfileId)
    }

    // Limpiar el localStorage actual (excepto las claves del sistema de perfiles)
    this.clearCurrentStorage()

    // Cargar el almacenamiento del perfil seleccionado
    this.loadProfileStorage(profileId)
  }

  // Guardar el estado actual del localStorage para un perfil
  private saveCurrentStorageState(profileId: string): void {
    const profileStorage: Record<string, string> = {}

    // Recorrer todas las claves en localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && !this.isProfileSystemKey(key)) {
        profileStorage[key] = localStorage.getItem(key) || ""
      }
    }

    // Guardar el estado actual
    localStorage.setItem(`${PROFILE_DATA_PREFIX}${profileId}`, JSON.stringify(profileStorage))
  }

  // Limpiar el localStorage actual (excepto las claves del sistema de perfiles)
  private clearCurrentStorage(): void {
    const keysToRemove: string[] = []

    // Identificar las claves a eliminar
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && !this.isProfileSystemKey(key)) {
        keysToRemove.push(key)
      }
    }

    // Eliminar las claves
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  }

  // Cargar el almacenamiento de un perfil
  private loadProfileStorage(profileId: string): void {
    try {
      const profileStorageJson = localStorage.getItem(`${PROFILE_DATA_PREFIX}${profileId}`)
      if (!profileStorageJson) return

      const profileStorage = JSON.parse(profileStorageJson)

      // Cargar los datos del perfil en localStorage
      Object.entries(profileStorage).forEach(([key, value]) => {
        localStorage.setItem(key, value as string)
      })
    } catch (error) {
      console.error(`Error al cargar almacenamiento del perfil ${profileId}:`, error)
    }
  }

  // Limpiar el almacenamiento asociado a un perfil
  private clearProfileStorage(profileId: string): void {
    localStorage.removeItem(`${PROFILE_DATA_PREFIX}${profileId}`)
  }

  // Verificar si una clave pertenece al sistema de perfiles
  private isProfileSystemKey(key: string): boolean {
    return key === PROFILES_KEY || key === ACTIVE_PROFILE_KEY || key.startsWith(PROFILE_DATA_PREFIX)
  }

  // Exportar los datos de un perfil
  public exportProfileData(profileId: string): Record<string, string> {
    try {
      const profileStorageJson = localStorage.getItem(`${PROFILE_DATA_PREFIX}${profileId}`)
      if (!profileStorageJson) return {}

      return JSON.parse(profileStorageJson)
    } catch (error) {
      console.error(`Error al exportar datos del perfil ${profileId}:`, error)
      return {}
    }
  }

  // Importar datos a un perfil
  public importProfileData(profileId: string, data: Record<string, string>): boolean {
    try {
      localStorage.setItem(`${PROFILE_DATA_PREFIX}${profileId}`, JSON.stringify(data))

      // Si este es el perfil activo, cargar los datos inmediatamente
      if (this.getActiveProfile()?.id === profileId) {
        this.clearCurrentStorage()
        this.loadProfileStorage(profileId)
      }

      return true
    } catch (error) {
      console.error(`Error al importar datos al perfil ${profileId}:`, error)
      return false
    }
  }
}

// Exportar una instancia del servicio
const userProfileService = new UserProfileService()
export default userProfileService
