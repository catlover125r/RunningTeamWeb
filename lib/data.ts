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
      runners: ['Brennan Sherman', 'Cole Myers'],
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
  attendanceRoster: [
    {
      label: 'Boys',
      runners: [
        'Aidan McGuire', 'Alex Corpos', 'Ari Guelman', 'Ben Carter', 'Brandon Dilley',
        'Brennan Sherman', 'Caden Bernal', 'Cole Myers', 'Colin Henderson',
        'Connor Dilley', 'Cooper Gaffney', 'Dylan Bringley', 'Elliot Rios', 'Enzo Zencirci',
        'Fred Quontamatteo', 'Gian Carlo Lopez Acevedo', 'Hans Posch', 'Henry Giardi',
        'Jacob Reynolds', 'Jacob Wallace', 'Jasper Vyas-Greene', 'Johnathan Huffer',
        'Jose Can', 'Kai Rechin', 'Logan Trinklein', 'Luke Popler', 'Matthew Macedo',
        'Meezahn Kemal', 'Nash Isaac Mamaril', 'Nickita Khylkouski', 'Reed Murphy',
        'Sachin Paranjpye', 'Senahn Kemal', 'Theodore Tidwell', 'Tiernan Weaver',
        'Trinidad Frias', 'Ulises Rugerio Gonzalez', 'Viggo Laustsen', 'Viliami Fuka',
        'Wilfred Chacon Lopez', 'Will Raymond',
      ],
    },
    {
      label: 'Girls',
      runners: [
        'Abigail Ma', 'Abigail Machemer', 'Alisa Portner', 'Alize Hernandez', 'Amelia Ewing',
        'Amelie Vieira', 'Amy Cruz Gonzalez', 'Audrey Bringley', 'Ava Wu', 'Brisa Rios',
        'Camara Davis Duff', 'Delilah Hahn Tapper', 'Edyth Tidwell', 'Eleanor Talmadge',
        'Elena Dils', 'Elisabetta Holloszy', 'Elise Leparmentier', 'Fei Hwang',
        'Gabrielle Martin', 'Jakelin Garcia Rodriguez', 'Jazlynne Hernandez', 'Mia Zoepf',
        'Nina Vijeh', 'Oceane Lacasse', 'Reese Skye', "Sabine O'Hara", 'Valentina Valencia',
        'Yuki Ahmann', 'Yuliana Escatel Ramirez',
      ],
    },
  ],
  routes: [
    { id: 'track-workout', name: 'Track Workout', description: 'Workout on the track — no route', distance: '', imageFile: '' },
    { id: 'britten', name: 'Brittan', description: 'Loop through the Brittan neighborhood', distance: '', imageFile: 'britten.png' },
    { id: 'bair-island', name: 'Bair Island', description: 'Out and back to Bair Island along the bay', distance: '', imageFile: 'bair-island.png' },
    { id: 'emerald-hills', name: 'Emerald Hills', description: 'Hilly loop through Emerald Hills', distance: '', imageFile: 'emerald-hills.png' },
    { id: 'mcloop', name: 'Mcloop', description: 'Loop through the neighborhood near Mcauley Park', distance: '', imageFile: 'mcloop.png' },
    { id: 'around-school', name: 'Around the School', description: 'Short loop around the school campus', distance: '', imageFile: 'around-school.png' },
    { id: 'prison', name: 'Prison', description: 'Run out toward the waterfront near the old prison', distance: '', imageFile: 'prison.png' },
    { id: 'terris', name: 'Terrace', description: 'Loop through the Terrace neighborhood', distance: '', imageFile: 'terris.png' },
    { id: 'burton', name: 'Burton', description: 'Long loop through Burton and surrounding neighborhoods', distance: '', imageFile: 'burton.png' },
    { id: 'burton-out-and-back', name: 'Burton (Out & Back)', description: 'Out and back from school to Redwood City via Cedar St', distance: '', imageFile: 'burton-out-and-back.png' },
    { id: 'laural-trader-joes', name: 'Laurel/Trader Joes', description: 'Out and back to Trader Joes in San Carlos', distance: '', imageFile: 'laural-trader-joes.png' },
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
  const config = doc.data() as Config;
  let dirty = false;
  // Migration: add 'track-workout' route if missing
  if (!config.routes?.find(r => r.id === 'track-workout')) {
    config.routes = config.routes ?? [];
    config.routes.unshift({ id: 'track-workout', name: 'Track Workout', description: 'Workout on the track — no route', distance: '', imageFile: '' });
    dirty = true;
  }
  // Migration: fix route name spellings
  const routeNameFixes: Record<string, string> = { britten: 'Brittan', terris: 'Terrace', 'laural-trader-joes': 'Laurel/Trader Joes' };
  for (const route of config.routes ?? []) {
    if (routeNameFixes[route.id] && route.name !== routeNameFixes[route.id]) {
      route.name = routeNameFixes[route.id];
      dirty = true;
    }
  }
  // Migration: ensure 'burton' route has correct name 'Burton'
  const burtonRoute = config.routes?.find(r => r.id === 'burton' && r.name !== 'Burton');
  if (burtonRoute) {
    burtonRoute.name = 'Burton';
    burtonRoute.description = 'Long loop through Burton and surrounding neighborhoods';
    dirty = true;
  }
  // Migration: add 'Burton (Out & Back)' if missing
  if (!config.routes?.find(r => r.id === 'burton-out-and-back')) {
    config.routes = config.routes ?? [];
    config.routes.push({ id: 'burton-out-and-back', name: 'Burton (Out & Back)', description: 'Out and back from school to Redwood City via Cedar St', distance: '', imageFile: 'burton-out-and-back.png' });
    dirty = true;
  }
  // Migration: remove Cole Boggs from attendance roster (not on track team)
  const boysRoster = config.attendanceRoster?.find(r => r.label === 'Boys');
  if (boysRoster) {
    const before = boysRoster.runners.length;
    boysRoster.runners = boysRoster.runners.filter(n => n !== 'Cole Boggs');
    if (boysRoster.runners.length !== before) dirty = true;
  }
  // Migration: fix Boys JV (12) — replace Cole Boggs with Cole Myers as Brennan's pair
  const jv12 = config.groups?.find(g => g.id === 'boys-jv-12');
  if (jv12) {
    const boggsIdx = jv12.runners.indexOf('Cole Boggs');
    if (boggsIdx !== -1) {
      jv12.runners[boggsIdx] = 'Cole Myers';
      dirty = true;
    }
  }
  if (dirty) {
    await db.collection('config').doc('main').set(config);
  }
  return config;
}

