"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag, Plus } from "lucide-react"
import db from "@/lib/db"

interface TagManagerProps {
  onSelectTag?: (tag: string) => void
}

export function TagManager({ onSelectTag }: TagManagerProps) {
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    setTags(db.getAllTags())
  }, [])

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()]
      setTags(updatedTags)
      db.addTag(newTag.trim())
      setNewTag("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Tag className="h-5 w-5 mr-2" />
          Gestión de etiquetas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Nueva etiqueta"
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleAddTag} disabled={!newTag.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay etiquetas disponibles. Añade algunas para organizar tus gastos.
            </p>
          ) : (
            tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="px-3 py-1 cursor-pointer hover:bg-secondary/80"
                onClick={() => onSelectTag && onSelectTag(tag)}
              >
                {tag}
                {/* No añadimos botón de eliminar para evitar eliminar etiquetas en uso */}
              </Badge>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
