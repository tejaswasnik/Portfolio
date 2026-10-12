import "@/styles/globals.css";

export const metadata = {
  title: "Tejas Wasnik",
  description: "Portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
