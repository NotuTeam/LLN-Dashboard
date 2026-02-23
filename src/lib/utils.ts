/** @format */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function serviceToCategoryFormat(serviceName: string): string {
  return serviceName.trim().replace(/\s+/g, "_").toUpperCase();
}

export function categoryToReadableFormat(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function servicesToCategories(services: any[]): Array<{
  label: string;
  value: string;
}> {
  if (!services || !Array.isArray(services)) return [];

  return services.map((service) => ({
    label: service.service_name,
    value: service.slug || service.service_name, // Use slug if available, fallback to service_name
  }));
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function lastPathname(path: string) {
  if (!path) return "";

  return path.split("/")[path.split("/").length - 1];
}

/**
 * Format duration dari menit ke format human-readable
 * @param minutes - Duration dalam menit
 * @param options - Options untuk format output
 * @returns Formatted duration string
 * 
 * @example
 * formatDuration(60) // "1 hour"
 * formatDuration(90) // "1 hour 30 minutes"
 * formatDuration(1440) // "1 day"
 * formatDuration(1500) // "1 day 1 hour"
 * formatDuration(4800) // "3 days 8 hours"
 */
export function formatDuration(
  minutes: number,
  options?: {
    short?: boolean; // Use short format (h, m instead of hour, minutes)
    full?: boolean; // Always show all units even if 0
  }
): string {
  if (!minutes || minutes <= 0) {
    return options?.short ? "0m" : "0 minutes";
  }

  const days = Math.floor(minutes / 1440); // 1 day = 1440 minutes
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  const parts: string[] = [];

  if (days > 0 || options?.full) {
    if (options?.short) {
      parts.push(`${days}d`);
    } else {
      parts.push(`${days} ${days === 1 ? "day" : "days"}`);
    }
  }

  if (hours > 0 || (options?.full && days > 0)) {
    if (options?.short) {
      parts.push(`${hours}h`);
    } else {
      parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
    }
  }

  if (mins > 0 || (options?.full && (days > 0 || hours > 0)) || parts.length === 0) {
    if (options?.short) {
      parts.push(`${mins}m`);
    } else {
      parts.push(`${mins} ${mins === 1 ? "minute" : "minutes"}`);
    }
  }

  return parts.join(" ");
}

/**
 * Format duration ke format compact (hanya unit terbesar)
 * @param minutes - Duration dalam menit
 * @returns Compact duration string
 * 
 * @example
 * formatDurationCompact(60) // "1h"
 * formatDurationCompact(90) // "1.5h"
 * formatDurationCompact(1440) // "1d"
 * formatDurationCompact(2880) // "2d"
 */
export function formatDurationCompact(minutes: number): string {
  if (!minutes || minutes <= 0) return "0m";

  const days = minutes / 1440;
  const hours = minutes / 60;

  // If more than 1 day, show in days
  if (days >= 1) {
    return days % 1 === 0 ? `${days}d` : `${days.toFixed(1)}d`;
  }

  // If more than 1 hour, show in hours
  if (hours >= 1) {
    return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`;
  }

  // Otherwise show in minutes
  return `${minutes}m`;
}

/**
 * Parse duration string ke menit
 * @param value - Numeric value
 * @param unit - Unit of time ('minutes', 'hours', 'days')
 * @returns Duration dalam menit
 * 
 * @example
 * parseDurationToMinutes(60, 'minutes') // 60
 * parseDurationToMinutes(2, 'hours') // 120
 * parseDurationToMinutes(1, 'days') // 1440
 */
export function parseDurationToMinutes(
  value: number,
  unit: "minutes" | "hours" | "days"
): number {
  switch (unit) {
    case "days":
      return value * 1440;
    case "hours":
      return value * 60;
    case "minutes":
    default:
      return value;
  }
}

/**
 * Convert menit ke object dengan breakdown hari, jam, menit
 * @param minutes - Duration dalam menit
 * @returns Object dengan days, hours, minutes
 * 
 * @example
 * breakdownDuration(1500) // { days: 1, hours: 1, minutes: 0 }
 * breakdownDuration(90) // { days: 0, hours: 1, minutes: 30 }
 */
export function breakdownDuration(minutes: number): {
  days: number;
  hours: number;
  minutes: number;
  totalMinutes: number;
} {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  return {
    days,
    hours,
    minutes: mins,
    totalMinutes: minutes,
  };
}

export const cookies = (() => {
  function get(name: string) {
    const cname = name + "=";
    const cookies = document.cookie.split(";");
    for (let index = 0; index < cookies.length; index++) {
      let cookie = cookies[index];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(cname) === 0) {
        return cookie.substring(cname.length, cookie.length);
      }
    }
    return null;
  }

  function add(name: string, data: string, xday = 1) {
    const d = new Date();
    d.setTime(d.getTime() + xday * 24 * 60 * 60 * 1000);

    const expires = "expires=" + d.toUTCString();

    document.cookie = name + "=" + data + ";" + expires + ";path=/";
  }

  function remove(name: string) {
    document.cookie =
      name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  return {
    get,
    add,
    remove,
  };
})();
