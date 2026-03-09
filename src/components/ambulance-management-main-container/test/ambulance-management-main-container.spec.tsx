import { newSpecPage } from '@stencil/core/testing';
import { AmbulanceManagementMainContainer } from '../ambulance-management-main-container';

describe('ambulance-management-main-container', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AmbulanceManagementMainContainer],
      html: `<ambulance-management-main-container></ambulance-management-main-container>`,
    });
    expect(page.root).toEqualHtml(`
      <ambulance-management-main-container>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ambulance-management-main-container>
    `);
  });
});
