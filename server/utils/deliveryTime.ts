/**
 * Server-side Delivery Time and Business Hours Utilities for Salem Rice & Maligai
 */

export interface StoreHoursSettings {
  monSatOpen?: string;
  monSatClose?: string;
  sunOpen?: string;
  sunClose?: string;
  shopStatus?: 'OPEN' | 'CLOSED' | 'TEMPORARILY_UNAVAILABLE';
  noticeEn?: string;
  noticeTa?: string;
  reopenDate?: string;
}

export interface ExpectedDeliveryResult {
  isSameDay: boolean;
  isAfterHours: boolean;
  isEarlyMorning: boolean;
  displayCustomer: string;
  displayCustomerTa: string;
  displayAdmin: string;
  fullCustomerText: string;
  orderTimeFormatted: string;
  orderDateTimeFormatted: string;
  targetDayName: string;
  openingTimeFormatted: string;
}

export function formatTime12h(timeStr: string): string {
  const [hStr, mStr] = (timeStr || '07:00').split(':');
  const h = parseInt(hStr, 10) || 7;
  const m = parseInt(mStr || '0', 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const mFormatted = m > 0 ? `:${String(m).padStart(2, '0')}` : ':00';
  return `${h12}${mFormatted} ${ampm}`;
}

export function getISTDate(dateInput: Date | string | number = new Date()): Date {
  const d = new Date(dateInput);
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 5.5));
}

export function formatOrderTimeIST(dateInput: Date | string | number = new Date()): string {
  const ist = getISTDate(dateInput);
  return ist.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatOrderDateTimeIST(dateInput: Date | string | number = new Date()): string {
  const ist = getISTDate(dateInput);
  const time = ist.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const date = ist.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  return `${time}, ${date}`;
}

export function calculateExpectedDelivery(
  orderDateInput: Date | string | number = new Date(),
  settings?: StoreHoursSettings
): ExpectedDeliveryResult {
  const ist = getISTDate(orderDateInput);
  const dayOfWeek = ist.getDay();

  const monSatOpen = settings?.monSatOpen || '07:00';
  const monSatClose = settings?.monSatClose || '21:30';
  const sunOpen = settings?.sunOpen || '07:00';
  const sunClose = settings?.sunClose || '14:00';

  const isSunday = dayOfWeek === 0;
  const todayOpen = isSunday ? sunOpen : monSatOpen;
  const todayClose = isSunday ? sunClose : monSatClose;

  const curH = ist.getHours();
  const curM = ist.getMinutes();
  const curTimeStr = `${String(curH).padStart(2, '0')}:${String(curM).padStart(2, '0')}`;

  const orderTimeFormatted = formatOrderTimeIST(orderDateInput);
  const orderDateTimeFormatted = formatOrderDateTimeIST(orderDateInput);

  if (settings?.shopStatus && settings.shopStatus !== 'OPEN') {
    const reopen = settings.reopenDate;
    if (reopen) {
      return {
        isSameDay: false,
        isAfterHours: true,
        isEarlyMorning: false,
        displayCustomer: `Reopening ${reopen} morning (from 7:00 AM onward)`,
        displayCustomerTa: `மீண்டும் தொடங்கும் நாள் ${reopen} (காலை 7:00 முதல்)`,
        displayAdmin: `Shop Closed - Reopens ${reopen}, 7:00 AM onwards`,
        fullCustomerText: `Expected Delivery: When shop reopens on ${reopen}`,
        orderTimeFormatted,
        orderDateTimeFormatted,
        targetDayName: reopen,
        openingTimeFormatted: '7:00 AM',
      };
    }
  }

  // 1. Placed during today's open hours -> Same day delivery target
  if (curTimeStr >= todayOpen && curTimeStr < todayClose) {
    return {
      isSameDay: true,
      isAfterHours: false,
      isEarlyMorning: false,
      displayCustomer: 'Today',
      displayCustomerTa: 'இன்று',
      displayAdmin: 'Today (Same day)',
      fullCustomerText: 'Expected Delivery: Today',
      orderTimeFormatted,
      orderDateTimeFormatted,
      targetDayName: 'Today',
      openingTimeFormatted: formatTime12h(todayOpen),
    };
  }

  // 2. Early morning before opening (e.g. 5:30 AM)
  if (curTimeStr < todayOpen) {
    const openTime12 = formatTime12h(todayOpen);
    return {
      isSameDay: true,
      isAfterHours: false,
      isEarlyMorning: true,
      displayCustomer: `Today morning (from ${openTime12} onward)`,
      displayCustomerTa: `இன்று காலை (${openTime12} முதல்)`,
      displayAdmin: `Today, ${openTime12} onwards`,
      fullCustomerText: 'Expected Delivery: Today morning',
      orderTimeFormatted,
      orderDateTimeFormatted,
      targetDayName: 'Today',
      openingTimeFormatted: openTime12,
    };
  }

  // 3. Placed after closing hours (e.g. Monday 10:00 PM, Sunday 3:00 PM)
  const nextDay = new Date(ist.getTime() + 86400000);
  const nextDayOfWeek = nextDay.getDay();
  const nextDayIsSunday = nextDayOfWeek === 0;
  const nextOpenTime = nextDayIsSunday ? sunOpen : monSatOpen;
  const nextOpenTime12 = formatTime12h(nextOpenTime);

  const nextDayName = nextDay.toLocaleDateString('en-IN', { weekday: 'long' });
  const nextDayNameTa = nextDay.toLocaleDateString('ta-IN', { weekday: 'long' });

  return {
    isSameDay: false,
    isAfterHours: true,
    isEarlyMorning: false,
    displayCustomer: `Tomorrow morning (${nextDayName} from ${nextOpenTime12} onward)`,
    displayCustomerTa: `நாளை காலை (${nextDayNameTa} ${nextOpenTime12} முதல்)`,
    displayAdmin: `Tomorrow, ${nextOpenTime12} onwards`,
    fullCustomerText: 'Expected Delivery: Tomorrow morning',
    orderTimeFormatted,
    orderDateTimeFormatted,
    targetDayName: nextDayName,
    openingTimeFormatted: nextOpenTime12,
  };
}
