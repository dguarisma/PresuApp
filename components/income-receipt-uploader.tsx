"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadCloud, ImageIcon, FileText, X, Eye, Scan, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { OCRResultsEditor } from "@/components/ocr-results-editor"
import { processReceiptImage } from "@/services/ocr-service"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translations"
import type { OCRResult } from "@/services/ocr-service"

interface IncomeReceiptUploaderProps {
  onUpload: (file: File, dataUrl: string) => void
  onExtractedData?: (data: {
    name: string
    amount: number
    date: string
    notes?: string
  }) => void
  initialUrl?: string
}

export function IncomeReceiptUploader({ onUpload, onExtractedData, initialUrl }: IncomeReceiptUploaderProps) {
  const { t } = useTranslation()
  const { toast } = useToast()

  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null)
  const [showPreview, setShowPreview] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [showOcrResults, setShowOcrResults] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)

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
      toast({
        title: t("error"),
        description: t("please_upload_valid_image"),
        variant: "destructive",
      })
      return
    }

    // Crear URL para previsualización
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setPreviewUrl(dataUrl)
      setCurrentFile(file)
      onUpload(file, dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    setCurrentFile(null)
    setOcrResult(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const handleProcessOCR = async () => {
    if (!previewUrl) return

    setIsProcessing(true)
    try {
      const result = await processReceiptImage(previewUrl)
      setOcrResult(result)
      setShowOcrResults(true)

      if (result.confidence < 40) {
        toast({
          title: t("low_confidence"),
          description: t("ocr_low_confidence_message"),
          variant: "warning",
        })
      }
    } catch (error) {
      console.error("Error procesando OCR:", error)
      toast({
        title: t("error"),
        description: t("ocr_processing_error"),
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmOcrData = (data: {
    name: string
    amount: number
    date: string
    notes?: string
  }) => {
    if (onExtractedData) {
      onExtractedData(data)
    }
    setShowOcrResults(false)

    toast({
      title: t("success"),
      description: t("data_extracted_successfully"),
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {t("income_receipt")}
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
              <p className="text-sm text-muted-foreground mb-2">{t("drag_drop_image")}</p>
              <Button type="button" variant="outline" onClick={handleButtonClick}>
                <ImageIcon className="h-4 w-4 mr-2" />
                {t("select_image")}
              </Button>
              <Input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
              <p className="text-xs text-muted-foreground mt-2">{t("supported_formats")}</p>
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                <Label className="font-medium">{t("attached_image")}</Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                    <Eye className="h-4 w-4 mr-1" />
                    {t("view")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleProcessOCR}
                    disabled={isProcessing}
                    className="text-primary"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Scan className="h-4 w-4 mr-1" />
                    )}
                    {isProcessing ? t("processing") : t("scan_receipt")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRemoveImage} className="text-destructive">
                    <X className="h-4 w-4 mr-1" />
                    {t("remove")}
                  </Button>
                </div>
              </div>
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt={t("receipt")}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{t("receipt_preview")}</DialogTitle>
              </DialogHeader>
              {previewUrl && (
                <div className="overflow-auto max-h-[70vh]">
                  <img src={previewUrl || "/placeholder.svg"} alt={t("receipt")} className="w-full object-contain" />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Dialog open={showOcrResults} onOpenChange={setShowOcrResults}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("extracted_receipt_data")}</DialogTitle>
          </DialogHeader>
          {ocrResult && (
            <OCRResultsEditor
              ocrResult={ocrResult}
              onConfirm={handleConfirmOcrData}
              onCancel={() => setShowOcrResults(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
