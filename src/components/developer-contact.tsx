import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Facebook, ChevronDown, ChevronUp } from "lucide-react"

export function DeveloperContact() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mt-4">
      <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground font-medium">
        <span>للمساعدة أو الاستفسار:</span>
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 font-semibold p-0 h-auto hover:bg-transparent underline decoration-2 underline-offset-4"
        >
          eng/ahmed tareq
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-1" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <Card className="mt-4 max-w-md mx-auto border-blue-200 bg-blue-50/50 animate-in slide-in-from-top-2 duration-300">
          <CardContent className="p-4">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  AT
                </div>
                <div>
                  <h3 className="font-bold text-blue-800">أحمد طارق</h3>
                  <p className="text-xs text-blue-600">مطور التطبيق</p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 transition-all duration-300"
                >
                  <a 
                    href="https://wa.me/201559181558" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    واتساب
                  </a>
                </Button>
                
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition-all duration-300"
                >
                  <a 
                    href="https://www.facebook.com/palestine7102023y/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Facebook className="h-4 w-4" />
                    فيسبوك
                  </a>
                </Button>
              </div>
              
              <p className="text-xs text-blue-600 leading-relaxed">
                للدعم التقني والاستفسارات حول التطبيق
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}