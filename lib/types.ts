export type Group = {
  id: string;
  name: string;
  color: string; // tailwind color class like "blue", "green", etc.
  accessCode: string;
  runners: string[];
};

export type Route = {
  id: string;
  name: string;
  description: string;
  distance: string;
  imageFile: string; // filename in public/routes/
};

export type DaySchedule = {
  routeId: string | null;
  updatedAt: string;
  updatedBy: string;
};

export type WeekSchedule = {
  weekOf: string; // ISO date string of the Monday of the week
  groups: {
    [groupId: string]: {
      [day: string]: DaySchedule; // "monday", "tuesday", etc.
    };
  };
};

export type Announcement = {
  id: string;
  content: string;
  createdAt: string;
  author: string;
};

export type AttendanceRecord = {
  date: string;
  groupId: string;
  runners: { name: string; present: boolean }[];
};

export type Config = {
  groups: Group[];
  routes: Route[];
  coachCode: string;
};

export type AuthSession = {
  type: 'group' | 'coach';
  groupId?: string;
};
