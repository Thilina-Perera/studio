import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, CreditCard, Rocket, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background border-b">
        <Logo />
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4 flex items-center h-10"
            href="/login"
          >
            Log In
          </Link>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_550px] lg:gap-12 xl:grid-cols-[1fr_650px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Streamline Your Club's Finances with ReimburseAI
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Focus on your events, not paperwork. Our AI-powered platform
                    simplifies expense management, making reimbursements faster
                    and more transparent for everyone.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">Get Started for Free</Link>
                  </Button>
                </div>
              </div>
              <Image
                alt="ReimburseAI Dashboard"
                className="mx-auto aspect-[16/9] overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                data-ai-hint="dashboard finance"
                height="450"
                src="https://placehold.co/700x450.png"
                width="700"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything you need to manage expenses.
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From submission to approval, our platform is designed to be
                  intuitive, secure, and intelligent.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center">
                   <CreditCard className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Effortless Submission</h3>
                <p className="text-sm text-muted-foreground">
                  Easily submit itemized expenses with receipts from any device.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center">
                  <Rocket className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-bold">AI Prioritization</h3>
                <p className="text-sm text-muted-foreground">
                  Our smart AI analyzes and ranks expenses by urgency, so you know what to focus on.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                 <div className="flex justify-center items-center">
                   <Briefcase className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Admin Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  A powerful dashboard for finance admins to view, filter, and manage all expenses.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2024 ReimburseAI. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-xs hover:underline underline-offset-4"
            href="#"
          >
            Terms of Service
          </Link>
          <Link
            className="text-xs hover:underline underline-offset-4"
            href="#"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
