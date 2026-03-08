import "./globals.css";

export const metadata = {
  title: "Barry Family PCS Planner",
  description: "Family-friendly PCS operations dashboard for the Barry move.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
