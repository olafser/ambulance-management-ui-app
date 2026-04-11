import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

import type { VehicleRecord } from '../../types/vehicle';

@Component({
  tag: 'ambulance-management-vehicle-delete-confirmation-modal',
  styleUrl: 'ambulance-management-vehicle-delete-confirmation-modal.css',
  shadow: true,
})
export class AmbulanceManagementVehicleDeleteConfirmationModal {
  @Prop() vehicle: VehicleRecord | null = null;
  @Prop() errorMessage = '';
  @Prop() isDeleting = false;

  @Event() closeRequest: EventEmitter<void>;
  @Event() confirmRequest: EventEmitter<void>;

  render() {
    if (!this.vehicle) {
      return null;
    }

    return (
      <Host>
        <div class="modal-backdrop" onClick={() => this.closeRequest.emit()}>
          <div
            class="confirm-shell"
            role="alertdialog"
            aria-modal="true"
            aria-label="Delete vehicle confirmation"
            onClick={(event) => event.stopPropagation()}
          >
            <div class="confirm-content">
              <p class="eyebrow">Delete vehicle</p>
              <h3>Are you sure?</h3>
              <p class="description">
                Delete vehicle <strong>{this.vehicle.callSign}</strong>. This action cannot be undone.
              </p>
              {this.errorMessage ? (
                <div class="feedback-banner" role="alert">
                  {this.errorMessage}
                </div>
              ) : null}
              <div class="modal-actions">
                <button class="secondary-button" type="button" disabled={this.isDeleting} onClick={() => this.closeRequest.emit()}>
                  Cancel
                </button>
                <button class="danger-button" type="button" disabled={this.isDeleting} onClick={() => this.confirmRequest.emit()}>
                  {this.isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
