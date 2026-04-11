import { Component, Host, State, h } from '@stencil/core';

import { VEHICLE_STATUS_LABELS, type VehicleDraft, type VehicleFormMode, type VehicleRecord, type VehicleStatus } from '../../types/vehicle';
import { createVehicle, deleteVehicle, getApiErrorMessage, listVehicles, updateVehicle } from '../../api/ambulance-management/client';

const DEFAULT_DRAFT: VehicleDraft = {
  callSign: '',
  vehicleType: '',
  plateNumber: '',
  station: '',
  assignedCrew: '',
  status: 'AVAILABLE',
  mileageKm: '',
  lastServiceDate: '',
  notes: '',
};

@Component({
  tag: 'ambulance-management-paramedic-vehicle-management',
  styleUrl: 'ambulance-management-paramedic-vehicle-management.css',
  shadow: true,
})
export class AmbulanceManagementParamedicVehicleManagement {
  @State() private vehicles: VehicleRecord[] = [];
  @State() private isLoading = true;
  @State() private loadError = '';
  @State() private mutationError = '';
  @State() private deleteError = '';
  @State() private isSaving = false;
  @State() private isDeleting = false;

  @State() private isModalOpen = false;
  @State() private modalMode: 'view' | VehicleFormMode = 'view';
  @State() private selectedVehicleId: number | null = null;
  @State() private vehiclePendingDeletion: VehicleRecord | null = null;

  private get selectedVehicle() {
    return this.vehicles.find((vehicle) => vehicle.id === this.selectedVehicleId) ?? null;
  }

  async componentWillLoad() {
    await this.loadVehicles();
  }

  private async loadVehicles() {
    this.isLoading = true;
    this.loadError = '';

    try {
      this.vehicles = await listVehicles();

      if (this.selectedVehicleId !== null && !this.vehicles.some((vehicle) => vehicle.id === this.selectedVehicleId)) {
        this.closeModal();
      }
    } catch (error) {
      this.loadError = await getApiErrorMessage(error, 'Unable to load vehicles.');
    } finally {
      this.isLoading = false;
    }
  }

  private openCreateModal() {
    this.modalMode = 'create';
    this.selectedVehicleId = null;
    this.mutationError = '';
    this.isModalOpen = true;
  }

  private openDetailsModal(vehicleId: number) {
    const vehicle = this.vehicles.find((item) => item.id === vehicleId);
    if (!vehicle) {
      return;
    }

    this.selectedVehicleId = vehicleId;
    this.modalMode = 'view';
    this.mutationError = '';
    this.isModalOpen = true;
  }

  private closeModal() {
    this.isModalOpen = false;
    this.modalMode = 'view';
    this.selectedVehicleId = null;
    this.mutationError = '';
  }

  private openDeleteConfirmation(vehicleId: number) {
    const vehicle = this.vehicles.find((item) => item.id === vehicleId) ?? null;
    this.deleteError = '';
    this.vehiclePendingDeletion = vehicle;
  }

  private closeDeleteConfirmation() {
    this.deleteError = '';
    this.vehiclePendingDeletion = null;
  }

  private startEditing() {
    if (!this.selectedVehicle) {
      return;
    }

    this.mutationError = '';
    this.modalMode = 'edit';
  }

  private toDraft(vehicle: VehicleRecord): VehicleDraft {
    return {
      callSign: vehicle.callSign,
      vehicleType: vehicle.vehicleType,
      plateNumber: vehicle.plateNumber,
      station: vehicle.station,
      assignedCrew: vehicle.assignedCrew,
      status: vehicle.status,
      mileageKm: String(vehicle.mileageKm),
      lastServiceDate: vehicle.lastServiceDate,
      notes: vehicle.notes,
    };
  }

  private async saveVehicle(draft: VehicleDraft) {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.mutationError = '';

    try {
      const savedVehicle =
        this.modalMode === 'create'
          ? await createVehicle(draft)
          : await updateVehicle(this.selectedVehicleId as number, draft);

      if (this.modalMode === 'create') {
        this.vehicles = [savedVehicle, ...this.vehicles];
      } else {
        this.vehicles = this.vehicles.map((vehicle) => (vehicle.id === savedVehicle.id ? savedVehicle : vehicle));
      }

      this.selectedVehicleId = savedVehicle.id;
      this.modalMode = 'view';
    } catch (error) {
      this.mutationError = await getApiErrorMessage(error, 'Unable to save vehicle.');
    } finally {
      this.isSaving = false;
    }
  }

