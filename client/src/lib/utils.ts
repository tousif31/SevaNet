import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'road-damage':
      return 'road';
    case 'garbage':
      return 'trash-alt';
    case 'street-light':
      return 'lightbulb';
    case 'water-sewage':
      return 'tint';
    default:
      return 'exclamation-circle';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'status-pending';
    case 'in-progress':
      return 'status-inprogress';
    case 'assigned':
      return 'status-assigned';
    case 'completed':
      return 'status-completed';
    default:
      return '';
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getReportCountsByStatus(reports: any[]) {
  return {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    assigned: reports.filter(r => r.status === 'assigned').length,
    completed: reports.filter(r => r.status === 'completed').length,
  };
}
