// ============================================================
// NestMoney — Cognito Auth Helpers
// Uses expo-secure-store for token persistence. Never AsyncStorage.
// Phone OTP is primary auth method. Email/password is secondary.
// ============================================================

import * as SecureStore from 'expo-secure-store';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoAccessToken,
} from 'amazon-cognito-identity-js';

const USER_POOL_ID = process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID!;
const CLIENT_ID = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID!;

const SecureKeys = {
  ACCESS_TOKEN: 'nestmoney_access_token',
  REFRESH_TOKEN: 'nestmoney_refresh_token',
  ID_TOKEN: 'nestmoney_id_token',
  USER_ID: 'nestmoney_user_id',
} as const;

const userPool = new CognitoUserPool({
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
});

// ============================================================
// Token storage — always SecureStore, never AsyncStorage
// ============================================================

export async function storeTokens(
  accessToken: string,
  refreshToken: string,
  idToken: string
): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(SecureKeys.ACCESS_TOKEN, accessToken),
    SecureStore.setItemAsync(SecureKeys.REFRESH_TOKEN, refreshToken),
    SecureStore.setItemAsync(SecureKeys.ID_TOKEN, idToken),
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SecureKeys.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SecureKeys.REFRESH_TOKEN);
}

export async function getIdToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SecureKeys.ID_TOKEN);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(SecureKeys.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(SecureKeys.REFRESH_TOKEN),
    SecureStore.deleteItemAsync(SecureKeys.ID_TOKEN),
    SecureStore.deleteItemAsync(SecureKeys.USER_ID),
  ]);
}

// ============================================================
// Session check — called at app start from _layout.tsx
// ============================================================

export async function checkSession(): Promise<{ userId: string; accessToken: string } | null> {
  const accessToken = await getAccessToken();
  const userId = await SecureStore.getItemAsync(SecureKeys.USER_ID);

  if (!accessToken || !userId) return null;

  // TODO: Validate token expiry and refresh if needed
  return { userId, accessToken };
}

// ============================================================
// Phone OTP — primary auth method
// ============================================================

export async function initiatePhoneOtp(phone: string): Promise<string> {
  // Calls lambda/auth/confirm-otp via API Gateway
  // Returns a Cognito session string used to confirm the OTP
  // Actual implementation calls POST /auth/otp with phone number
  // Placeholder: returns empty session
  return '';
}

export async function confirmPhoneOtp(
  phone: string,
  code: string,
  session: string
): Promise<{ accessToken: string; refreshToken: string; idToken: string; userId: string }> {
  // Calls lambda/auth/confirm-otp via API Gateway with code + session
  // On success, stores tokens and returns user info
  // Placeholder: throws until implemented
  throw new Error('Not implemented — see lambda/auth/confirm-otp');
}

// ============================================================
// Email / password — secondary auth method
// ============================================================

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string; idToken: string; userId: string }> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: async (session: CognitoUserSession) => {
        const accessToken = session.getAccessToken().getJwtToken();
        const refreshToken = session.getRefreshToken().getToken();
        const idToken = session.getIdToken().getJwtToken();
        const userId = session.getIdToken().payload['sub'] as string;

        await storeTokens(accessToken, refreshToken, idToken);
        await SecureStore.setItemAsync(SecureKeys.USER_ID, userId);

        resolve({ accessToken, refreshToken, idToken, userId });
      },
      onFailure: (err: Error) => reject(err),
      newPasswordRequired: () => reject(new Error('New password required')),
    });
  });
}

// ============================================================
// Token refresh
// ============================================================

export async function refreshAccessToken(): Promise<string | null> {
  // Calls lambda/auth/refresh-token via API Gateway
  // On success, stores new access + id tokens
  // Returns new access token or null on failure
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  // Placeholder: full implementation will call the refresh Lambda
  return null;
}

// ============================================================
// Sign out
// ============================================================

export async function signOut(): Promise<void> {
  await clearTokens();
}
