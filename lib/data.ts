import { getDb } from './firebase';
import { Config, WeekSchedule, Announcement, AttendanceRecord } from './types';

// Default config to seed Firestore on first run
const DEFAULT_CONFIG: Config = {
  coachCode: '2947',
  groups: [
    {
      id: 'boys',
      name: 'Boys',
      color: 'purple',
      accessCode: '4829',
      runners: [
        'Aidan McGuire', 'Alex Corpos', 'Ari Guelman', 'Ben Carter', 'Brandon Dilley',
        'Brennan Sherman', 'Caden Bernal', 'Cole Boggs', 'Cole Myers', 'Colin Henderson',
        'Connor Dilley', 'Cooper Gaffney', 'Dylan Bringley', 'Elliot Rios', 'Enzo Zencirci',
        'Fred Quontamatteo', 'Gian Carlo Lopez Acevedo', 'Hans Posch', 'Henry Giardi',
        'Jacob Reynolds', 'Jacob Wallace', 'Jasper Vyas-Greene', 'Johnathan Huffer', 'Jose Can',
        'Kai Rechin', 'Logan Trinklein', 'Luke Popler', 'Matthew Macedo', 'Meezahn Kemal',
        'Nash Isaac Mamaril', 'Nickita Khylkouski', 'Reed Murphy', 'Sachin Paranjpye',
        'Senahn Kemal', 'Theodore Tidwell', 'Tiernan Weaver', 'Trinidad Frias',
        'Ulises Rugerio Gonzalez', 'Viggo Laustsen', 'Viliami Fuka', 'Wilfred Chacon Lopez',
        'Will Raymond',
      ],
    },
    {
      id: 'girls',
      name: 'Girls',
      color: 'pink',
      accessCode: '7153',
      runners: [
        'Abigail Ma', 'Abigail Machemer', 'Alisa Portner', 'Alize Hernandez', 'Amelia Ewing',
        'Amelie Vieira', 'Amy Cruz Gonzalez', 'Audrey Bringley', 'Ava Wu', 'Brisa Rios',
        'Camara Davis Duff', 'Delilah Hahn Tapper', 'Edyth Tidwell', 'Eleanor Talmadge',
        'Elena Dils', 'Elisabetta Holloszy', 'Elise Leparmentier', 'Fei Hwang',
        'Gabrielle Martin', 'Jakelin Garcia Rodriguez', 'Jazlynne Hernandez', 'Mia Zoepf',
        'Nina Vijeh', 'Oceane Lacasse', 'Reese Skye', "Sabine O'Hara", 'Valentina Valencia',
        'Yuliana Escatel Ramirez',
      ],
    },
  ],
  routes: [
    { id: 'loop1', name: 'Campus Loop', description: 'Easy recovery run around the school campus', distance: '3.2 miles', imageFile: 'campus-loop.jpg' },
    { id: 'hills', name: 'Hill Repeats', description: 'Challenging hill workout on Oak Street', distance: '4.5 miles', imageFile: 'hill-repeats.jpg' },
    { id: 'park', name: 'Riverside Park', description: 'Flat tempo run along the river trail', distance: '5.0 miles', imageFile: 'riverside-park.jpg' },
    { id: 'long', name: 'Long Run', description: 'Weekly long run through the neighborhood', distance: '7.0 miles', imageFile: 'long-run.jpg' },
    { id: 'track', name: 'Track Workout', description: 'Speed intervals on the school track', distance: '4.0 miles', imageFile: 'track.jpg' },
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
