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

const DEFAULT_API_BASE = '/api';

const createApiClient = (apiBase: string = DEFAULT_API_BASE) =>
  new AmbulanceManagementApi(
    new Configuration({
      basePath: apiBase || DEFAULT_API_BASE,
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

export const listVehicles = async (apiBase?: string): Promise<VehicleRecord[]> => {
  console.log(`Fetching vehicles from API at ${apiBase}...`);
  const vehicles = await createApiClient(apiBase).vehiclesGet({});
  return vehicles.map(toVehicleRecord);
};

export const createVehicle = async (draft: VehicleDraft, apiBase?: string): Promise<VehicleRecord> => {
  const vehicle = await createApiClient(apiBase).vehiclesPost({
    vehicleCreateRequest: toVehiclePayload(draft),
  });

  return toVehicleRecord(vehicle);
};

export const updateVehicle = async (vehicleId: number, draft: VehicleDraft, apiBase?: string): Promise<VehicleRecord> => {
  const vehicle = await createApiClient(apiBase).vehiclesVehicleIdPut({
    vehicleId,
    vehicleUpdateRequest: toVehiclePayload(draft),
  });

  return toVehicleRecord(vehicle);
};

export const deleteVehicle = async (vehicleId: number, apiBase?: string): Promise<void> => {
  await createApiClient(apiBase).vehiclesVehicleIdDelete({ vehicleId });
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
    return 'Unable to reach the ambulance management API. Check that the backend API is reachable.';
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};
