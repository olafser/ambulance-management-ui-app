export type VehicleStatus = 'Available' | 'On mission' | 'Maintenance' | 'Reserved';

export interface VehicleRecord {
  id: number;
  callSign: string;
  vehicleType: string;
  plateNumber: string;
  station: string;
  assignedCrew: string;
  status: VehicleStatus;
  mileageKm: number;
  lastServiceDate: string;
  notes: string;
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
