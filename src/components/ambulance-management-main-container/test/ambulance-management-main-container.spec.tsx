import { newSpecPage } from '@stencil/core/testing';

import { AmbulanceManagementAmbulanceDispatchManagement } from '../../ambulance-management-ambulance-dispatch-management/ambulance-management-ambulance-dispatch-management';
import { AmbulanceManagementMainContainer } from '../ambulance-management-main-container';
import { AmbulanceManagementParamedicVehicleManagement } from '../../ambulance-management-paramedic-vehicle-management/ambulance-management-paramedic-vehicle-management';

describe('ambulance-management-main-container', () => {
  it('renders the home view by default', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/ambulance-management',
      components: [
        AmbulanceManagementMainContainer,
        AmbulanceManagementParamedicVehicleManagement,
        AmbulanceManagementAmbulanceDispatchManagement,
      ],
      html: '<ambulance-management-main-container base-path="/ambulance-management/"></ambulance-management-main-container>',
    });

    expect(page.root?.shadowRoot?.textContent).toContain('Choose a section from the navigation bar to continue.');
  });

  it('renders paramedic vehicle management from the route', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/ambulance-management/paramedic-vehicle-management',
      components: [
        AmbulanceManagementMainContainer,
        AmbulanceManagementParamedicVehicleManagement,
        AmbulanceManagementAmbulanceDispatchManagement,
      ],
      html: '<ambulance-management-main-container base-path="/ambulance-management/"></ambulance-management-main-container>',
    });

    const child = page.root?.shadowRoot?.querySelector('ambulance-management-paramedic-vehicle-management');
    expect(child).not.toBeNull();
  });

  it('respects a nested base path for dispatch management', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/ambulance-management/ambulance-dispatch-management',
      components: [
        AmbulanceManagementMainContainer,
        AmbulanceManagementParamedicVehicleManagement,
        AmbulanceManagementAmbulanceDispatchManagement,
      ],
      html: '<ambulance-management-main-container base-path="/ambulance-management/"></ambulance-management-main-container>',
    });

    const child = page.root?.shadowRoot?.querySelector('ambulance-management-ambulance-dispatch-management');
    expect(child).not.toBeNull();
  });

  it('infers the module base path when mounted below a host route', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/fea/ambulance-management/paramedic-vehicle-management',
      components: [
        AmbulanceManagementMainContainer,
        AmbulanceManagementParamedicVehicleManagement,
        AmbulanceManagementAmbulanceDispatchManagement,
      ],
      html: '<ambulance-management-main-container></ambulance-management-main-container>',
    });

    const child = page.root?.shadowRoot?.querySelector('ambulance-management-paramedic-vehicle-management');
    expect(child).not.toBeNull();
    expect((page.rootInstance as any).resolvedBasePath).toBe('/fea/ambulance-management');
  });

  it('keeps navigation inside the inferred module base path', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/fea/ambulance-management',
      components: [
        AmbulanceManagementMainContainer,
        AmbulanceManagementParamedicVehicleManagement,
        AmbulanceManagementAmbulanceDispatchManagement,
      ],
      html: '<ambulance-management-main-container></ambulance-management-main-container>',
    });

    const pushStateSpy = jest.spyOn(window.history, 'pushState');

    (page.rootInstance as any).navigate('./ambulance-dispatch-management');

    expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/fea/ambulance-management/ambulance-dispatch-management');
  });

  it('keeps the host route prefix when base-path points to the module root', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/fea/ambulance-management',
      components: [
        AmbulanceManagementMainContainer,
        AmbulanceManagementParamedicVehicleManagement,
        AmbulanceManagementAmbulanceDispatchManagement,
      ],
      html: '<ambulance-management-main-container base-path="/ambulance-management/"></ambulance-management-main-container>',
    });

    const pushStateSpy = jest.spyOn(window.history, 'pushState');

    (page.rootInstance as any).navigate('./paramedic-vehicle-management');

    expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/fea/ambulance-management/paramedic-vehicle-management');
  });
});
