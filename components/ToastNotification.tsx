'use client'

interface ToastNotificationProps {
  show: boolean
  message: string
  type: 'success' | 'error' | 'warning'
}

export default function ToastNotification({ show, message, type }: ToastNotificationProps) {
  if (!show) return null

  const bgColor = type === 'error'
    ? 'bg-red-600'
    : type === 'warning'
    ? 'bg-yellow-500'
    : 'bg-gray-900'

  return (
    <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-2xl animate-fade-in text-base font-semibold ${bgColor} text-white`}>
      {message}
    </div>
  )
}
