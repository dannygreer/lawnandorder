import { addWeeks, addMonths, eachDayOfInterval, isSameDay, startOfDay } from 'date-fns';

type Frequency = 'weekly' | 'biweekly' | 'monthly';

export function generateRecurringDates(
  startDate: Date,
  endDate: Date,
  frequency: Frequency,
  existingDates: Date[] = []
): Date[] {
  const dates: Date[] = [];
  let current = startOfDay(startDate);
  const end = startOfDay(endDate);

  while (current <= end) {
    const alreadyExists = existingDates.some((d) => isSameDay(d, current));
    if (!alreadyExists) {
      dates.push(new Date(current));
    }

    switch (frequency) {
      case 'weekly':
        current = addWeeks(current, 1);
        break;
      case 'biweekly':
        current = addWeeks(current, 2);
        break;
      case 'monthly':
        current = addMonths(current, 1);
        break;
    }
  }

  return dates;
}
