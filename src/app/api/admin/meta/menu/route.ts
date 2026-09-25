import { NextRequest } from 'next/server';
import { successResponse, errorResponse, handleServerError } from '@/server/utils/response';
import { requireAuth, AuthError } from '@/server/middlewares/auth';

export interface MenuItem {
  title: string; // Maksimal 1 kata
  href: string;
  icon: string;
  permission?: string;
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { title: 'Dashboard', href: '/admin', icon: 'LayoutDashboard', permission: 'dashboard.read' },
  { title: 'Desa', href: '/admin/villages', icon: 'MapPin', permission: 'village.read' },
  { title: 'LPTK', href: '/admin/lptks', icon: 'Building2', permission: 'lptk.read' },
  { title: 'Pengguna', href: '/admin/users', icon: 'Users', permission: 'user.read' },
  { title: 'Peran', href: '/admin/roles', icon: 'Shield', permission: 'role.read' },
  { title: 'Lomba', href: '/admin/competitions', icon: 'Trophy', permission: 'competition.read' },
  { title: 'Kategori', href: '/admin/categories', icon: 'Tags', permission: 'category.read' },
  { title: 'Dokumen', href: '/admin/document-types', icon: 'FileText', permission: 'document_type.read' },
  { title: 'Peserta', href: '/admin/participants', icon: 'UserCheck', permission: 'participant.read' },
  { title: 'Verifikasi', href: '/admin/verifications', icon: 'CheckSquare', permission: 'verification.read' },
  { title: 'Laporan', href: '/admin/reports', icon: 'BarChart3', permission: 'report.read' },
  { title: 'Website', href: '/admin/website', icon: 'Globe', permission: 'setting.read' },
  { title: 'Berita', href: '/admin/posts', icon: 'Newspaper', permission: 'post.read' },
  { title: 'CDN', href: '/admin/cdn', icon: 'UploadCloud', permission: 'cdn.read' },
  { title: 'Juknis', href: '/admin/juknis', icon: 'BookOpen' },
  { title: 'Audit', href: '/admin/audit-logs', icon: 'History', permission: 'audit.read' },
  { title: 'Pengaturan', href: '/admin/settings', icon: 'Settings', permission: 'setting.read' },
];

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Specific clean menu for Operator Desa (Admin Desa)
    if (user.role_code === 'OPERATOR_LPTK') {
      const desaMenu: MenuItem[] = [
        { title: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
        { title: 'Kafilah', href: '/admin/lptks', icon: 'Building2' },
        { title: 'Peserta', href: '/admin/participants', icon: 'UserCheck' },
        { title: 'Juknis', href: '/admin/juknis', icon: 'BookOpen' },
        { title: 'Laporan', href: '/admin/reports', icon: 'BarChart3' },
      ];
      return successResponse({ menu: desaMenu });
    }

    // Filter menu based on user permissions or super admin
    const allowedMenu = ALL_MENU_ITEMS.filter((item) => {
      if (user.role_code === 'SUPER_ADMIN') return true;
      if (!item.permission) return true;
      return user.permissions.includes(item.permission);
    });

    return successResponse({ menu: allowedMenu });
  } catch (err) {
    if (err instanceof AuthError) {
      return errorResponse(err.code, err.message, err.code === 'UNAUTHORIZED' ? 401 : 403);
    }
    return handleServerError(err);
  }
}
