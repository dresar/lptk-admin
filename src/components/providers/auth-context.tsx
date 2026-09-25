'use client';

import React, { createContext, useContext } from 'react';
import { AuthUser } from '@/types/auth';

interface AuthContextType {
  user: AuthUser | null;
  hasPermission: (permissionCode: string) => boolean;
  canManageCompetition: boolean;
  isDesaOperator: boolean;
  isKecamatanAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  hasPermission: () => false,
  canManageCompetition: false,
  isDesaOperator: false,
  isKecamatanAdmin: false,
  isSuperAdmin: false,
});

export function AuthProvider({
  user,
  children,
}: {
  user: AuthUser | null;
  children: React.ReactNode;
}) {
  const isSuperAdmin = user?.role_code === 'SUPER_ADMIN';
  const isKecamatanAdmin = user?.role_code === 'ADMIN_KECAMATAN';
  const isDesaOperator = user?.role_code === 'OPERATOR_LPTK';

  const hasPermission = (code: string) => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    return user.permissions?.includes(code) ?? false;
  };

  // Editing/managing competitions is strictly restricted to SUPER_ADMIN only
  const canManageCompetition = isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        hasPermission,
        canManageCompetition,
        isDesaOperator,
        isKecamatanAdmin,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
