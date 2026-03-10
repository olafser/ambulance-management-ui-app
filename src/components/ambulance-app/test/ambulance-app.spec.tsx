import { newSpecPage } from '@stencil/core/testing';
import { AmbulanceApp } from '../ambulance-app';

describe('ambulance-app', () => {
  it('renders route selector by default', async () => {
    const page = await newSpecPage({
      components: [AmbulanceApp],
      html: `<ambulance-app></ambulance-app>`,
    });

    expect(page.root).toEqualHtml(`
      <ambulance-app>
        <mock:shadow-root>
          <main class="app-shell">
            <section class="route-picker">
              <h1>Ambulance App</h1>
              <p>Select the module you want to open.</p>
              <div class="actions">
                <button type="button">
                  Open Ambulance Management
                </button>
                <button type="button">
                  Open Dispatch Management
                </button>
              </div>
            </section>
            <section class="route-content"></section>
          </main>
        </mock:shadow-root>
      </ambulance-app>
    `);
  });
});
