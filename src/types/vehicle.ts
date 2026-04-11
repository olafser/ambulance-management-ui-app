import type { Vehicle as ApiVehicle, VehicleStatus } from '../api/ambulance-management';

export type { VehicleStatus } from '../api/ambulance-management';

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  AVAILABLE: 'Available',
  ON_MISSION: 'On mission',
  OUT_OF_SERVICE: 'Out of service',
  IN_SERVICE: 'In service',
};

export interface VehicleRecord extends Omit<ApiVehicle, 'lastServiceDate'> {
  lastServiceDate: string;
}

export interface VehicleDraft {
  callSign: string;
  vehicleType: string;
  plateNumber: string;
  station: string;
  assignedCrew: string;
  status: VehicleStatus;
  mileageKm: string;
  lastServiceDate: string;
  notes: string;
}

export type VehicleFormMode = 'create' | 'edit';
