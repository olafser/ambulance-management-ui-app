import { newSpecPage } from '@stencil/core/testing';

import { AmbulanceManagementAmbulanceCrewManagement } from '../../ambulance-management-ambulance-crew-management/ambulance-management-ambulance-crew-management';
import { AmbulanceManagementMainContainer } from '../ambulance-management-main-container';
import { AmbulanceManagementParamedicVehicleManagement } from '../../ambulance-management-paramedic-vehicle-management/ambulance-management-paramedic-vehicle-management';

describe('ambulance-management-main-container', () => {
  it('renders the home view by default', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/',
      components: [
        AmbulanceManagementMainContainer,
        AmbulanceManagementParamedicVehicleManagement,
        AmbulanceManagementAmbulanceCrewManagement,
      ],
      html: '<ambulance-management-main-container base-path="/"></ambulance-management-main-container>',
    });

    expect(page.root?.shadowRoot?.textContent).toContain('Choose a section from the navigation bar to continue.');
  });

  it('renders paramedic vehicle management from the route', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/paramedic-vehicle-management',
      components: [
        AmbulanceManagementMainContainer,
        AmbulanceManagementParamedicVehicleManagement,
        AmbulanceManagementAmbulanceCrewManagement,
      ],
      html: '<ambulance-management-main-container base-path="/"></ambulance-management-main-container>',
    });

    const child = page.root?.shadowRoot?.querySelector('ambulance-management-paramedic-vehicle-management');
    expect(child).not.toBeNull();
  });

  it('respects a nested base path for crew management', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/ambulance-management/ambulance-crew-management',
      components: [
        AmbulanceManagementMainContainer,
        AmbulanceManagementParamedicVehicleManagement,
        AmbulanceManagementAmbulanceCrewManagement,
      ],
      html: '<ambulance-management-main-container base-path="/ambulance-management/"></ambulance-management-main-container>',
    });

    const child = page.root?.shadowRoot?.querySelector('ambulance-management-ambulance-crew-management');
    expect(child).not.toBeNull();
  });
});
