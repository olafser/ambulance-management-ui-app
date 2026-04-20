import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';

import {
  DISPATCH_PRIORITY_LABELS,
  DISPATCH_STATUS_LABELS,
  type DispatchDraft,
  type DispatchFormMode,
  type DispatchPriority,
  type DispatchStatus,
} from '../../types/dispatch';
import { VEHICLE_STATUS_LABELS, type VehicleRecord } from '../../types/vehicle';

type SelectLikeTarget = EventTarget & { value: string };
type TextFieldLikeTarget = EventTarget & { value: string };

@Component({
  tag: 'ambulance-management-dispatch-form-modal',
  styleUrl: 'ambulance-management-dispatch-form-modal.css',
  shadow: true,
})
export class AmbulanceManagementDispatchFormModal {
  @Prop() mode: DispatchFormMode = 'create';
  @Prop() initialDraft!: DispatchDraft;
  @Prop() errorMessage = '';
  @Prop() isSubmitting = false;
  @Prop() ambulanceOptions: VehicleRecord[] = [];

  @State() private draft: DispatchDraft = {
    incidentNumber: '',
    callerName: '',
    patientName: '',
    streetAddress: '',
    city: '',
    dispatchReason: '',
    priority: 'HIGH',
    status: 'ACCEPTED',
    ambulanceCallSign: '',
    destinationHospital: '',
    dispatcherName: '',
    createdAt: '',
    notes: '',
  };

  @Event() closeRequest: EventEmitter<void>;
  @Event() saveRequest: EventEmitter<DispatchDraft>;

  componentWillLoad() {
    this.syncDraftFromProps();
  }

  @Watch('initialDraft')
  protected syncDraftFromProps() {
    this.draft = { ...this.initialDraft };
  }

  private updateDraft<K extends keyof DispatchDraft>(field: K, value: DispatchDraft[K]) {
    this.draft = {
      ...this.draft,
      [field]: value,
    };
  }

  private handleSubmit(event: Event) {
    event.preventDefault();
    this.saveRequest.emit(this.draft);
  }

  private renderAmbulanceCallSignField() {
    const hasOptions = this.ambulanceOptions.length > 0;

    return (
      <label>
        <md-outlined-select
          class="material-select"
          label="Ambulance call sign"
          required
          menu-positioning="fixed"
          supporting-text="Available and on mission ambulances only"
          onInput={(event) => this.updateDraft('ambulanceCallSign', (event.target as SelectLikeTarget).value)}
        >
          {hasOptions ? (
            this.ambulanceOptions.map((vehicle) => (
              <md-select-option value={vehicle.callSign} selected={this.draft.ambulanceCallSign === vehicle.callSign}>
                {`${vehicle.callSign} - ${VEHICLE_STATUS_LABELS[vehicle.status]}`}
              </md-select-option>
            ))
          ) : (
            <md-select-option value="" selected disabled>
              No eligible ambulances available
            </md-select-option>
          )}
        </md-outlined-select>
      </label>
    );
  }

