import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest } from '@/lib/auth/session';
import { ReportService } from '@/lib/services/reportService';

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Harap masuk terlebih dahulu.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');

    if (format === 'csv') {
      const csv = ReportService.generateCsv(user);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="laporan-pengaduan-siwarga-${Date.now()}.csv"`,
        },
      });
    }

    const summary = ReportService.getReportSummary(user);
    return NextResponse.json({ summary });
  } catch (err) {
    console.error('Reports error:', err);
    return NextResponse.json({ error: 'Gagal menghasilkan laporan.' }, { status: 500 });
  }
}
