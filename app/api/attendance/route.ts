import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAttendance, saveAttendance, getAllAttendance } from '@/lib/data';
import { AttendanceRecord } from '@/lib/types';

export async function GET(request: NextRequest) {
  const session = getSession(request);
  if (!session || session.type !== 'coach') {
    return NextResponse.json({ error: 'Coach access required' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (date) {
    const record = await getAttendance(date);
    return NextResponse.json(record || null);
  }

  const allRecords = await getAllAttendance();
  return NextResponse.json(allRecords);
}

export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (!session || session.type !== 'coach') {
    return NextResponse.json({ error: 'Coach access required' }, { status: 403 });
  }

  const body = await request.json();
  const { date, runners } = body;

  if (!date || !Array.isArray(runners)) {
    return NextResponse.json({ error: 'date and runners are required' }, { status: 400 });
  }

  const record: AttendanceRecord = { date, runners };
  await saveAttendance(record);

  return NextResponse.json({ success: true });
}
