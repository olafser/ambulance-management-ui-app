import {
  Configuration,
  DispatchManagementApi,
  type Dispatch,
  type DispatchCreateRequest,
  type DispatchUpdateRequest,
} from './index';

import type { DispatchDraft, DispatchRecord, DispatchStatus } from '../../types/dispatch';

const DEFAULT_API_BASE = '/api';

const createApiClient = (apiBase: string = DEFAULT_API_BASE) =>
  new DispatchManagementApi(
    new Configuration({
      basePath: apiBase || DEFAULT_API_BASE,
    }),
  );

const toDispatchRecord = (dispatch: Dispatch): DispatchRecord => ({
  ...dispatch,
  createdAt: dispatch.createdAt.toISOString(),
  updatedAt: dispatch.updatedAt.toISOString(),
  notes: dispatch.notes ?? '',
});

const toDispatchPayload = (draft: DispatchDraft): DispatchCreateRequest | DispatchUpdateRequest => {
  const notes = draft.notes.trim();

  return {
    incidentNumber: draft.incidentNumber.trim(),
    callerName: draft.callerName.trim(),
    patientName: draft.patientName.trim(),
    streetAddress: draft.streetAddress.trim(),
    city: draft.city.trim(),
    dispatchReason: draft.dispatchReason.trim(),
    priority: draft.priority,
    status: draft.status,
    ambulanceCallSign: draft.ambulanceCallSign.trim(),
    destinationHospital: draft.destinationHospital.trim(),
    dispatcherName: draft.dispatcherName.trim(),
    createdAt: new Date(draft.createdAt),
    notes: notes || undefined,
  };
};

export const listDispatches = async (apiBase?: string): Promise<DispatchRecord[]> => {
  const dispatches = await createApiClient(apiBase).dispatchesGet({});
  return dispatches.map(toDispatchRecord);
};

export const createDispatch = async (draft: DispatchDraft, apiBase?: string): Promise<DispatchRecord> => {
  const dispatch = await createApiClient(apiBase).dispatchesPost({
    dispatchCreateRequest: toDispatchPayload(draft),
  });

  return toDispatchRecord(dispatch);
};

export const updateDispatch = async (dispatchId: number, draft: DispatchDraft, apiBase?: string): Promise<DispatchRecord> => {
  const dispatch = await createApiClient(apiBase).dispatchesDispatchIdPut({
    dispatchId,
    dispatchUpdateRequest: toDispatchPayload(draft),
  });

  return toDispatchRecord(dispatch);
};

export const updateDispatchStatus = async (dispatchId: number, status: DispatchStatus, apiBase?: string): Promise<DispatchRecord> => {
  const dispatch = await createApiClient(apiBase).dispatchesDispatchIdStatusPatch({
    dispatchId,
    dispatchStatusUpdateRequest: { status },
  });

  return toDispatchRecord(dispatch);
};

export const deleteDispatch = async (dispatchId: number, apiBase?: string): Promise<void> => {
  await createApiClient(apiBase).dispatchesDispatchIdDelete({ dispatchId });
};
