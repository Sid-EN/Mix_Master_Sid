import { ImageResponse } from 'next/og'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/seo'

/**
 * 社群分享預覽圖
 *
 * 由 next/og 於建置期產生真正的 PNG，靜態版與完整版都能用，
 * 不需要額外的影像處理相依套件。1200×630 是各平台通用的尺寸。
 *
 * 寫成路由處理常式而非 Next 的 opengraph-image 檔案慣例：
 * 慣例產生的網址沒有副檔名（/opengraph-image），GitHub Pages 會以
 * application/octet-stream 提供，多數社群平台因此拒絕顯示；
 * 而且該慣例的優先序高於頁面自訂的 images，無法覆寫。
 * 以此路徑輸出，兩種部署的網址一致且帶有 .png。
 */
// output: export 不接受未標示的路由；此圖內容固定，建置期產生即可
export const dynamic = 'force-static'

const size = { width: 1200, height: 630 }

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 96px',
          background: 'linear-gradient(135deg, #0A0A0F 0%, #14141C 55%, #1B1310 100%)',
          color: '#F3E9D2',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <div style={{ fontSize: 72 }}>🍹</div>
          <div style={{ fontSize: 84, fontWeight: 700, color: '#F5A623' }}>{SITE_NAME}</div>
        </div>
        <div style={{ fontSize: 40, color: '#F3E9D2', marginBottom: 20 }}>{SITE_TAGLINE}</div>
        <div style={{ fontSize: 26, color: '#8A8A99', maxWidth: 900, lineHeight: 1.5 }}>
          {SITE_DESCRIPTION}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 44,
            height: 6,
            width: 260,
            background: 'linear-gradient(90deg, #F5A623, #00FFFF)',
          }}
        />
      </div>
    ),
    size,
  )
}
