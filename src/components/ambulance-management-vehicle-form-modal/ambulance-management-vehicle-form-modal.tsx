import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';

import { VEHICLE_STATUS_LABELS, type VehicleDraft, type VehicleFormMode, type VehicleStatus } from '../../types/vehicle';

type SelectLikeTarget = EventTarget & { value: string };
type TextFieldLikeTarget = EventTarget & { value: string };

@Component({
  tag: 'ambulance-management-vehicle-form-modal',
  styleUrl: 'ambulance-management-vehicle-form-modal.css',
  shadow: true,
})
export class AmbulanceManagementVehicleFormModal {
  @Prop() mode: VehicleFormMode = 'create';
  @Prop() initialDraft!: VehicleDraft;
  @Prop() errorMessage = '';
  @Prop() isSubmitting = false;

  @State() private draft: VehicleDraft = {
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

  private renderTextField(
    label: string,
    field: keyof VehicleDraft,
    options: { required?: boolean; type?: string; min?: string; textarea?: boolean; rows?: number } = {},
  ) {
    const value = this.draft[field] as string;

    return (
      <label class={{ 'notes-field': Boolean(options.textarea) }}>
        <md-outlined-text-field
          class="material-field"
          label={label}
          required={options.required}
          type={options.textarea ? 'textarea' : options.type ?? 'text'}
          min={options.min}
          rows={options.textarea ? options.rows ?? 4 : undefined}
          value={value}
          onInput={(event) => this.updateDraft(field, (event.target as TextFieldLikeTarget).value as VehicleDraft[typeof field])}
        ></md-outlined-text-field>
      </label>
    );
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
                {this.errorMessage ? (
                  <div class="feedback-banner" role="alert">
                    {this.errorMessage}
                  </div>
                ) : null}

                <div class="form-grid">
                  {this.renderTextField('Vehicle ID', 'callSign', { required: true })}
                  {this.renderTextField('Vehicle type', 'vehicleType', { required: true })}
                  {this.renderTextField('Plate number', 'plateNumber', { required: true })}
                  {this.renderTextField('Station', 'station', { required: true })}
                  {this.renderTextField('Assigned crew', 'assignedCrew')}
                  <label>
                    <md-outlined-select
                      class="material-select"
                      label="Status"
                      menu-positioning="fixed"
                      onInput={(event) =>
                        this.updateDraft('status', (event.target as SelectLikeTarget).value as VehicleStatus)
                      }
                    >
                      <md-select-option value="AVAILABLE" selected={this.draft.status === 'AVAILABLE'}>
                        {VEHICLE_STATUS_LABELS.AVAILABLE}
                      </md-select-option>
                      <md-select-option value="ON_MISSION" selected={this.draft.status === 'ON_MISSION'}>
                        {VEHICLE_STATUS_LABELS.ON_MISSION}
                      </md-select-option>
                      <md-select-option value="OUT_OF_SERVICE" selected={this.draft.status === 'OUT_OF_SERVICE'}>
                        {VEHICLE_STATUS_LABELS.OUT_OF_SERVICE}
                      </md-select-option>
                      <md-select-option value="IN_SERVICE" selected={this.draft.status === 'IN_SERVICE'}>
                        {VEHICLE_STATUS_LABELS.IN_SERVICE}
                      </md-select-option>
                    </md-outlined-select>
                  </label>
                  {this.renderTextField('Mileage (km)', 'mileageKm', { required: true, type: 'number', min: '0' })}
                  {this.renderTextField('Last service date', 'lastServiceDate', { required: true, type: 'date' })}
                  {this.renderTextField('Notes', 'notes', { textarea: true, rows: 4 })}
                </div>
              </div>

              <div class="modal-actions">
                <md-outlined-button disabled={this.isSubmitting} onClick={() => this.closeRequest.emit()}>
                  Cancel
                </md-outlined-button>
                <md-filled-tonal-button type="submit" disabled={this.isSubmitting}>
                  {this.isSubmitting ? 'Saving...' : 'Save vehicle'}
                </md-filled-tonal-button>
              </div>
            </form>
          </div>
        </div>
      </Host>
    );
  }
}
