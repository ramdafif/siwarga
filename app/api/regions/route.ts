import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { AuditService } from '@/lib/services/auditService';

export async function GET() {
  try {
    const region = store.getRegion();
    const rws = store.getRWs();
    const rts = store.getRTs();

    return NextResponse.json({ region, rws, rts });
  } catch (err) {
    console.error('Get regions error:', err);
    return NextResponse.json({ error: 'Gagal memuat data wilayah.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses terbatas untuk Super Admin.' }, { status: 403 });
    }

    const body = await req.json();
    const { type, number, name, leader_name, leader_phone, rw_id, address } = body;

    if (type === 'RW') {
      const newRW = store.createRW({
        region_id: 'reg-01',
        number,
        name: name || `RW ${number}`,
        leader_name: leader_name || '',
        leader_phone: leader_phone || '',
        address: address || '',
      });

      AuditService.log({
        user,
        action: 'CREATE_RW',
        module: 'REGION',
        recordId: newRW.id,
        newValue: `Pembuatan RW ${newRW.number}`,
      });

      return NextResponse.json({ success: true, rw: newRW });
    } else if (type === 'RT') {
      if (!rw_id) {
        return NextResponse.json({ error: 'RW induk wajib dipilih.' }, { status: 422 });
      }

      const newRT = store.createRT({
        rw_id,
        number,
        name: name || `RT ${number}`,
        leader_name: leader_name || '',
        leader_phone: leader_phone || '',
      });

      AuditService.log({
        user,
        action: 'CREATE_RT',
        module: 'REGION',
        recordId: newRT.id,
        newValue: `Pembuatan RT ${newRT.number}`,
      });

      return NextResponse.json({ success: true, rt: newRT });
    }

    return NextResponse.json({ error: 'Tipe wilayah tidak valid.' }, { status: 400 });
  } catch (err) {
    console.error('Create region error:', err);
    return NextResponse.json({ error: 'Gagal menambahkan wilayah.' }, { status: 500 });
  }
}
