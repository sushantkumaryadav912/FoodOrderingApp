import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import LoadingIndicator from '../components/LoadingIndicator';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [splashLoading, setSplashLoading] = useState(true);

  useEffect(() => {
    const splashTimeout = setTimeout(() => {
      setSplashLoading(false);
    }, 3000);

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
          const userDoc = await fetchUserDocWithRetry(userDocRef);
          console.log('[AuthContext] Firestore userDoc.exists:', userDoc && userDoc.exists());
          if (userDoc && userDoc.exists()) {
            setUser(firebaseUser);
            setUserData(userDoc.data());
            // Fetch user profile from userProfiles collection
            try {
              const profileDocRef = doc(db, 'userProfiles', firebaseUser.uid);
              const profileDoc = await getDoc(profileDocRef);
              if (profileDoc.exists()) {
                setUserProfile(profileDoc.data());
              } else {
                setUserProfile(null);
              }
            } catch (profileErr) {
              setUserProfile(null);
              console.error('[AuthContext] Error fetching user profile:', profileErr);
            }
          } else {
            setUser(null);
            setUserData(null);
            setUserProfile(null);
            await auth.signOut();
            console.log('[AuthContext] User signed out due to missing Firestore doc');
          }
        } else {
          setUser(null);
          setUserData(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('[AuthContext] Error in onAuthStateChanged:', err);
      } finally {
        setLoading(false);
        console.log('[AuthContext] setLoading(false) called');
      }
    });

    return () => {
      clearTimeout(splashTimeout);
      unsubscribe();
    };
  }, []);

  if (loading) {
    return <LoadingIndicator message="Authenticating..." />;
  }

  return (
    <AuthContext.Provider value={{ user, userData, userProfile, loading, splashLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
