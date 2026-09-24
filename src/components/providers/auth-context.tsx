'use client';

import React, { createContext, useContext } from 'react';
import { AuthUser } from '@/types/auth';

interface AuthContextType {
  user: AuthUser | null;
  hasPermission: (permissionCode: string) => boolean;
  canManageCompetition: boolean;
  isDesaOperator: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  hasPermission: () => false,
  canManageCompetition: false,
  isDesaOperator: false,
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
  const isDesaOperator = user?.role_code === 'OPERATOR_LPTK';

  const hasPermission = (code: string) => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    return user.permissions?.includes(code) ?? false;
  };

  // Admin LPTK Desa is strictly FORBIDDEN from editing/creating/deleting competitions
  const canManageCompetition =
    !isDesaOperator &&
    (isSuperAdmin || user?.role_code === 'ADMIN_KECAMATAN' || hasPermission('competition.write'));

  return (
    <AuthContext.Provider
      value={{
        user,
        hasPermission,
        canManageCompetition,
        isDesaOperator,
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
