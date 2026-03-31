import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

import type { VehicleRecord } from '../../types/vehicle';

@Component({
  tag: 'ambulance-management-vehicle-details-modal',
  styleUrl: 'ambulance-management-vehicle-details-modal.css',
  shadow: true,
})
export class AmbulanceManagementVehicleDetailsModal {
  @Prop() vehicle: VehicleRecord | null = null;

  @Event() closeRequest: EventEmitter<void>;
  @Event() editRequest: EventEmitter<void>;

  private renderReadOnlyField(label: string, value: string) {
    return (
      <div class="detail-item">
        <span class="detail-label">{label}</span>
        <span class="detail-value">{value}</span>
      </div>
    );
  }

  private renderBadge(status: VehicleRecord['status']) {
    return <span class={{ badge: true, [`status-${status.toLowerCase().replace(/\s+/g, '-')}`]: true }}>{status}</span>;
  }

  render() {
    if (!this.vehicle) {
      return null;
    }

    return (
      <Host>
        <div class="modal-backdrop" onClick={() => this.closeRequest.emit()}>
          <div
            class="modal-shell"
            role="dialog"
            aria-modal="true"
            aria-label="Vehicle details"
            onClick={(event) => event.stopPropagation()}
          >
            <div class="modal-content">
              <div class="modal-header">
                <div>
                  <p class="eyebrow">Vehicle details</p>
                  <h3>{this.vehicle.callSign}</h3>
                </div>
                {this.renderBadge(this.vehicle.status)}
              </div>

              <div class="detail-grid">
                {this.renderReadOnlyField('ID', this.vehicle.callSign)}
                {this.renderReadOnlyField('Vehicle type', this.vehicle.vehicleType)}
                {this.renderReadOnlyField('Plate number', this.vehicle.plateNumber)}
                {this.renderReadOnlyField('Station', this.vehicle.station)}
                {this.renderReadOnlyField('Assigned crew', this.vehicle.assignedCrew)}
                {this.renderReadOnlyField('Mileage', `${this.vehicle.mileageKm.toLocaleString()} km`)}
                {this.renderReadOnlyField('Last service', this.vehicle.lastServiceDate)}
              </div>

              <div class="notes-panel">
                <span class="detail-label">Notes</span>
                <p>{this.vehicle.notes || 'No notes recorded.'}</p>
              </div>

              <div class="modal-actions">
                <button class="secondary-button" type="button" onClick={() => this.closeRequest.emit()}>
                  Close
                </button>
                <button class="primary-button" type="button" onClick={() => this.editRequest.emit()}>
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
