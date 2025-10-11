import 'whatwg-fetch';
import '@testing-library/jest-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Make sure this path is correct

const testUser = {
  email: 'testuser@example.com',
  password: 'password123',
};

// Pre-test setup to create the test user
const setupTestUser = async () => {
  try {
    // Try to sign in the user first to see if they already exist
    await signInWithEmailAndPassword(auth, testUser.email, testUser.password);
  } catch (error) {
    // If the user does not exist, create them
    const firebaseError = error as { code?: string };
    if (firebaseError.code === 'auth/user-not-found') {
      await createUserWithEmailAndPassword(auth, testUser.email, testUser.password);
    }
  }
};

setupTestUser();
