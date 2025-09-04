import { useState } from "react"
import { SearchInput } from "@/components/ui/search-input"
import { ResultCard } from "@/components/result-card"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { Loader2, SearchX } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Result {
  name: string
  no: number
  category?: number | null
  grade?: number | null
  rank?: number | null
}

export function SearchSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [shouldSearch, setShouldSearch] = useState(false)
  
  const { data: results, isLoading, error } = useQuery({
    queryKey: ['results', searchTerm, shouldSearch],
    queryFn: async () => {
      if (!searchTerm.trim() || !shouldSearch) return []
      
      // تنظيف النص المدخل وإزالة المسافات الزائدة
      const cleanSearchTerm = searchTerm.trim()
      
      // التحقق من وجود اسمين على الأقل
      const words = cleanSearchTerm.split(' ').filter(word => word.length > 0)
      if (words.length < 2) {
        throw new Error('يجب إدخال الاسم الأول والثاني على الأقل')
      }
      
      // البحث بطرق متعددة لضمان العثور على النتائج
      const { data, error } = await supabase
        .from('results')
        .select('name, no, category, grade, rank')
        .ilike('name', `%${cleanSearchTerm}%`)
        .order('rank', { ascending: true, nullsFirst: false })
        .order('grade', { ascending: false })
        .limit(5) // عرض أكثر من نتيجة للتأكد من العثور على الصحيحة
      
      // إذا لم نجد نتائج، نجرب البحث بالكلمات المنفصلة
      if (data && data.length === 0 && cleanSearchTerm.includes(' ')) {
        const words = cleanSearchTerm.split(' ').filter(word => word.length > 0)
        const searchPattern = words.join('%')
        
        const { data: alternativeData, error: altError } = await supabase
          .from('results')
          .select('name, no, category, grade, rank')
          .ilike('name', `%${searchPattern}%`)
          .order('rank', { ascending: true, nullsFirst: false })
          .order('grade', { ascending: false })
          .limit(5)
        
        if (altError) throw altError
        return alternativeData as Result[]
      }
      
      if (error) throw error
      return data as Result[]
    },
    enabled: searchTerm.trim().split(' ').filter(word => word.length > 0).length >= 2 && shouldSearch
  })

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setShouldSearch(true)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="mb-8">
        <SearchInput
          placeholder="ادخل الاسم الأول والثاني للبحث عن النتيجة..."
          onSearch={handleSearch}
          isLoading={isLoading}
          className="text-lg"
        />
        <p className="text-sm text-muted-foreground mt-2 text-center">
          يرجى كتابة الاسم الأول والثاني على الأقل للبحث
        </p>
      </div>

      {/* Loading State */}
      {isLoading && shouldSearch && (
        <Card className="w-full max-w-md mx-auto islamic-pattern">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
              <p className="text-muted-foreground">جاري البحث...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="w-full max-w-md mx-auto border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <SearchX className="h-8 w-8 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-2">حدث خطأ في البحث</p>
              {error?.message === 'يجب إدخال الاسم الأول والثاني على الأقل' ? (
                <p className="text-sm text-muted-foreground mb-3">
                  {error.message}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mb-3">
                  حدث خطأ غير متوقع في النظام
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                للتواصل والمساعدة: 
                <a 
                  href="https://wa.me/201559181558" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 font-semibold ml-1"
                >
                  +201559181558
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {!isLoading && shouldSearch && searchTerm && results && results.length === 0 && (
        <Card className="w-full max-w-md mx-auto border-warning/30 bg-warning/5">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <SearchX className="h-8 w-8 text-warning mx-auto mb-4" />
              <p className="text-warning-foreground mb-2">لم يتم العثور على نتائج</p>
              <p className="text-sm text-muted-foreground mb-3">
                تأكد من كتابة الاسم الأول والثاني بشكل صحيح
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div className="space-y-6">
          {/* عرض جميع النتائج المطابقة */}
          {results.map((result) => (
            <ResultCard
              key={result.no}
              name={result.name || "غير محدد"}
              grade={result.grade || 0}
              category={result.category}
              rank={result.rank}
            />
          ))}
          
          {/* إذا كان هناك أكثر من نتيجة، اعرض رسالة توضيحية */}
          {results.length > 1 && (
            <div className="mt-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 max-w-md mx-auto">
              <p className="text-yellow-800 text-sm text-center font-medium">
                📝 تم العثور على {results.length} نتائج مطابقة. تأكد من اختيار النتيجة الصحيحة.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!shouldSearch && (
        <Card className="w-full max-w-md mx-auto islamic-pattern border-accent/20">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="p-4 rounded-full bg-gradient-golden text-accent-foreground mx-auto mb-4 w-fit animate-float">
                <SearchX className="h-8 w-8" />
              </div>
              <p className="text-muted-foreground text-lg font-medium mb-4">
                ابدأ بكتابة الاسم الأول والثاني للبحث عن النتيجة
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                🎯 معايير النجاح: من 85 درجة فما فوق
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}