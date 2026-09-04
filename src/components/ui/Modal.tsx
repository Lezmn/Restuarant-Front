import { useEffect, useRef, type ReactNode } from 'react'

/** กล่องซ้อนกลางจอ — ปิดด้วย Esc หรือคลิกพื้นหลัง, โฟกัสเข้ากล่องอัตโนมัติ */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    // กันพื้นหลังเลื่อนตอนเปิดกล่อง
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector('input')?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg border-2 border-gray-300 bg-white p-5 shadow-xl"
      >
        <h2 className="mb-4 text-center text-lg font-bold text-black">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}
