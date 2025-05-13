"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translations"
import type { OCRResult } from "@/services/ocr-service"

interface OCRResultsEditorProps {
  ocrResult: OCRResult
  onConfirm: (data: {
    name: string
    amount: number
    date: string
    notes?: string
  }) => void
  onCancel: () => void
}

export function OCRResultsEditor({ ocrResult, onConfirm, onCancel }: OCRResultsEditorProps) {
  const { t } = useTranslation()
  const { toast } = useToast()

  const [name, setName] = useState(ocrResult.extractedData.merchant || "")
  const [amount, setAmount] = useState(ocrResult.extractedData.amount?.toString() || "")
  const [date, setDate] = useState<Date | undefined>(
    ocrResult.extractedData.date ? new Date(ocrResult.extractedData.date) : new Date(),
  )
  const [notes, setNotes] = useState(
    ocrResult.extractedData.items
      ?.map(
        (item) =>
          `${item.description || "Artículo"} ${item.quantity ? `(${item.quantity}x)` : ""}: ${item.price || 0}€`,
      )
      .join("\n") || "",
  )

  const [showRawText, setShowRawText] = useState(false)

  const handleConfirm = () => {
    if (!name.trim()) {
      toast({
        title: t("error"),
        description: t("receipt_name_required"),
        variant: "destructive",
      })
      return
    }

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: t("error"),
        description: t("receipt_amount_invalid"),
        variant: "destructive",
      })
      return
    }

    onConfirm({
      name,
      amount: amountValue,
      date: date?.toISOString() || new Date().toISOString(),
      notes: notes.trim() || undefined,
    })
  }

  const confidenceColor =
    ocrResult.confidence >= 80
      ? "bg-green-100 text-green-800"
      : ocrResult.confidence >= 50
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800"

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("receipt_ocr_results")}</CardTitle>
          <Badge className={confidenceColor}>
            {t("confidence")}: {Math.round(ocrResult.confidence)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="extracted">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="extracted">{t("extracted_data")}</TabsTrigger>
            <TabsTrigger value="raw">{t("raw_text")}</TabsTrigger>
          </TabsList>

          <TabsContent value="extracted" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="merchant">{t("merchant_name")}</Label>
              <Input
                id="merchant"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("enter_merchant_name")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t("amount")}</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-muted-foreground">€</span>
                </div>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">{t("date")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: es }) : t("select_date")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={es} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("items_details")}</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("items_details_placeholder")}
                className="w-full min-h-[100px] p-2 border rounded-md"
              />
            </div>

            {ocrResult.confidence < 70 && (
              <div className="flex items-start p-3 text-sm bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-yellow-700">{t("low_confidence_warning")}</p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={onCancel}>
                {t("cancel")}
              </Button>
              <Button onClick={handleConfirm}>
                <Check className="h-4 w-4 mr-2" />
                {t("confirm_data")}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="raw" className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t("recognized_text")}</Label>
                <Badge variant="outline">
                  {ocrResult.text.length} {t("characters")}
                </Badge>
              </div>
              <ScrollArea className="h-[300px] w-full border rounded-md p-4 bg-muted/30">
                <pre className="text-sm whitespace-pre-wrap break-words font-mono">
                  {ocrResult.text || t("no_text_recognized")}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