  private async confirmDeleteVehicle() {
    if (!this.vehiclePendingDeletion || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.deleteError = '';

    try {
      await deleteVehicle(this.vehiclePendingDeletion.id);
      this.vehicles = this.vehicles.filter((vehicle) => vehicle.id !== this.vehiclePendingDeletion?.id);

      if (this.selectedVehicleId === this.vehiclePendingDeletion.id) {
        this.closeModal();
      }

      this.vehiclePendingDeletion = null;
    } catch (error) {
      this.deleteError = await getApiErrorMessage(error, 'Unable to delete vehicle.');
    } finally {
      this.isDeleting = false;
    }
  }

  private renderBadge(status: VehicleStatus) {
    return <span class={{ badge: true, [`status-${status.toLowerCase().replace(/_/g, '-')}`]: true }}>{VEHICLE_STATUS_LABELS[status]}</span>;
  }

  private renderVehicleTable() {
    if (this.isLoading) {
      return (
        <div class="status-card" role="status">
          Loading vehicles from the API...
        </div>
      );
    }

    if (this.loadError && this.vehicles.length === 0) {
      return (
        <div class="status-card error-state" role="alert">
          <p>{this.loadError}</p>
          <button class="secondary-button retry-button" type="button" onClick={() => this.loadVehicles()}>
            Retry
          </button>
        </div>
      );
    }

    if (this.vehicles.length === 0) {
      return <div class="status-card">No vehicles were returned by the API.</div>;
    }

    return (
      <div class="table-card">
        <table class="vehicle-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Station</th>
              <th>Assigned crew</th>
              <th>Status</th>
              <th>Mileage</th>
              <th class="actions-column" aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>
            {this.vehicles.map((vehicle) => (
              <tr
                class="vehicle-row"
                onClick={() => this.openDetailsModal(vehicle.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.openDetailsModal(vehicle.id);
                  }
                }}
                tabindex={0}
              >
                <td>{vehicle.callSign}</td>
                <td>{vehicle.vehicleType}</td>
                <td>{vehicle.station}</td>
                <td>{vehicle.assignedCrew}</td>
                <td>{this.renderBadge(vehicle.status)}</td>
                <td>{vehicle.mileageKm.toLocaleString()} km</td>
                <td class="delete-cell">
                  <button
                    class="delete-button"
                    type="button"
                    aria-label={`Delete vehicle ${vehicle.callSign}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      this.openDeleteConfirmation(vehicle.id);
                    }}
                  >
                    <span class="delete-icon" aria-hidden="true">
                      delete
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  private renderModal() {
    if (!this.isModalOpen) {
      return null;
    }

    if (this.modalMode === 'view' && this.selectedVehicle) {
      return (
        <ambulance-management-vehicle-details-modal
          vehicle={this.selectedVehicle}
          onCloseRequest={() => this.closeModal()}
          onEditRequest={() => this.startEditing()}
        ></ambulance-management-vehicle-details-modal>
      );
    }

    const formMode: VehicleFormMode = this.modalMode === 'edit' ? 'edit' : 'create';

    return (
      <ambulance-management-vehicle-form-modal
        mode={formMode}
        initialDraft={formMode === 'edit' && this.selectedVehicle ? this.toDraft(this.selectedVehicle) : { ...DEFAULT_DRAFT }}
        errorMessage={this.mutationError}
        isSubmitting={this.isSaving}
        onCloseRequest={() => this.closeModal()}
        onSaveRequest={(event) => this.saveVehicle(event.detail)}
      ></ambulance-management-vehicle-form-modal>
    );
  }

  private renderDeleteConfirmation() {
    return (
      <ambulance-management-vehicle-delete-confirmation-modal
        vehicle={this.vehiclePendingDeletion}
        errorMessage={this.deleteError}
        isDeleting={this.isDeleting}
        onCloseRequest={() => this.closeDeleteConfirmation()}
        onConfirmRequest={() => this.confirmDeleteVehicle()}
      ></ambulance-management-vehicle-delete-confirmation-modal>
    );
  }

  render() {
    return (
      <Host>
        <section class="page">
          <div class="page-header">
            <div>
              <p class="label">Fleet operations</p>
              <h2>Paramedic Vehicle Management</h2>
              <p class="description">Track vehicles, inspect details, and update operational data from one place.</p>
            </div>
            <button class="primary-button" type="button" disabled={this.isLoading} onClick={() => this.openCreateModal()}>
              Add new vehicle
            </button>
          </div>

          {this.loadError && this.vehicles.length > 0 ? (
            <div class="feedback-banner" role="alert">
              <span>{this.loadError}</span>
              <button class="secondary-button retry-button" type="button" onClick={() => this.loadVehicles()}>
                Retry
              </button>
            </div>
          ) : null}

          {this.renderVehicleTable()}
          {this.renderModal()}
          {this.renderDeleteConfirmation()}
        </section>
      </Host>
    );
  }
}