  private renderTextField(
    label: string,
    field: keyof DispatchDraft,
    options: { required?: boolean; type?: string; textarea?: boolean } = {},
  ) {
    const value = this.draft[field] as string;

    return (
      <label class={{ 'notes-field': Boolean(options.textarea) }}>
        <md-outlined-text-field
          class="material-field"
          label={label}
          required={options.required}
          type={options.textarea ? 'textarea' : options.type ?? 'text'}
          rows={options.textarea ? 4 : undefined}
          value={value}
          onInput={(event) => this.updateDraft(field, (event.target as TextFieldLikeTarget).value as DispatchDraft[typeof field])}
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
            aria-label={this.mode === 'create' ? 'Create dispatch' : 'Edit dispatch'}
            onClick={(event) => event.stopPropagation()}
          >
            <form class="dispatch-form" onSubmit={(event) => this.handleSubmit(event)}>
              <div class="modal-header">
                <div>
                  <p class="eyebrow">{this.mode === 'create' ? 'Create dispatch' : 'Edit dispatch'}</p>
                  <h3>{this.mode === 'create' ? 'New ambulance mission' : this.draft.incidentNumber || 'Update dispatch'}</h3>
                </div>
              </div>

              <div class="form-body">
                {this.errorMessage ? (
                  <div class="feedback-banner" role="alert">
                    {this.errorMessage}
                  </div>
                ) : null}

                <div class="form-grid">
                  {this.renderTextField('Incident number', 'incidentNumber', { required: true })}
                  {this.renderTextField('Created at', 'createdAt', { required: true, type: 'datetime-local' })}
                  {this.renderTextField('Caller name', 'callerName', { required: true })}
                  {this.renderTextField('Patient name', 'patientName', { required: true })}
                  {this.renderTextField('Street address', 'streetAddress', { required: true })}
                  {this.renderTextField('City', 'city', { required: true })}
                  {this.renderAmbulanceCallSignField()}
                  {this.renderTextField('Destination hospital', 'destinationHospital', { required: true })}
                  {this.renderTextField('Dispatcher name', 'dispatcherName', { required: true })}

                  <label>
                    <md-outlined-select
                      class="material-select"
                      label="Priority"
                      menu-positioning="fixed"
                      onInput={(event) => this.updateDraft('priority', (event.target as SelectLikeTarget).value as DispatchPriority)}
                    >
                      <md-select-option value="LOW" selected={this.draft.priority === 'LOW'}>
                        {DISPATCH_PRIORITY_LABELS.LOW}
                      </md-select-option>
                      <md-select-option value="MEDIUM" selected={this.draft.priority === 'MEDIUM'}>
                        {DISPATCH_PRIORITY_LABELS.MEDIUM}
                      </md-select-option>
                      <md-select-option value="HIGH" selected={this.draft.priority === 'HIGH'}>
                        {DISPATCH_PRIORITY_LABELS.HIGH}
                      </md-select-option>
                      <md-select-option value="CRITICAL" selected={this.draft.priority === 'CRITICAL'}>
                        {DISPATCH_PRIORITY_LABELS.CRITICAL}
                      </md-select-option>
                    </md-outlined-select>
                  </label>

                  <label>
                    <md-outlined-select
                      class="material-select"
                      label="Status"
                      menu-positioning="fixed"
                      onInput={(event) => this.updateDraft('status', (event.target as SelectLikeTarget).value as DispatchStatus)}
                    >
                      <md-select-option value="ACCEPTED" selected={this.draft.status === 'ACCEPTED'}>
                        {DISPATCH_STATUS_LABELS.ACCEPTED}
                      </md-select-option>
                      <md-select-option value="EN_ROUTE" selected={this.draft.status === 'EN_ROUTE'}>
                        {DISPATCH_STATUS_LABELS.EN_ROUTE}
                      </md-select-option>
                      <md-select-option value="ON_SCENE" selected={this.draft.status === 'ON_SCENE'}>
                        {DISPATCH_STATUS_LABELS.ON_SCENE}
                      </md-select-option>
                      <md-select-option
                        value="TRANSPORTING_TO_HOSPITAL"
                        selected={this.draft.status === 'TRANSPORTING_TO_HOSPITAL'}
                      >
                        {DISPATCH_STATUS_LABELS.TRANSPORTING_TO_HOSPITAL}
                      </md-select-option>
                      <md-select-option value="COMPLETED" selected={this.draft.status === 'COMPLETED'}>
                        {DISPATCH_STATUS_LABELS.COMPLETED}
                      </md-select-option>
                    </md-outlined-select>
                  </label>

                  {this.renderTextField('Dispatch reason', 'dispatchReason', { required: true, textarea: true })}
                  {this.renderTextField('Notes', 'notes', { textarea: true })}
                </div>
              </div>

              <div class="modal-actions">
                <md-outlined-button disabled={this.isSubmitting} onClick={() => this.closeRequest.emit()}>
                  Cancel
                </md-outlined-button>
                <md-filled-tonal-button disabled={this.isSubmitting} type="submit">
                  {this.isSubmitting ? 'Saving...' : 'Save dispatch'}
                </md-filled-tonal-button>
              </div>
            </form>
          </div>
        </div>
      </Host>
    );
  }
}
