import { newE2EPage } from '@stencil/core/testing';

describe('ambulance-management-main-container', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.evaluateOnNewDocument(() => {
      const realFetch = window.fetch.bind(window);

      window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

        if (url.endsWith('/api/vehicles') || url.endsWith('/api/dispatches')) {
          return Promise.resolve(
            new Response('[]', {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
              },
            }),
          );
        }

        return realFetch(input, init);
      };
    });

    await page.setContent('<ambulance-management-main-container></ambulance-management-main-container>');

    const element = await page.find('ambulance-management-main-container');
    expect(element).toHaveClass('hydrated');
  });
});
