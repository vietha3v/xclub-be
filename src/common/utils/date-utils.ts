import { format, addDays, subDays, startOfDay, endOfDay } from 'date-fns';

export class DateUtils {
  static formatDate(date: Date, formatStr: string = 'yyyy-MM-dd'): string {
    return format(date, formatStr);
  }

  static formatDateTime(date: Date, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
    return format(date, formatStr);
  }

  static addDays(date: Date, days: number): Date {
    return addDays(date, days);
  }

  static subDays(date: Date, days: number): Date {
    return subDays(date, days);
  }

  static startOfDay(date: Date): Date {
    return startOfDay(date);
  }

  static endOfDay(date: Date): Date {
    return endOfDay(date);
  }

  static isToday(date: Date): boolean {
    const today = new Date();
    return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  }

  static isPast(date: Date): boolean {
    return date < new Date();
  }

  static isFuture(date: Date): boolean {
    return date > new Date();
  }
}
