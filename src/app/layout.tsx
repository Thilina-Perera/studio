
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseProvider } from '@/hooks/use-firebase';
import { UserProvider } from '@/hooks/use-user';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'ReimburseAI',
  description: 'AI-powered expense management for clubs and organizations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <FirebaseProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </FirebaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
