'use client'

import { useEffect } from 'react'
import { useProgress } from './ProgressContext'

export default function RecipeTracker({ slug }: { slug: string }) {
  const { addRecipeView } = useProgress()

  useEffect(() => {
    addRecipeView(slug)
  }, [slug, addRecipeView])

  return null
}
