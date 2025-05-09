"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SegmentedControlProps {
  options: string[]
  defaultValue?: string
  onChange?: (value: string) => void
  className?: string
}

export function SegmentedControl({ options, defaultValue, onChange, className }: SegmentedControlProps) {
  const [selectedOption, setSelectedOption] = useState(defaultValue || options[0])
  const [sliderWidth, setSliderWidth] = useState(0)
  const [sliderOffset, setSliderOffset] = useState(0)
  const controlRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Calcular la posición y ancho del slider
  useEffect(() => {
    const calculateSliderPosition = () => {
      const selectedIndex = options.indexOf(selectedOption)
      if (selectedIndex !== -1 && optionRefs.current[selectedIndex]) {
        const option = optionRefs.current[selectedIndex]
        if (option && controlRef.current) {
          const controlLeft = controlRef.current.getBoundingClientRect().left
          const optionLeft = option.getBoundingClientRect().left
          const optionWidth = option.offsetWidth

          setSliderOffset(optionLeft - controlLeft)
          setSliderWidth(optionWidth)
        }
      }
    }

    calculateSliderPosition()

    // Recalcular cuando cambia el tamaño de la ventana
    window.addEventListener("resize", calculateSliderPosition)
    return () => window.removeEventListener("resize", calculateSliderPosition)
  }, [selectedOption, options])

  const handleOptionClick = (option: string) => {
    setSelectedOption(option)
    onChange?.(option)
  }

  return (
    <div ref={controlRef} className={cn("segmented-control", className)}>
      {options.map((option, index) => (
        <button
          key={option}
          ref={(el) => (optionRefs.current[index] = el)}
          className={cn("segmented-control-option", selectedOption === option && "active")}
          onClick={() => handleOptionClick(option)}
        >
          {option}
        </button>
      ))}
      <div
        className="segmented-control-slider"
        style={{
          transform: `translateX(${sliderOffset}px)`,
          width: `${sliderWidth}px`,
        }}
      />
    </div>
  )
}
