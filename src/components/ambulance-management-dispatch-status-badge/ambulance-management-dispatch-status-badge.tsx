import { Component, Host, Prop, h } from '@stencil/core';

import { DISPATCH_STATUS_LABELS, type DispatchStatus } from '../../types/dispatch';

@Component({
  tag: 'ambulance-management-dispatch-status-badge',
  styleUrl: 'ambulance-management-dispatch-status-badge.css',
  shadow: true,
})
export class AmbulanceManagementDispatchStatusBadge {
  @Prop() status!: DispatchStatus;

  render() {
    if (!this.status) {
      return null;
    }

    return (
      <Host>
        <span class={{ badge: true, [`status-${this.status.toLowerCase().replace(/_/g, '-')}`]: true }}>
          {DISPATCH_STATUS_LABELS[this.status]}
        </span>
      </Host>
    );
  }
}
