import {
  AmbulanceManagementApi,
  Configuration,
  FetchError,
  ResponseError,
  type ModelError,
  type Vehicle,
  type VehicleCreateRequest,
  type VehicleUpdateRequest,
} from './index';

import type { VehicleDraft, VehicleRecord } from '../../types/vehicle';
// change basePath to     basePath: 'http://localhost:8080/api' for development
const api = new AmbulanceManagementApi(
  new Configuration({
    basePath: '/api',
  }),
);

const padDatePart = (value: number) => String(value).padStart(2, '0');

const formatDateOnly = (value: Date) =>
  `${value.getUTCFullYear()}-${padDatePart(value.getUTCMonth() + 1)}-${padDatePart(value.getUTCDate())}`;

const parseDateOnly = (value: string) => new Date(`${value}T00:00:00.000Z`);

const toVehicleRecord = (vehicle: Vehicle): VehicleRecord => ({
  ...vehicle,
  lastServiceDate: formatDateOnly(vehicle.lastServiceDate),
});

const toVehiclePayload = (draft: VehicleDraft): VehicleCreateRequest | VehicleUpdateRequest => {
  const assignedCrew = draft.assignedCrew.trim();
  const notes = draft.notes.trim();

  return {
    callSign: draft.callSign.trim(),
    vehicleType: draft.vehicleType.trim(),
    plateNumber: draft.plateNumber.trim(),
    station: draft.station.trim(),
    assignedCrew: assignedCrew || undefined,
    status: draft.status,
    mileageKm: Math.max(0, Number(draft.mileageKm) || 0),
    lastServiceDate: parseDateOnly(draft.lastServiceDate),
    notes: notes || undefined,
  };
};

export const listVehicles = async (): Promise<VehicleRecord[]> => {
  const vehicles = await api.vehiclesGet({});
  return vehicles.map(toVehicleRecord);
};

export const createVehicle = async (draft: VehicleDraft): Promise<VehicleRecord> => {
  const vehicle = await api.vehiclesPost({
    vehicleCreateRequest: toVehiclePayload(draft),
  });

  return toVehicleRecord(vehicle);
};

export const updateVehicle = async (vehicleId: number, draft: VehicleDraft): Promise<VehicleRecord> => {
  const vehicle = await api.vehiclesVehicleIdPut({
    vehicleId,
    vehicleUpdateRequest: toVehiclePayload(draft),
  });

  return toVehicleRecord(vehicle);
};

export const deleteVehicle = async (vehicleId: number): Promise<void> => {
  await api.vehiclesVehicleIdDelete({ vehicleId });
};

export const getApiErrorMessage = async (error: unknown, fallbackMessage: string): Promise<string> => {
  if (error instanceof ResponseError) {
    try {
      const payload = (await error.response.clone().json()) as Partial<ModelError>;
      if (typeof payload?.message === 'string' && payload.message.trim()) {
        return payload.message;
      }
    } catch {
      // Ignore malformed or empty error payloads and use the fallback.
    }

    return `${fallbackMessage} (${error.response.status})`;
  }

  if (error instanceof FetchError) {
    return 'Unable to reach the ambulance management API. Check that the backend is running at http://localhost:8080/api.';
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};
