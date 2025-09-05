import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import LoadingIndicator from '../components/LoadingIndicator';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // Helper to retry fetching the user document
    const fetchUserDocWithRetry = async (userDocRef, maxRetries = 5, delayMs = 500) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          return userDoc;
        }
        if (attempt < maxRetries) {
          await new Promise(res => setTimeout(res, delayMs));
        }
      }
      return null;
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AuthContext] onAuthStateChanged fired:', firebaseUser);
      setLoading(true);
      try {
        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          // Retry up to 5 times with 500ms delay
          const userDoc = await fetchUserDocWithRetry(userDocRef);
          console.log('[AuthContext] Firestore userDoc.exists:', userDoc && userDoc.exists());
          if (userDoc && userDoc.exists()) {
            setUser(firebaseUser);
            setUserData(userDoc.data());
          } else {
            // Edge case: Auth user exists without a Firestore document
            setUser(null);
            setUserData(null);
            await auth.signOut(); // Log them out to prevent issues
            console.log('[AuthContext] User signed out due to missing Firestore doc');
          }
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (err) {
        console.error('[AuthContext] Error in onAuthStateChanged:', err);
      } finally {
        setLoading(false);
        console.log('[AuthContext] setLoading(false) called');
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <LoadingIndicator message="Authenticating..." />;
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
