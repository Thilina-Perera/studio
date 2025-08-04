// This is a mock user hook for development purposes.
// In a real application, this would be replaced with a proper authentication hook
// that fetches user data from a service like Firebase Authentication.
'use client'

import { useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '@/lib/types';
import { useMockData } from './use-mock-data.tsx';

const roles: UserRole[] = ['admin', 'representative', 'student'];

// Helper to get/set the role from localStorage for persistence across reloads
const getInitialRole = (): UserRole => {
    if (typeof window !== 'undefined') {
        const storedRole = localStorage.getItem('userRole') as UserRole;
        return roles.includes(storedRole) ? storedRole : 'admin';
    }
    return 'admin';
};


export function useUser() {
  const [role, setRole] = useState<UserRole>('admin');
  const { users } = useMockData();

  const adminUser = users.find(u => u.role === 'admin')!;
  const repUser = users.find(u => u.role === 'representative')!;
  const studentUser = users.find(u => u.role === 'student')!;


  useEffect(() => {
    setRole(getInitialRole());
  }, [])
  

  const user: User | null = role === 'admin' ? adminUser : role === 'representative' ? repUser : studentUser;

  const toggleRole = useCallback(() => {
    const currentIndex = roles.indexOf(role);
    const nextIndex = (currentIndex + 1) % roles.length;
    const newRole = roles[nextIndex];
    localStorage.setItem('userRole', newRole);
    setRole(newRole);
  }, [role]);

  const getNextRole = () => {
     const currentIndex = roles.indexOf(role);
     const nextIndex = (currentIndex + 1) % roles.length;
     return roles[nextIndex];
  }

  return { user, role, toggleRole, getNextRole };
}
