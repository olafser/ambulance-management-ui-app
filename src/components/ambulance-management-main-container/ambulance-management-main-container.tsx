import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ambulance-management-main-container',
  styleUrl: 'ambulance-management-main-container.css',
  shadow: true,
})
export class AmbulanceManagementMainContainer {
  render() {
    return (
      <Host>
        <h1 class="main-title">Welcome to Ambulance Management Module</h1>
      </Host>
    );
  }
}
