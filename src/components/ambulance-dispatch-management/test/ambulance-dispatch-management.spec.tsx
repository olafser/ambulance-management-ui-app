import { newSpecPage } from '@stencil/core/testing';
import { AmbulanceDispatchManagement } from '../ambulance-dispatch-management';

describe('ambulance-dispatch-management', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AmbulanceDispatchManagement],
      html: `<ambulance-dispatch-management></ambulance-dispatch-management>`,
    });
    expect(page.root).toEqualHtml(`
      <ambulance-dispatch-management>
        <mock:shadow-root>
          <h1>Welcome to Ambulance Dispatch Management Module</h1>
        </mock:shadow-root>
      </ambulance-dispatch-management>
    `);
  });
});
