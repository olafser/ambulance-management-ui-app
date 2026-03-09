import { newE2EPage } from '@stencil/core/testing';

describe('ambulance-management-main-container', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ambulance-management-main-container></ambulance-management-main-container>');

    const element = await page.find('ambulance-management-main-container');
    expect(element).toHaveClass('hydrated');
  });
});