export async function saveConfig(config: Config): Promise<void> {
  const db = getDb();
  await db.collection('config').doc('main').set(config);
}

const PT_TIMEZONE = 'America/Los_Angeles';

/** Returns a Date whose .getHours(), .getDate(), etc. reflect Pacific Time. */
export function nowInPacific(): { date: Date; hour: number; dateStr: string } {
  const now = new Date();
  // Build a date string in PT using the locale trick (works reliably in Node with ICU)
  const ptString = now.toLocaleString('en-US', { timeZone: PT_TIMEZONE });
  const ptDate = new Date(ptString);
  const h = ptDate.getHours();
  const y = ptDate.getFullYear();
  const m = String(ptDate.getMonth() + 1).padStart(2, '0');
  const d = String(ptDate.getDate()).padStart(2, '0');
  return { date: ptDate, hour: h, dateStr: `${y}-${m}-${d}` };
}

export function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export interface ScheduleDay {
  dateStr: string;   // "2026-03-10"
  dayName: string;   // "tuesday"
  weekOf: string;    // "2026-03-09"
  label: string;     // "Tue 3/10"
  isToday: boolean;
}

export function getUpcomingPracticeDays(now: Date): ScheduleDay[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const days: ScheduleDay[] = [];
  const cursor = new Date(today);

  while (days.length < 5) {
    const dow = cursor.getDay();
    if (dow >= 1 && dow <= 5) {
      const dateStr = cursor.toISOString().split('T')[0];
      const month = cursor.getMonth() + 1;
      const date = cursor.getDate();
      const dayAbbr = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dow];
      days.push({
        dateStr,
        dayName: DAY_NAMES[dow],
        weekOf: getMondayOfWeek(cursor),
        label: `${dayAbbr} ${month}/${date}`,
        isToday: dateStr === todayStr,
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
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

export async function getAttendance(date: string): Promise<AttendanceRecord | null> {
  const db = getDb();
  const doc = await db.collection('attendance').doc(date).get();
  if (!doc.exists) return null;
  return doc.data() as AttendanceRecord;
}

export async function saveAttendance(record: AttendanceRecord): Promise<void> {
  const db = getDb();
  await db.collection('attendance').doc(record.date).set(record);
}

export async function getAllAttendance(): Promise<AttendanceRecord[]> {
  const db = getDb();
  const snap = await db.collection('attendance').orderBy('date', 'desc').get();
  return snap.docs.map(d => d.data() as AttendanceRecord);
}
