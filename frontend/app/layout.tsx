import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EventBook",
  description: "Discover and book events with Event Booking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; 
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className} min-h-screen flex flex-col`}>
       <AuthProvider>
         <Navbar/>
        <main>

         {children} 
        </main>
         </AuthProvider>  
      </body>
    </html>
  );
}
