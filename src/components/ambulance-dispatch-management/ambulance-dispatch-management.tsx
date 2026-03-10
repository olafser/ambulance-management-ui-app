import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ambulance-dispatch-management',
  styleUrl: 'ambulance-dispatch-management.css',
  shadow: true,
})
export class AmbulanceDispatchManagement {
  render() {
    return (
      <Host>
        <h1>Welcome to Ambulance Dispatch Management Module</h1>
      </Host>
    );
  }
}
