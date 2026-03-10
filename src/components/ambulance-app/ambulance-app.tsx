import { Component, Host, Prop, State, h } from '@stencil/core';

declare global {
  interface Window { navigation: any; }
}

@Component({
  tag: 'ambulance-app',
  styleUrl: 'ambulance-app.css',
  shadow: true,
})
export class AmbulanceApp {
  @State() private relativePath = '';

  @Prop() basePath: string = '';

  componentWillLoad() {
    const baseUri = new URL(this.basePath, document.baseURI || '/').pathname;

    const toRelative = (path: string) => {
      if (path.startsWith(baseUri)) {
        this.relativePath = path.slice(baseUri.length).replace(/^\/+/, '');
      } else {
        this.relativePath = '';
      }
    };

    window.navigation?.addEventListener('navigate', (ev: Event) => {
      if ((ev as any).canIntercept) { (ev as any).intercept(); }
      const path = new URL((ev as any).destination.url).pathname;
      toRelative(path);
    });

    toRelative(location.pathname);
  }

  render() {
    const navigate = (path: string) => {
      const absolute = new URL(path, new URL(this.basePath, document.baseURI)).pathname;
      window.navigation.navigate(absolute);
    };

    const isManagementRoute = this.relativePath === 'management';
    const isDispatchRoute = this.relativePath === 'dispatch';

    return (
      <Host>
        <main class="app-shell">
          <section class="route-picker">
            <h1>Ambulance App</h1>
            <p>Select the module you want to open.</p>
            <div class="actions">
              <button type="button" onClick={() => navigate('management')}>
                Open Ambulance Management
              </button>
              <button type="button" onClick={() => navigate('dispatch')}>
                Open Dispatch Management
              </button>
            </div>
          </section>

          <section class="route-content">
            {isManagementRoute && <ambulance-management-main-container></ambulance-management-main-container>}
            {isDispatchRoute && <ambulance-dispatch-management></ambulance-dispatch-management>}
          </section>
        </main>
      </Host>
    );
  }
}
