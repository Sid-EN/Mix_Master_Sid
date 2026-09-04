'use client'

import { useRef, useState } from 'react'
import { clientUrl } from '@/lib/api'
import { useAuth } from './AuthContext'

interface ImportResult {
  importedKeys: string[]
  skippedKeys: string[]
  importedRecipes: number
  skippedRecipes: string[]
}

/** 資料備份：匯出為 JSON 檔，或由備份檔還原。 */
export default function BackupSettings() {
  const { token } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function exportData() {
    if (!token) return
    setBusy(true); setError(''); setMessage('')
    try {
      const res = await fetch(clientUrl('/api/v1/backup/export'), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('匯出失敗')
      const data = await res.json()

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mixmaster-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)

      const count = Object.keys(data.data ?? {}).length
      setMessage(`已匯出 ${count} 項資料與 ${data.recipes?.length ?? 0} 款配方`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '匯出失敗')
    } finally {
      setBusy(false)
    }
  }

  async function importData(file: File) {
    if (!token) return
    setBusy(true); setError(''); setMessage('')
    try {
      const parsed = JSON.parse(await file.text())
      const res = await fetch(clientUrl('/api/v1/backup/import'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(parsed),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        const d = body.detail
        throw new Error(Array.isArray(d) ? d.map((x: any) => x.msg).join('；') : d || '匯入失敗')
      }
      const r = body as ImportResult
      const parts = [`已還原 ${r.importedKeys.length} 項資料`, `新增 ${r.importedRecipes} 款配方`]
      if (r.skippedKeys.length) parts.push(`略過 ${r.skippedKeys.length} 項不支援的資料`)
      if (r.skippedRecipes.length) parts.push(`略過 ${r.skippedRecipes.length} 款無效配方`)
      setMessage(parts.join('、'))
    } catch (e) {
      setError(e instanceof SyntaxError ? '檔案不是有效的 JSON' :
        e instanceof Error ? e.message : '匯入失敗')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <section className="glass-card p-6 mb-6">
      <h2 className="font-display text-lg text-neon-amber mb-3">💾 資料備份</h2>
      <p className="font-mono text-[11px] text-text-muted mb-4">
        匯出可保存為本機檔案，或用於搬移至其他帳號。
        匯入為合併式還原，不會刪除現有資料。
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={exportData}
          disabled={busy}
          className="px-4 py-2 font-mono text-xs rounded border border-charcoal-700
                     text-text-muted hover:border-neon-amber hover:text-neon-amber
                     transition-colors disabled:opacity-40"
        >
          匯出備份
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="px-4 py-2 font-mono text-xs rounded border border-charcoal-700
                     text-text-muted hover:border-neon-cyan hover:text-neon-cyan
                     transition-colors disabled:opacity-40"
        >
          匯入備份
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          aria-label="選擇備份檔"
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) importData(f)
          }}
          className="hidden"
        />
      </div>

      {message && <p className="mt-4 font-mono text-xs text-neon-cyan">{message}</p>}
      {error && (
        <p role="alert" className="mt-4 font-mono text-xs text-red-400
                                   border border-red-500/40 bg-red-500/10 rounded px-3 py-2">
          {error}
        </p>
      )}
    </section>
  )
}
