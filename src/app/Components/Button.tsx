"use client"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { IconZodiacSagittarius } from "@tabler/icons-react"
import { useRef } from "react"

export function ButtonDemo() {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    // Button clicked
  }

  return (
    <Card className="w-96 h-auto">
      <CardHeader className="text-center">
        <CardTitle>Button Variants</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          ref={buttonRef}
          variant="default"
          onClick={handleClick}
          onMouseEnter={() => {
            if (buttonRef.current) {
              buttonRef.current.click()
            }
          }}
        >
          Hover Auto-Click
        </Button>
        
        <Button variant="secondary">Secondary Button</Button>

        <Button variant="outline" className="cursor-pointer">
          Outline Button
        </Button>

        <Button variant="ghost" className="flex items-center gap-2">
          <IconZodiacSagittarius stroke={2} className="text-accent-foreground" />
          Button with Icon
        </Button>
        
        <Button variant="destructive">Destructive Button</Button>
        
        <Button variant="link">Link Button</Button>
        
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline">Small</Button>
          <Button size="lg" variant="secondary">Large</Button>
        </div>
      </CardContent>
    </Card>
  )
}
