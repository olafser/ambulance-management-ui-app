import { newSpecPage } from '@stencil/core/testing';
import { AmbulanceManagementMainContainer } from '../ambulance-management-main-container';

describe('ambulance-management-main-container', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AmbulanceManagementMainContainer],
      html: `<ambulance-management-main-container></ambulance-management-main-container>`,
    });

    const wlList = page.rootInstance as AmbulanceManagementMainContainer;
    const expectedPatients = wlList?.waitingPatients?.length

    const items = page.root.shadowRoot.querySelectorAll("md-list-item");
    expect(items.length).toEqual(expectedPatients);
  });
});
