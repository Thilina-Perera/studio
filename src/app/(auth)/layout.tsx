import { Logo } from '@/components/logo';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <Image
        src="https://sdmntpraustraliaeast.oaiusercontent.com/files/00000000-557c-61fa-a6a3-f20a893a51d2/raw?se=2025-10-05T12%3A21%3A21Z&sp=r&sv=2024-08-04&sr=b&scid=83113787-fa0b-51b6-9ecd-d23f01b28368&skoid=cb94e22a-e3df-4e6a-9e17-1696f40fa435&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-04T22%3A27%3A01Z&ske=2025-10-05T22%3A27%3A01Z&sks=b&skv=2024-08-04&sig=0is3xg55UBBBi7uoWeqM5jVgSg0hVOqRrpljivHJpUw%3D"
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex justify-center animate-fade-in-down">
          <Logo />
        </div>
        <div className="animate-fade-in-up">{children}</div>
      </div>
    </div>
  );
}
