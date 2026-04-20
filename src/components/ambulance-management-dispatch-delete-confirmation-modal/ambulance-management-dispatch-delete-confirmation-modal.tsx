import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

import type { DispatchRecord } from '../../types/dispatch';

@Component({
  tag: 'ambulance-management-dispatch-delete-confirmation-modal',
  styleUrl: 'ambulance-management-dispatch-delete-confirmation-modal.css',
  shadow: true,
})
export class AmbulanceManagementDispatchDeleteConfirmationModal {
  @Prop() dispatch: DispatchRecord | null = null;
  @Prop() errorMessage = '';
  @Prop() isDeleting = false;

  @Event() closeRequest: EventEmitter<void>;
  @Event() confirmRequest: EventEmitter<void>;

  render() {
    if (!this.dispatch) {
      return null;
    }

    return (
      <Host>
        <div class="modal-backdrop" onClick={() => this.closeRequest.emit()}>
          <div
            class="confirm-shell"
            role="alertdialog"
            aria-modal="true"
            aria-label="Cancel dispatch confirmation"
            onClick={(event) => event.stopPropagation()}
          >
            <div class="confirm-content">
              <p class="eyebrow">Cancel dispatch</p>
              <h3>Are you sure?</h3>
              <p class="description">
                Cancel dispatch <strong>{this.dispatch.incidentNumber}</strong> for <strong>{this.dispatch.patientName}</strong>. This
                action cannot be undone.
              </p>

              {this.errorMessage ? (
                <div class="feedback-banner" role="alert">
                  {this.errorMessage}
                </div>
              ) : null}

              <div class="modal-actions">
                <md-outlined-button disabled={this.isDeleting} onClick={() => this.closeRequest.emit()}>
                  Keep dispatch
                </md-outlined-button>
                <md-filled-button class="danger-action" disabled={this.isDeleting} onClick={() => this.confirmRequest.emit()}>
                  {this.isDeleting ? 'Cancelling...' : 'Cancel dispatch'}
                </md-filled-button>
              </div>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
