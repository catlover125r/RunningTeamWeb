import { getDb } from './firebase';
import { Config, WeekSchedule, Announcement, AttendanceRecord } from './types';

// Default config to seed Firestore on first run
const DEFAULT_CONFIG: Config = {
  coachCode: '2947',
  groups: [
    {
      id: 'girls-all',
      name: 'Girls',
      color: 'pink',
      accessCode: '3816',
      runners: ['Alisa Portner', 'Ava Wu', 'Elena Dils', 'Elise Leparmentier', 'Nina Vijeh', 'Reese Skye', "Sabine O'Hara"],
    },
    {
      id: 'boys-v',
      name: 'Boys V',
      color: 'purple',
      accessCode: '5294',
      runners: ['Luke Popler', 'Matthew Macedo', 'Will Raymond', 'Henry Giardi', 'Meezahn Kemal', 'Theodore Tidwell', 'Colin Henderson', 'Jose Can'],
    },
    {
      id: 'boys-jv-12',
      name: 'Boys JV (12)',
      color: 'blue',
      accessCode: '7031',
      runners: ['Brennan Sherman', 'Cole Boggs'],
    },
    {
      id: 'boys-jv-9',
      name: 'Boys JV (9)',
      color: 'green',
      accessCode: '6482',
      runners: ['Kai Rechin', 'Reed Murphy', 'Senahn Kemal', 'Tiernan Weaver', 'Viggo Laustsen', 'Rohan Sanghvi'],
    },
    {
      id: 'boys-jv-10',
      name: 'Boys JV (10)',
      color: 'orange',
      accessCode: '1957',
      runners: ['Jacob Reynolds', 'Sachin Paranjpye', 'Dylan Bringley', 'Ben Carter'],
    },
  ],
  routes: [
    { id: 'britten', name: 'Britten', description: 'Loop through the Britten neighborhood', distance: '', imageFile: 'britten.png' },
    { id: 'bair-island', name: 'Bair Island', description: 'Out and back to Bair Island along the bay', distance: '', imageFile: 'bair-island.png' },
    { id: 'emerald-hills', name: 'Emerald Hills', description: 'Hilly loop through Emerald Hills', distance: '', imageFile: 'emerald-hills.png' },
    { id: 'mcloop', name: 'Mcloop', description: 'Loop through the neighborhood near Mcauley Park', distance: '', imageFile: 'mcloop.png' },
    { id: 'around-school', name: 'Around the School', description: 'Short loop around the school campus', distance: '', imageFile: 'around-school.png' },
    { id: 'prison', name: 'Prison', description: 'Run out toward the waterfront near the old prison', distance: '', imageFile: 'prison.png' },
    { id: 'terris', name: 'Terris', description: 'Loop through the Terris neighborhood', distance: '', imageFile: 'terris.png' },
    { id: 'burton', name: 'Burton', description: 'Long loop through Burton and surrounding neighborhoods', distance: '', imageFile: 'burton.png' },
    { id: 'laural-trader-joes', name: 'Laural/Trader Joes', description: 'Out and back to Trader Joes in San Carlos', distance: '', imageFile: 'laural-trader-joes.png' },
    { id: 'stulsaft', name: 'Stulsaft', description: 'Loop through the hills toward Stulsaft Park', distance: '', imageFile: 'stulsaft.png' },
    { id: 'howard', name: 'Howard', description: 'Loop through the Howard neighborhood', distance: '', imageFile: 'howard.png' },
  ],
};

export async function getConfig(): Promise<Config> {
  const db = getDb();
  const doc = await db.collection('config').doc('main').get();
  if (!doc.exists) {
    await db.collection('config').doc('main').set(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
  return doc.data() as Config;
}

export async function saveConfig(config: Config): Promise<void> {
  const db = getDb();
  await db.collection('config').doc('main').set(config);
}

export function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export async function getSchedule(weekOf: string): Promise<WeekSchedule> {
  const db = getDb();
  const doc = await db.collection('schedules').doc(weekOf).get();
  if (!doc.exists) {
    return { weekOf, groups: {} };
  }
  return doc.data() as WeekSchedule;
}

export async function saveSchedule(weekOf: string, schedule: WeekSchedule): Promise<void> {
  const db = getDb();
  await db.collection('schedules').doc(weekOf).set(schedule);
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const db = getDb();
  const snap = await db.collection('announcements').orderBy('createdAt', 'desc').get();
  return snap.docs.map(d => d.data() as Announcement);
}

export async function addAnnouncement(content: string, author: string): Promise<Announcement> {
  const db = getDb();
  const id = db.collection('announcements').doc().id;
  const ann: Announcement = { id, content, createdAt: new Date().toISOString(), author };
  await db.collection('announcements').doc(id).set(ann);
  return ann;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const db = getDb();
  await db.collection('announcements').doc(id).delete();
}

export async function getAttendance(date: string, groupId: string): Promise<AttendanceRecord | null> {
  const db = getDb();
  const doc = await db.collection('attendance').doc(`${date}_${groupId}`).get();
  if (!doc.exists) return null;
  return doc.data() as AttendanceRecord;
}

export async function saveAttendance(record: AttendanceRecord): Promise<void> {
  const db = getDb();
  const key = `${record.date}_${record.groupId}`;
  await db.collection('attendance').doc(key).set(record);
}

export async function getAllAttendance(): Promise<AttendanceRecord[]> {
  const db = getDb();
  const snap = await db.collection('attendance').orderBy('date', 'desc').get();
  return snap.docs.map(d => d.data() as AttendanceRecord);
}
