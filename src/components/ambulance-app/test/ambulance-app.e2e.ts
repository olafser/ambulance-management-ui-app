import { newE2EPage } from '@stencil/core/testing';

describe('ambulance-app', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ambulance-app></ambulance-app>');

    const element = await page.find('ambulance-app');
    expect(element).toHaveClass('hydrated');
  });
});
