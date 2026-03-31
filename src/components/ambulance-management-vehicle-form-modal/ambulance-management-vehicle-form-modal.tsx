import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';

import type { VehicleDraft, VehicleFormMode, VehicleStatus } from '../../types/vehicle';

@Component({
  tag: 'ambulance-management-vehicle-form-modal',
  styleUrl: 'ambulance-management-vehicle-form-modal.css',
  shadow: true,
})
export class AmbulanceManagementVehicleFormModal {
  @Prop() mode: VehicleFormMode = 'create';
  @Prop() initialDraft!: VehicleDraft;

  @State() private draft: VehicleDraft = {
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

  @Event() closeRequest: EventEmitter<void>;
  @Event() saveRequest: EventEmitter<VehicleDraft>;

  componentWillLoad() {
    this.syncDraftFromProps();
  }

  @Watch('initialDraft')
  protected syncDraftFromProps() {
    this.draft = { ...this.initialDraft };
  }

  private updateDraft<K extends keyof VehicleDraft>(field: K, value: VehicleDraft[K]) {
    this.draft = {
      ...this.draft,
      [field]: value,
    };
  }

  private handleSubmit(event: Event) {
    event.preventDefault();
    this.saveRequest.emit(this.draft);
  }

  render() {
    return (
      <Host>
        <div class="modal-backdrop" onClick={() => this.closeRequest.emit()}>
          <div
            class="modal-shell"
            role="dialog"
            aria-modal="true"
            aria-label={this.mode === 'create' ? 'Add vehicle' : 'Edit vehicle'}
            onClick={(event) => event.stopPropagation()}
          >
            <form class="vehicle-form" onSubmit={(event) => this.handleSubmit(event)}>
              <div class="modal-header">
                <div>
                  <p class="eyebrow">{this.mode === 'create' ? 'Add vehicle' : 'Edit vehicle'}</p>
                  <h3>{this.mode === 'create' ? 'New vehicle' : this.draft.callSign || 'Update vehicle'}</h3>
                </div>
              </div>

              <div class="form-body">
                <div class="form-grid">
                  <label>
                    <span>ID</span>
                    <input
                      required
                      value={this.draft.callSign}
                      onInput={(event) => this.updateDraft('callSign', (event.target as HTMLInputElement).value)}
                    />
                  </label>
                  <label>
                    <span>Vehicle type</span>
                    <input
                      required
                      value={this.draft.vehicleType}
                      onInput={(event) => this.updateDraft('vehicleType', (event.target as HTMLInputElement).value)}
                    />
                  </label>
                  <label>
                    <span>Plate number</span>
                    <input
                      required
                      value={this.draft.plateNumber}
                      onInput={(event) => this.updateDraft('plateNumber', (event.target as HTMLInputElement).value)}
                    />
                  </label>
                  <label>
                    <span>Station</span>
                    <input
                      required
                      value={this.draft.station}
                      onInput={(event) => this.updateDraft('station', (event.target as HTMLInputElement).value)}
                    />
                  </label>
                  <label>
                    <span>Assigned crew</span>
                    <input
                      value={this.draft.assignedCrew}
                      onInput={(event) => this.updateDraft('assignedCrew', (event.target as HTMLInputElement).value)}
                    />
                  </label>
                  <label>
                    <span>Status</span>
                    <select
                      onInput={(event) =>
                        this.updateDraft('status', (event.target as HTMLSelectElement).value as VehicleStatus)
                      }
                    >
                      <option value="Available" selected={this.draft.status === 'Available'}>
                        Available
                      </option>
                      <option value="On mission" selected={this.draft.status === 'On mission'}>
                        On mission
                      </option>
                      <option value="Maintenance" selected={this.draft.status === 'Maintenance'}>
                        Maintenance
                      </option>
                      <option value="Reserved" selected={this.draft.status === 'Reserved'}>
                        Reserved
                      </option>
                    </select>
                  </label>
                  <label>
                    <span>Mileage (km)</span>
                    <input
                      required
                      min="0"
                      type="number"
                      value={this.draft.mileageKm}
                      onInput={(event) => this.updateDraft('mileageKm', (event.target as HTMLInputElement).value)}
                    />
                  </label>
                  <label>
                    <span>Last service date</span>
                    <input
                      required
                      type="date"
                      value={this.draft.lastServiceDate}
                      onInput={(event) => this.updateDraft('lastServiceDate', (event.target as HTMLInputElement).value)}
                    />
                  </label>
                  <label class="notes-field">
                    <span>Notes</span>
                    <textarea
                      rows={4}
                      value={this.draft.notes}
                      onInput={(event) => this.updateDraft('notes', (event.target as HTMLTextAreaElement).value)}
                    ></textarea>
                  </label>
                </div>
              </div>

              <div class="modal-actions">
                <button class="secondary-button" type="button" onClick={() => this.closeRequest.emit()}>
                  Cancel
                </button>
                <button class="primary-button" type="submit">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </Host>
    );
  }
}
