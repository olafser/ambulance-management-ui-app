import { Component, Host, Prop, State, h } from '@stencil/core';

import { getApiErrorMessage, listVehicles } from '../../api/ambulance-management/client';
import { createDispatch, deleteDispatch, listDispatches, updateDispatch, updateDispatchStatus } from '../../api/ambulance-management/dispatch-client';
import {
  createEmptyDispatchDraft,
  DISPATCH_PRIORITY_LABELS,
  isHistoricalDispatch,
  toDispatchFormDateTimeValue,
  type DispatchDraft,
  type DispatchFormMode,
  type DispatchRecord,
  type DispatchStatus,
} from '../../types/dispatch';
import type { VehicleRecord } from '../../types/vehicle';

@Component({
  tag: 'ambulance-management-ambulance-dispatch-management',
  styleUrl: 'ambulance-management-ambulance-dispatch-management.css',
  shadow: true,
})
export class AmbulanceManagementAmbulanceDispatchManagement {
  @Prop() apiBase: string = '';

  @State() private dispatches: DispatchRecord[] = [];
  @State() private dispatchVehicles: VehicleRecord[] = [];
  @State() private isLoading = true;
  @State() private loadError = '';
  @State() private mutationError = '';
  @State() private deleteError = '';
  @State() private statusError = '';
  @State() private isSaving = false;
  @State() private isDeleting = false;
  @State() private isUpdatingStatus = false;

  @State() private isModalOpen = false;
  @State() private modalMode: 'view' | DispatchFormMode = 'view';
  @State() private selectedDispatchId: number | null = null;
  @State() private dispatchPendingDeletion: DispatchRecord | null = null;

  private get selectedDispatch() {
    return this.dispatches.find((dispatch) => dispatch.id === this.selectedDispatchId) ?? null;
  }

  private get activeDispatches() {
    return this.dispatches.filter((dispatch) => !isHistoricalDispatch(dispatch));
  }

  private get historicalDispatches() {
    return this.dispatches.filter((dispatch) => isHistoricalDispatch(dispatch));
  }

  async componentWillLoad() {
    await Promise.all([this.loadDispatches(), this.loadDispatchVehicles()]);
  }

