/*
  # تحديث نظام الترتيب حسب الفئة

  1. تحديث الترتيب
    - حساب الترتيب لكل فئة بناءً على الدرجات
    - ترتيب تنازلي (الأعلى درجة = الترتيب الأول)
    
  2. الأمان
    - تحديث البيانات الموجودة فقط
    - لا يتم حذف أي بيانات
*/

-- تحديث الترتيب لكل فئة بناءً على الدرجات
UPDATE results 
SET rank = ranked_results.new_rank
FROM (
  SELECT 
    no,
    ROW_NUMBER() OVER (
      PARTITION BY category 
      ORDER BY grade DESC NULLS LAST, no ASC
    ) as new_rank
  FROM results
  WHERE category IS NOT NULL AND grade IS NOT NULL
) as ranked_results
WHERE results.no = ranked_results.no;

-- تحديث الترتيب العام للمشاركين بدون فئة محددة
UPDATE results 
SET rank = general_ranked.new_rank
FROM (
  SELECT 
    no,
    ROW_NUMBER() OVER (
      ORDER BY grade DESC NULLS LAST, no ASC
    ) as new_rank
  FROM results
  WHERE category IS NULL AND grade IS NOT NULL
) as general_ranked
WHERE results.no = general_ranked.no AND results.category IS NULL;