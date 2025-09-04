import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, Trophy, BookOpen, Lock, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"

export function StatsDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const correctPassword = "159200209Aa?"

  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      // إجمالي المشاركين
      const { count: totalParticipants } = await supabase
        .from('results')
        .select('*', { count: 'exact', head: true })

      // الناجحين (85 فما فوق)
      const { count: passedParticipants } = await supabase
        .from('results')
        .select('*', { count: 'exact', head: true })
        .gte('grade', 85)

      // أعلى درجة
      const { data: highestGrade } = await supabase
        .from('results')
        .select('grade, name')
        .order('grade', { ascending: false })
        .limit(1)
        .single()

      // متوسط الدرجات
      const { data: allGrades } = await supabase
        .from('results')
        .select('grade')
        .not('grade', 'is', null)

      const average = allGrades && allGrades.length > 0 
        ? allGrades.reduce((sum, item) => sum + (item.grade || 0), 0) / allGrades.length
        : 0

      // إحصائيات الفئات
      const { data: categoryStats } = await supabase
        .from('results')
        .select('category')
        .not('category', 'is', null)

      const categoryCounts = categoryStats?.reduce((acc, item) => {
        const cat = item.category
        if (cat) {
          acc[cat] = (acc[cat] || 0) + 1
        }
        return acc
      }, {} as Record<number, number>) || {}

      return {
        totalParticipants: totalParticipants || 0,
        passedParticipants: passedParticipants || 0,
        failedParticipants: (totalParticipants || 0) - (passedParticipants || 0),
        passRate: totalParticipants ? ((passedParticipants || 0) / totalParticipants * 100) : 0,
        highestGrade: highestGrade?.grade || 0,
        topStudent: highestGrade?.name || "غير محدد",
        averageGrade: Math.round(average * 100) / 100,
        categoryCounts
      }
    },
    enabled: isAuthenticated
  })

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === correctPassword) {
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("كلمة السر غير صحيحة")
      setPassword("")
    }
  }

  const getCategoryName = (category: number) => {
    switch (category) {
      case 1: return "جزء واحد"
      case 2: return "جزءين"
      case 3: return "ثلاثة أجزاء"
      case 4: return "أربعة أجزاء"
      case 5: return "خمسة أجزاء"
      case 10: return "عشرة أجزاء"
      case 15: return "خمسة عشر جزءاً"
      case 20: return "عشرون جزءاً"
      case 30: return "القرآن كاملاً"
      default: return `فئة ${category}`
    }
  }

  const resetDialog = () => {
    setIsAuthenticated(false)
    setPassword("")
    setError("")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) {
        resetDialog()
      }
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="fixed bottom-4 right-4 z-50 bg-card/80 backdrop-blur-sm border-accent/30 hover:bg-accent/20 transition-all duration-300 shadow-lg"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          إحصائيات
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-islamic bg-clip-text text-transparent">
            📊 إحصائيات المسابقة
          </DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="space-y-4">
            <div className="text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-accent" />
              <p className="text-muted-foreground mb-4">
                يرجى إدخال كلمة السر لعرض الإحصائيات
              </p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="كلمة السر"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}
              
              <Button type="submit" className="w-full" variant="islamic">
                <Lock className="h-4 w-4 mr-2" />
                دخول
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
                <p className="mt-4 text-muted-foreground">جاري تحميل الإحصائيات...</p>
              </div>
            ) : stats ? (
              <>
                {/* الإحصائيات الرئيسية */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="islamic-pattern">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">إجمالي المشاركين</CardTitle>
                      <Users className="h-4 w-4 text-accent" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">{stats.totalParticipants}</div>
                    </CardContent>
                  </Card>

                  <Card className="islamic-pattern">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">الناجحين</CardTitle>
                      <Trophy className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-success">{stats.passedParticipants}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.passRate.toFixed(1)}% نسبة النجاح
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="islamic-pattern">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">أعلى درجة</CardTitle>
                      <BookOpen className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-warning">{stats.highestGrade}</div>
                      <p className="text-xs text-muted-foreground truncate">
                        {stats.topStudent}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="islamic-pattern">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">متوسط الدرجات</CardTitle>
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">{stats.averageGrade}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* إحصائيات الفئات */}
                <Card className="islamic-pattern">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-center">📚 إحصائيات الفئات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(stats.categoryCounts)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <span className="text-sm font-medium">{getCategoryName(Number(category))}</span>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {count} مشارك
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* معلومات إضافية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-success/30 bg-success/5">
                    <CardHeader>
                      <CardTitle className="text-success flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        الناجحين
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-success mb-2">{stats.passedParticipants}</div>
                      <div className="text-sm text-muted-foreground">
                        من أصل {stats.totalParticipants} مشارك
                      </div>
                      <div className="mt-2 bg-success/20 rounded-full h-2">
                        <div 
                          className="bg-success h-2 rounded-full transition-all duration-500"
                          style={{ width: `${stats.passRate}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-destructive/30 bg-destructive/5">
                    <CardHeader>
                      <CardTitle className="text-destructive flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        لم ينجحوا بعد
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-destructive mb-2">{stats.failedParticipants}</div>
                      <div className="text-sm text-muted-foreground">
                        {(100 - stats.passRate).toFixed(1)}% من المشاركين
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        جعل الله القرآن شفيعًا لهم
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}