export const metadata = {
  title: 'Barry Family PCS Tracker',
  description: 'Shared PCS dashboard for the Barry family move',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
