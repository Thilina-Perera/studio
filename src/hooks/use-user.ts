// This is a mock user hook for development purposes.
// In a real application, this would be replaced with a proper authentication hook
// that fetches user data from a service like Firebase Authentication.
'use client'

import { useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';

const adminUser = mockUsers.find(u => u.role === 'admin')!;
const repUser = mockUsers.find(u => u.role === 'representative')!;

// Helper to get/set the role from localStorage for persistence across reloads
const getInitialRole = (): UserRole => {
    if (typeof window !== 'undefined') {
        const storedRole = localStorage.getItem('userRole') as UserRole;
        return storedRole === 'admin' || storedRole === 'representative' ? storedRole : 'admin';
    }
    return 'admin';
};


export function useUser() {
  const [role, setRole] = useState<UserRole>('admin');

  useEffect(() => {
    setRole(getInitialRole());
  }, [])
  

  const user: User | null = role === 'admin' ? adminUser : repUser;

  const toggleRole = useCallback(() => {
    const newRole = role === 'admin' ? 'representative' : 'admin';
    localStorage.setItem('userRole', newRole);
    setRole(newRole);
  }, [role]);

  return { user, role, toggleRole };
}
