
import { Logo } from '@/components/logo';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <Image
        src="https://sdmntpraustraliaeast.oaiusercontent.com/files/00000000-b414-61fa-9586-5815355b1799/raw?se=2025-10-05T12%3A33%3A40Z&sp=r&sv=2024-08-04&sr=b&scid=2278696a-53e8-58e3-b170-c6dcb7bda862&skoid=cb94e22a-e3df-4e6a-9e17-1696f40fa435&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-04T21%3A41%3A59Z&ske=2025-10-05T21%3A41%3A59Z&sks=b&skv=2024-08-04&sig=zikrYsY9EGCknGR7BvaROvLHG5wAbfBzPdna9wMRvsk%3D"
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="z-0 blur-sm scale-105"
      />
      <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center max-w-6xl w-full">
        <div className="text-white space-y-4 text-center md:text-left">
           <div className="flex justify-center md:justify-start">
            <Logo />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
             Streamline Your Club's Finances with ReimburseAI
          </h1>
          <p className="text-lg md:text-xl text-white/80">
            Focus on your events, not paperwork. Our AI-powered platform simplifies expense management.
          </p>
        </div>

        <div className="animate-fade-in-up">
          {children}
        </div>
      </div>
    </div>
  );
}
