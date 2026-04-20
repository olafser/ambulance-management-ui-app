import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';

import { DISPATCH_STATUS_LABELS, DISPATCH_STATUS_ORDER, type DispatchRecord, type DispatchStatus } from '../../types/dispatch';

type SelectLikeTarget = EventTarget & { value: string };

@Component({
  tag: 'ambulance-management-dispatch-details-modal',
  styleUrl: 'ambulance-management-dispatch-details-modal.css',
  shadow: true,
})
export class AmbulanceManagementDispatchDetailsModal {
  @Prop() dispatch: DispatchRecord | null = null;
  @Prop() isUpdatingStatus = false;
  @Prop() statusErrorMessage = '';

  @State() private selectedStatus: DispatchStatus | '' = '';

  @Event() closeRequest: EventEmitter<void>;
  @Event() editRequest: EventEmitter<void>;
  @Event() statusUpdateRequest: EventEmitter<DispatchStatus>;

  componentWillLoad() {
    this.syncStatusFromProps();
  }

  @Watch('dispatch')
  protected syncStatusFromProps() {
    this.selectedStatus = this.dispatch?.status ?? '';
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

  private renderField(label: string, value: string) {
    return (
      <div class="detail-item">
        <span class="detail-label">{label}</span>
        <span class="detail-value">{value}</span>
      </div>
    );
  }

  render() {
    if (!this.dispatch) {
      return null;
    }

    const statusChanged = this.selectedStatus !== '' && this.selectedStatus !== this.dispatch.status;

    return (
      <Host>
        <div class="modal-backdrop" onClick={() => this.closeRequest.emit()}>
          <div class="modal-shell" role="dialog" aria-modal="true" aria-label="Dispatch details" onClick={(event) => event.stopPropagation()}>
            <div class="modal-content">
              <div class="modal-header">
                <div>
                  <p class="eyebrow">Dispatch details</p>
                  <h3>{this.dispatch.incidentNumber}</h3>
                  <p class="subtitle">{`${this.dispatch.streetAddress}, ${this.dispatch.city}`}</p>
                </div>
                <ambulance-management-dispatch-status-badge status={this.dispatch.status}></ambulance-management-dispatch-status-badge>
              </div>

              <div class="detail-grid">
                {this.renderField('Caller', this.dispatch.callerName)}
                {this.renderField('Patient', this.dispatch.patientName)}
                {this.renderField('Ambulance', this.dispatch.ambulanceCallSign)}
                {this.renderField('Destination hospital', this.dispatch.destinationHospital)}
                {this.renderField('Dispatcher', this.dispatch.dispatcherName)}
                {this.renderField('Created at', this.formatDateTime(this.dispatch.createdAt))}
                {this.renderField('Last update', this.formatDateTime(this.dispatch.updatedAt))}
                {this.renderField('Priority', this.dispatch.priority)}
              </div>

              <div class="notes-panel">
                <span class="detail-label">Dispatch reason</span>
                <p>{this.dispatch.dispatchReason}</p>
              </div>

              <div class="notes-panel">
                <span class="detail-label">Notes</span>
                <p>{this.dispatch.notes || 'No notes recorded.'}</p>
              </div>

              <div class="status-panel">
                <div>
                  <span class="detail-label">Update status</span>
                  <p class="status-copy">Progress the dispatch through the response workflow.</p>
                </div>

                <div class="status-controls">
                  <md-outlined-select
                    class="material-select"
                    label="Dispatch status"
                    menu-positioning="fixed"
                    onInput={(event) => {
                      this.selectedStatus = (event.target as SelectLikeTarget).value as DispatchStatus;
                    }}
                  >
                    {DISPATCH_STATUS_ORDER.map((status) => (
                      <md-select-option value={status} selected={this.selectedStatus === status}>
                        {DISPATCH_STATUS_LABELS[status]}
                      </md-select-option>
                    ))}
                  </md-outlined-select>
                  <md-filled-button
                    disabled={!statusChanged || this.isUpdatingStatus}
                    onClick={() => this.statusUpdateRequest.emit(this.selectedStatus as DispatchStatus)}
                  >
                    {this.isUpdatingStatus ? 'Updating...' : 'Update status'}
                  </md-filled-button>
                </div>
              </div>

              {this.statusErrorMessage ? (
                <div class="feedback-banner" role="alert">
                  {this.statusErrorMessage}
                </div>
              ) : null}

              <div class="modal-actions">
                <md-outlined-button onClick={() => this.closeRequest.emit()}>Close</md-outlined-button>
                <md-filled-button onClick={() => this.editRequest.emit()}>Edit dispatch</md-filled-button>
              </div>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
