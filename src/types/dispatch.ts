import type { Dispatch as ApiDispatch, DispatchPriority, DispatchStatus } from '../api/ambulance-management';

export type { DispatchPriority, DispatchStatus } from '../api/ambulance-management';

export const DISPATCH_STATUS_LABELS: Record<DispatchStatus, string> = {
  ACCEPTED: 'Accepted',
  EN_ROUTE: 'En route',
  ON_SCENE: 'On scene',
  TRANSPORTING_TO_HOSPITAL: 'Transporting to hospital',
  COMPLETED: 'Completed',
};

export const DISPATCH_PRIORITY_LABELS: Record<DispatchPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const DISPATCH_STATUS_ORDER: DispatchStatus[] = [
  'ACCEPTED',
  'EN_ROUTE',
  'ON_SCENE',
  'TRANSPORTING_TO_HOSPITAL',
  'COMPLETED',
];

export interface DispatchRecord extends Omit<ApiDispatch, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface DispatchDraft {
  incidentNumber: string;
  callerName: string;
  patientName: string;
  streetAddress: string;
  city: string;
  dispatchReason: string;
  priority: DispatchPriority;
  status: DispatchStatus;
  ambulanceCallSign: string;
  destinationHospital: string;
  dispatcherName: string;
  createdAt: string;
  notes: string;
}

export type DispatchFormMode = 'create' | 'edit';

const padDatePart = (value: number) => String(value).padStart(2, '0');

export const formatLocalDateTimeInput = (value: Date) =>
  `${value.getFullYear()}-${padDatePart(value.getMonth() + 1)}-${padDatePart(value.getDate())}T${padDatePart(value.getHours())}:${padDatePart(value.getMinutes())}`;

export const toDispatchFormDateTimeValue = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return formatLocalDateTimeInput(date);
};

export const createEmptyDispatchDraft = (): DispatchDraft => ({
  incidentNumber: '',
  callerName: '',
  patientName: '',
  streetAddress: '',
  city: '',
  dispatchReason: '',
  priority: 'HIGH',
  status: 'ACCEPTED',
  ambulanceCallSign: '',
  destinationHospital: '',
  dispatcherName: '',
  createdAt: formatLocalDateTimeInput(new Date()),
  notes: '',
});

export const isHistoricalDispatch = (dispatch: Pick<DispatchRecord, 'status'>) => dispatch.status === 'COMPLETED';
