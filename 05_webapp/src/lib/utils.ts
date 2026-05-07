import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    'preliminary_ai_assisted': 'Expert review pending',
    'requires_human_review': 'Legal review required',
    'reviewed_by_researcher': 'Researcher reviewed',
    'validated': 'Expert validated',
    'superseded': 'Superseded'
  };
  return labels[status] || status;
}

export function getAnchoringLabel(level: string | number) {
  const labels: Record<string, string> = {
    '0': 'No identifiable anchoring',
    '1': 'Indirect contextual anchoring',
    '2': 'Administrative/operational anchoring',
    '3': 'Partial statutory anchoring',
    '4': 'Strong statutory-administrative anchoring',
    '5': 'Integrated implementation anchoring'
  };
  return labels[String(level)] || `Level ${level}`;
}

export function getConfidenceColor(level: string) {
  const colors: Record<string, string> = {
    'high': 'text-green-700 bg-green-50 border-green-200',
    'medium': 'text-amber-700 bg-amber-50 border-amber-200',
    'low': 'text-red-700 bg-red-50 border-red-200'
  };
  return colors[level.toLowerCase()] || 'text-slate-700 bg-slate-50 border-slate-200';
}

export function toSafeLower(value: unknown) {
  return String(value ?? '').toLowerCase();
}
