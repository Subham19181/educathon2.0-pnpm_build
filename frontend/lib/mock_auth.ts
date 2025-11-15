/**
 * EMERGENCY 5AM DEMO MODE
 * This allows testing without Firebase auth while the API propagates
 * Remove this after Firebase is enabled
 */

export const DEMO_MODE = true; // Set to false when Firebase is working

export const getMockUser = () => {
  if (!DEMO_MODE) return null;
  
  return {
    uid: 'demo-user-12345',
    email: 'demo@studywise.local',
    displayName: 'Demo User',
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: 'demo-token',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'demo-token',
    getIdTokenResult: async () => ({ token: 'demo-token', expirationTime: new Date().toISOString() }),
    reload: async () => {},
    toJSON: () => ({}),
  } as any;
};

export const mockSignIn = async () => {
  console.log('[DEMO MODE] Simulating Google sign-in...');
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[DEMO MODE] Mock sign-in complete');
      resolve({ user: getMockUser() });
    }, 1500);
  });
};

export const mockSignOut = async () => {
  console.log('[DEMO MODE] Simulating sign-out...');
  return Promise.resolve();
};
