interface Window {
  showOpenFilePicker?: (options?: any) => Promise<any[]>
  showSaveFilePicker?: (options?: any) => Promise<any>
  showDirectoryPicker?: (options?: any) => Promise<any>
}
