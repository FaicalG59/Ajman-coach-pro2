export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function ageFromDOB(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export function addDays(date: string | Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function passAccuracy(completed: number, attempted: number): number {
  if (!attempted) return 0;
  return Math.round((completed / attempted) * 100);
}

export function avg(numbers: (number | null)[]): number {
  const valid = numbers.filter((n): n is number => n !== null && !isNaN(n));
  if (!valid.length) return 0;
  return valid.reduce((s, n) => s + n, 0) / valid.length;
}
