import { newE2EPage } from '@stencil/core/testing';

describe('ambulance-dispatch-management', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ambulance-dispatch-management></ambulance-dispatch-management>');

    const element = await page.find('ambulance-dispatch-management');
    expect(element).toHaveClass('hydrated');
  });
});
