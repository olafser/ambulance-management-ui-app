import { Component, Host, State, h } from '@stencil/core';

import type { VehicleDraft, VehicleFormMode, VehicleRecord, VehicleStatus } from '../../types/vehicle';

const DEFAULT_DRAFT: VehicleDraft = {
  callSign: '',
  vehicleType: '',
  plateNumber: '',
  station: '',
  assignedCrew: '',
  status: 'Available',
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
  @State() private vehicles: VehicleRecord[] = [
    {
      id: 1,
      callSign: 'AMB-201',
      vehicleType: 'Rapid response van',
      plateNumber: 'BA-482KT',
      station: 'Bratislava Center',
      assignedCrew: 'Novak / Simko',
      status: 'Available',
      mileageKm: 48620,
      lastServiceDate: '2026-02-12',
      notes: 'Fully stocked and ready for deployment.',
    },
    {
      id: 2,
      callSign: 'AMB-315',
      vehicleType: 'Type C ambulance',
      plateNumber: 'TT-194LM',
      station: 'Trnava North',
      assignedCrew: 'Kovac / Balaz',
      status: 'On mission',
      mileageKm: 72110,
      lastServiceDate: '2026-01-28',
      notes: 'Assigned to inter-hospital transfer rotation.',
    },
    {
      id: 3,
      callSign: 'AMB-118',
      vehicleType: 'Type B ambulance',
      plateNumber: 'NR-551DP',
      station: 'Nitra South',
      assignedCrew: 'Unassigned',
      status: 'Maintenance',
      mileageKm: 103440,
      lastServiceDate: '2026-03-05',
      notes: 'Brake inspection scheduled for next shift.',
    },
  ];

  @State() private isModalOpen = false;
  @State() private modalMode: 'view' | VehicleFormMode = 'view';
  @State() private selectedVehicleId: number | null = null;
  @State() private vehiclePendingDeletion: VehicleRecord | null = null;

  private nextVehicleId = 4;

  private get selectedVehicle() {
    return this.vehicles.find((vehicle) => vehicle.id === this.selectedVehicleId) ?? null;
  }

  private openCreateModal() {
    this.modalMode = 'create';
    this.selectedVehicleId = null;
    this.isModalOpen = true;
  }

  private openDetailsModal(vehicleId: number) {
    const vehicle = this.vehicles.find((item) => item.id === vehicleId);
    if (!vehicle) {
      return;
    }

    this.selectedVehicleId = vehicleId;
    this.modalMode = 'view';
    this.isModalOpen = true;
  }

  private closeModal() {
    this.isModalOpen = false;
    this.modalMode = 'view';
    this.selectedVehicleId = null;
  }

  private openDeleteConfirmation(vehicleId: number) {
    const vehicle = this.vehicles.find((item) => item.id === vehicleId) ?? null;
    this.vehiclePendingDeletion = vehicle;
  }

  private closeDeleteConfirmation() {
    this.vehiclePendingDeletion = null;
  }

  private startEditing() {
    if (!this.selectedVehicle) {
      return;
    }

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

  private saveVehicle(draft: VehicleDraft) {
    const normalizedVehicle: VehicleRecord = {
      id: this.selectedVehicleId ?? this.nextVehicleId++,
      callSign: draft.callSign.trim(),
      vehicleType: draft.vehicleType.trim(),
      plateNumber: draft.plateNumber.trim(),
      station: draft.station.trim(),
      assignedCrew: draft.assignedCrew.trim() || 'Unassigned',
      status: draft.status,
      mileageKm: Number(draft.mileageKm) || 0,
      lastServiceDate: draft.lastServiceDate,
      notes: draft.notes.trim(),
    };

    if (this.modalMode === 'create') {
      this.vehicles = [normalizedVehicle, ...this.vehicles];
    } else {
      this.vehicles = this.vehicles.map((vehicle) =>
        vehicle.id === normalizedVehicle.id ? normalizedVehicle : vehicle,
      );
    }

    this.selectedVehicleId = normalizedVehicle.id;
    this.modalMode = 'view';
  }

  private confirmDeleteVehicle() {
    if (!this.vehiclePendingDeletion) {
      return;
    }

    this.vehicles = this.vehicles.filter((vehicle) => vehicle.id !== this.vehiclePendingDeletion?.id);

    if (this.selectedVehicleId === this.vehiclePendingDeletion.id) {
      this.closeModal();
    }

    this.vehiclePendingDeletion = null;
  }

  private renderBadge(status: VehicleStatus) {
    return <span class={{ badge: true, [`status-${status.toLowerCase().replace(/\s+/g, '-')}`]: true }}>{status}</span>;
  }

  private renderVehicleTable() {
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
        onCloseRequest={() => this.closeModal()}
        onSaveRequest={(event) => this.saveVehicle(event.detail)}
      ></ambulance-management-vehicle-form-modal>
    );
  }

  private renderDeleteConfirmation() {
    return (
      <ambulance-management-vehicle-delete-confirmation-modal
        vehicle={this.vehiclePendingDeletion}
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
            <button class="primary-button" type="button" onClick={() => this.openCreateModal()}>
              Add new vehicle
            </button>
          </div>

          {this.renderVehicleTable()}
          {this.renderModal()}
          {this.renderDeleteConfirmation()}
        </section>
      </Host>
    );
  }
}
