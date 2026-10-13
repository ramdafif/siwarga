import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { AuditService } from '@/lib/services/auditService';

export async function GET() {
  try {
    const categories = store.getCategories(false);
    return NextResponse.json({ categories });
  } catch (err) {
    console.error('Get categories error:', err);
    return NextResponse.json({ error: 'Gagal memuat kategori.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses terbatas untuk Super Admin.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, code, description, icon, is_active } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi.' }, { status: 422 });
    }

    if (id) {
      // Update
      const updated = store.updateCategory(id, {
        name,
        code,
        description,
        icon: icon || 'HelpCircle',
        is_active: is_active ?? true,
      });

      AuditService.log({
        user,
        action: 'UPDATE_CATEGORY',
        module: 'CATEGORY',
        recordId: id,
        newValue: name,
      });

      return NextResponse.json({ success: true, category: updated });
    } else {
      // Create
      const newCat = store.createCategory({
        name,
        code: code || name.toUpperCase().replace(/\s+/g, '_'),
        description: description || '',
        icon: icon || 'Tag',
        is_active: true,
      });

      AuditService.log({
        user,
        action: 'CREATE_CATEGORY',
        module: 'CATEGORY',
        recordId: newCat.id,
        newValue: name,
      });

      return NextResponse.json({ success: true, category: newCat });
    }
  } catch (err) {
    console.error('Save category error:', err);
    return NextResponse.json({ error: 'Gagal menyimpan kategori.' }, { status: 500 });
  }
}
