"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadCloud, ImageIcon, FileText, X, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ReceiptUploaderProps {
  onUpload: (file: File, dataUrl: string) => void
  initialUrl?: string
}

export function ReceiptUploader({ onUpload, initialUrl }: ReceiptUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null)
  const [showPreview, setShowPreview] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Verificar que sea una imagen
    if (!file.type.match("image.*")) {
      alert("Por favor, sube una imagen válida (JPG, PNG, etc.).")
      return
    }

    // Crear URL para previsualización
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setPreviewUrl(dataUrl)
      onUpload(file, dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Comprobante de gasto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!previewUrl ? (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadCloud className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">Arrastra y suelta una imagen aquí, o</p>
            <Button type="button" variant="outline" onClick={handleButtonClick}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Seleccionar imagen
            </Button>
            <Input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
            <p className="text-xs text-muted-foreground mt-2">Formatos soportados: JPG, PNG, GIF</p>
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <Label className="font-medium">Imagen adjunta</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button variant="outline" size="sm" onClick={handleRemoveImage} className="text-destructive">
                  <X className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
            <div className="aspect-video bg-muted rounded-md overflow-hidden">
              <img src={previewUrl || "/placeholder.svg"} alt="Comprobante" className="w-full h-full object-contain" />
            </div>
          </div>
        )}

        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Vista previa del comprobante</DialogTitle>
            </DialogHeader>
            {previewUrl && (
              <div className="overflow-auto max-h-[70vh]">
                <img src={previewUrl || "/placeholder.svg"} alt="Comprobante" className="w-full object-contain" />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
