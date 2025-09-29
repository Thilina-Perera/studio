
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.'}),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Update user profile with name
      await updateProfile(user, { displayName: values.name });

      // Create a user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name: values.name,
        email: values.email,
        role: 'student', // Default role
      });

      // Send welcome email
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: values.email,
          subject: 'Welcome!',
          html: `<h1>Welcome, ${values.name}!</h1><p>Thanks for signing up. We\'re excited to have you.</p>`,
        }),
      });

      toast({
        title: 'Account Created!',
        description: 'Your account has been successfully created.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Signup Error:", error);
      let description = "Could not create your account. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        description = "An account with this email already exists. Please log in or use a different email.";
      }
       toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: description,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="m@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} {...field} />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" onClick={() => setShowPassword(false)} data-testid="password-visibility-toggle" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" onClick={() => setShowPassword(true)} data-testid="password-visibility-toggle" />
                    )}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Re-enter Password</FormLabel>
              <FormControl>
                 <div className="relative">
                  <Input type={showConfirmPassword ? 'text' : 'password'} {...field} />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" onClick={() => setShowConfirmPassword(false)} data-testid="confirm-password-visibility-toggle" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" onClick={() => setShowConfirmPassword(true)} data-testid="confirm-password-visibility-toggle" />
                    )}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
           {form.formState.isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  );
}
