import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar></Navbar>
          {children}
          </Providers>
      </body>
    </html>
  );
}
