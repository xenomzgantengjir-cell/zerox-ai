import "./globals.css";

export const metadata = {
  title: "ZEROX AI — Think Beyond Limits",
  description: "Multi-model AI workspace by Xenomz.",
  applicationName: "ZEROX AI"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0710"
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
