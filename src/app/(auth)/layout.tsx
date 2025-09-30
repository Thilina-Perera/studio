import { Logo } from '@/components/logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="mb-8 animate-fade-in-down">
        <Logo />
      </div>
      <div className="animate-fade-in-up">{children}</div>
    </div>
  );
}
