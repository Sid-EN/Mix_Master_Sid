'use client'

import { useEffect } from 'react'
import { useProgress } from './ProgressContext'

export default function AcademyTracker({ sectionId }: { sectionId: string }) {
  const { addAcademySection } = useProgress()

  useEffect(() => {
    addAcademySection(sectionId)
  }, [sectionId, addAcademySection])

  return null
}