  private async loadDispatches() {
    this.isLoading = true;
    this.loadError = '';

    try {
      const dispatches = await listDispatches(this.apiBase);
      this.dispatches = dispatches.sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());

      if (this.selectedDispatchId !== null && !this.dispatches.some((dispatch) => dispatch.id === this.selectedDispatchId)) {
        this.closeModal();
      }
    } catch (error) {
      this.loadError = await getApiErrorMessage(error, 'Unable to load dispatches.');
    } finally {
      this.isLoading = false;
    }
  }

  private async loadDispatchVehicles() {
    try {
      this.dispatchVehicles = await listVehicles(this.apiBase);
    } catch (error) {
      this.loadError = await getApiErrorMessage(error, 'Unable to load ambulances for dispatch assignment.');
    }
  }

  private openCreateModal() {
    this.modalMode = 'create';
    this.selectedDispatchId = null;
    this.mutationError = '';
    this.statusError = '';
    this.isModalOpen = true;
  }

  private openDetailsModal(dispatchId: number) {
    const dispatch = this.dispatches.find((item) => item.id === dispatchId);
    if (!dispatch) {
      return;
    }

    this.selectedDispatchId = dispatchId;
    this.modalMode = 'view';
    this.mutationError = '';
    this.statusError = '';
    this.isModalOpen = true;
  }

  private closeModal() {
    this.isModalOpen = false;
    this.modalMode = 'view';
    this.selectedDispatchId = null;
    this.mutationError = '';
    this.statusError = '';
  }

  private startEditing() {
    if (!this.selectedDispatch) {
      return;
    }

    this.modalMode = 'edit';
    this.mutationError = '';
  }

  private openDeleteConfirmation(dispatchId: number) {
    this.dispatchPendingDeletion = this.dispatches.find((dispatch) => dispatch.id === dispatchId) ?? null;
    this.deleteError = '';
  }

  private closeDeleteConfirmation() {
    this.dispatchPendingDeletion = null;
    this.deleteError = '';
  }

  private toDraft(dispatch: DispatchRecord): DispatchDraft {
    return {
      incidentNumber: dispatch.incidentNumber,
      callerName: dispatch.callerName,
      patientName: dispatch.patientName,
      streetAddress: dispatch.streetAddress,
      city: dispatch.city,
      dispatchReason: dispatch.dispatchReason,
      priority: dispatch.priority,
      status: dispatch.status,
      ambulanceCallSign: dispatch.ambulanceCallSign,
      destinationHospital: dispatch.destinationHospital,
      dispatcherName: dispatch.dispatcherName,
      createdAt: toDispatchFormDateTimeValue(dispatch.createdAt),
      notes: dispatch.notes,
    };
  }

  private getEligibleAmbulanceOptions(selectedCallSign = '') {
    const eligibleVehicles = this.dispatchVehicles.filter(
      (vehicle) => vehicle.status === 'AVAILABLE' || vehicle.status === 'ON_MISSION',
    );

    if (!selectedCallSign || eligibleVehicles.some((vehicle) => vehicle.callSign === selectedCallSign)) {
      return eligibleVehicles;
    }

    const selectedVehicle = this.dispatchVehicles.find((vehicle) => vehicle.callSign === selectedCallSign);
    return selectedVehicle ? [selectedVehicle, ...eligibleVehicles] : eligibleVehicles;
  }

  private async saveDispatch(draft: DispatchDraft) {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.mutationError = '';

    try {
      const savedDispatch =
        this.modalMode === 'create'
          ? await createDispatch(draft, this.apiBase)
          : await updateDispatch(this.selectedDispatchId as number, draft, this.apiBase);

      if (this.modalMode === 'create') {
        this.dispatches = [savedDispatch, ...this.dispatches];
      } else {
        this.dispatches = this.dispatches.map((dispatch) => (dispatch.id === savedDispatch.id ? savedDispatch : dispatch));
      }

      this.dispatches = [...this.dispatches].sort(
        (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      );
      this.selectedDispatchId = savedDispatch.id;
      this.modalMode = 'view';
    } catch (error) {
      this.mutationError = await getApiErrorMessage(error, 'Unable to save dispatch.');
    } finally {
      this.isSaving = false;
    }
  }

  private async saveDispatchStatus(status: DispatchStatus) {
    if (!this.selectedDispatch || this.isUpdatingStatus) {
      return;
    }

    this.isUpdatingStatus = true;
    this.statusError = '';

    try {
      const updatedDispatch = await updateDispatchStatus(this.selectedDispatch.id, status, this.apiBase);
      this.dispatches = this.dispatches
        .map((dispatch) => (dispatch.id === updatedDispatch.id ? updatedDispatch : dispatch))
        .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
    } catch (error) {
      this.statusError = await getApiErrorMessage(error, 'Unable to update dispatch status.');
    } finally {
      this.isUpdatingStatus = false;
    }
  }

  private async confirmDeleteDispatch() {
    if (!this.dispatchPendingDeletion || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.deleteError = '';

    try {
      await deleteDispatch(this.dispatchPendingDeletion.id, this.apiBase);
      this.dispatches = this.dispatches.filter((dispatch) => dispatch.id !== this.dispatchPendingDeletion?.id);

      if (this.selectedDispatchId === this.dispatchPendingDeletion.id) {
        this.closeModal();
      }

      this.dispatchPendingDeletion = null;
    } catch (error) {
      this.deleteError = await getApiErrorMessage(error, 'Unable to cancel dispatch.');
    } finally {
      this.isDeleting = false;
    }
  }

  private formatDateTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  private renderMetricCard(label: string, value: string, tone: 'neutral' | 'alert' = 'neutral') {
    return (
      <article class={{ 'metric-card': true, 'metric-alert': tone === 'alert' }}>
        <span class="metric-label">{label}</span>
        <strong class="metric-value">{value}</strong>
      </article>
    );
  }

  private renderDispatchTable(title: string, description: string, items: DispatchRecord[], emptyMessage: string) {
    return (
      <section class="list-section">
        <div class="section-header">
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <span class="section-count">{items.length}</span>
        </div>

        {items.length === 0 ? (
          <div class="status-card">{emptyMessage}</div>
        ) : (
          <div class="table-card">
            <table class="dispatch-table">
              <thead>
                <tr>
                  <th>Incident</th>
                  <th>Location</th>
                  <th>Patient</th>
                  <th>Ambulance</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th class="actions-column" aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((dispatch) => (
                  <tr
                    class="dispatch-row"
                    onClick={() => this.openDetailsModal(dispatch.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        this.openDetailsModal(dispatch.id);
                      }
                    }}
                    tabindex={0}
                  >
                    <td>
                      <div class="primary-cell">
                        <strong>{dispatch.incidentNumber}</strong>
                        <span>{dispatch.dispatchReason}</span>
                      </div>
                    </td>
                    <td>{`${dispatch.streetAddress}, ${dispatch.city}`}</td>
                    <td>{dispatch.patientName}</td>
                    <td>{dispatch.ambulanceCallSign}</td>
                    <td>
                      <span class={{ 'priority-pill': true, [`priority-${dispatch.priority.toLowerCase()}`]: true }}>
                        {DISPATCH_PRIORITY_LABELS[dispatch.priority]}
                      </span>
                    </td>
                    <td>
                      <ambulance-management-dispatch-status-badge status={dispatch.status}></ambulance-management-dispatch-status-badge>
                    </td>
                    <td>{this.formatDateTime(dispatch.updatedAt)}</td>
                    <td class="action-cell">
                      <button
                        class="delete-button"
                        type="button"
                        aria-label={`Cancel dispatch ${dispatch.incidentNumber}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          this.openDeleteConfirmation(dispatch.id);
                        }}
                      >
                        <md-icon class="delete-icon" aria-hidden="true">
                          delete
                        </md-icon>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  private renderModal() {
    if (!this.isModalOpen) {
      return null;
    }

    if (this.modalMode === 'view' && this.selectedDispatch) {
      return (
        <ambulance-management-dispatch-details-modal
          dispatch={this.selectedDispatch}
          isUpdatingStatus={this.isUpdatingStatus}
          statusErrorMessage={this.statusError}
          onCloseRequest={() => this.closeModal()}
          onEditRequest={() => this.startEditing()}
          onStatusUpdateRequest={(event) => this.saveDispatchStatus(event.detail)}
        ></ambulance-management-dispatch-details-modal>
      );
    }

    const formMode: DispatchFormMode = this.modalMode === 'edit' ? 'edit' : 'create';

    return (
      <ambulance-management-dispatch-form-modal
        mode={formMode}
        initialDraft={formMode === 'edit' && this.selectedDispatch ? this.toDraft(this.selectedDispatch) : createEmptyDispatchDraft()}
        ambulanceOptions={this.getEligibleAmbulanceOptions(this.selectedDispatch?.ambulanceCallSign ?? '')}
        errorMessage={this.mutationError}
        isSubmitting={this.isSaving}
        onCloseRequest={() => this.closeModal()}
        onSaveRequest={(event) => this.saveDispatch(event.detail)}
      ></ambulance-management-dispatch-form-modal>
    );
  }

  private renderDeleteConfirmation() {
    return (
      <ambulance-management-dispatch-delete-confirmation-modal
        dispatch={this.dispatchPendingDeletion}
        errorMessage={this.deleteError}
        isDeleting={this.isDeleting}
        onCloseRequest={() => this.closeDeleteConfirmation()}
        onConfirmRequest={() => this.confirmDeleteDispatch()}
      ></ambulance-management-dispatch-delete-confirmation-modal>
    );
  }

  render() {
    const criticalDispatches = this.activeDispatches.filter((dispatch) => dispatch.priority === 'CRITICAL').length;

    return (
      <Host>
        <section class="page">
          <div class="page-header">
            <div>
              <p class="label">Dispatch operations</p>
              <h2>Ambulance Dispatch Management</h2>
              <p class="description">
                Create ambulance missions, track their progress, review historical interventions, and cancel mistaken dispatches.
              </p>
            </div>
            <md-filled-button disabled={this.isLoading} onClick={() => this.openCreateModal()}>
              <md-icon slot="icon">add</md-icon>
              New dispatch
            </md-filled-button>
          </div>

          {this.isLoading ? <md-linear-progress indeterminate></md-linear-progress> : null}

          <div class="metrics-grid">
            {this.renderMetricCard('Active dispatches', String(this.activeDispatches.length))}
            {this.renderMetricCard('Historical dispatches', String(this.historicalDispatches.length))}
            {this.renderMetricCard('Critical active calls', String(criticalDispatches), criticalDispatches > 0 ? 'alert' : 'neutral')}
          </div>

          {this.loadError ? (
            <div class="feedback-banner" role="alert">
              <span>{this.loadError}</span>
              <md-outlined-button onClick={() => this.loadDispatches()}>
                <md-icon slot="icon">refresh</md-icon>
                Retry
              </md-outlined-button>
            </div>
          ) : null}

          {!this.isLoading && this.dispatches.length === 0 && !this.loadError ? (
            <div class="status-card empty-state">
              <h3>No dispatches available</h3>
              <p>Create the first dispatch to start tracking interventions.</p>
            </div>
          ) : (
            <div class="dispatch-layout">
              {this.renderDispatchTable(
                'Current dispatches',
                'Open interventions and missions still in progress.',
                this.activeDispatches,
                'No active dispatches are currently in progress.',
              )}
              <md-divider></md-divider>
              {this.renderDispatchTable(
                'Historical dispatches',
                'Completed ambulance interventions retained for review.',
                this.historicalDispatches,
                'No historical dispatches have been completed yet.',
              )}
            </div>
          )}

          {this.renderModal()}
          {this.renderDeleteConfirmation()}
        </section>
      </Host>
    );
  }
}
