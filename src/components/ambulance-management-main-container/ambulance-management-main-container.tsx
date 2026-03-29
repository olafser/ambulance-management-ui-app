import { Component, Host, Prop, State, h } from '@stencil/core';

declare global {
  interface Window {
    navigation: any;
  }
}

type ActiveView = 'home' | 'paramedic-vehicle-management' | 'ambulance-crew-management';

@Component({
  tag: 'ambulance-management-main-container',
  styleUrl: 'ambulance-management-main-container.css',
  shadow: true,
})
export class AmbulanceManagementMainContainer {
  @Prop() basePath: string = '/';

  @State() private relativePath = '';

  private resolvedBasePath = '/';

  private readonly handleNavigate = (event: Event) => {
    const navigateEvent = event as any;
    if (navigateEvent.canIntercept) {
      navigateEvent.intercept();
    }

    const path = new URL(navigateEvent.destination.url).pathname;
    this.syncRelativePath(path);
  };

  componentWillLoad() {
    const baseUri = new URL(this.basePath || '/', document.baseURI || '/').pathname;
    this.resolvedBasePath = baseUri !== '/' ? baseUri.replace(/\/+$/, '') : '/';

    window.navigation?.addEventListener('navigate', this.handleNavigate);
    this.syncRelativePath(location.pathname);
  }

  disconnectedCallback() {
    window.navigation?.removeEventListener('navigate', this.handleNavigate);
  }

  private syncRelativePath(pathname: string) {
    const normalizedPath = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';

    if (this.resolvedBasePath === '/') {
      this.relativePath = normalizedPath === '/' ? '' : normalizedPath.replace(/^\/+/, '');
      return;
    }

    if (normalizedPath === this.resolvedBasePath) {
      this.relativePath = '';
      return;
    }

    const prefix = `${this.resolvedBasePath}/`;
    if (normalizedPath.startsWith(prefix)) {
      this.relativePath = normalizedPath.slice(prefix.length);
      return;
    }

    this.relativePath = '';
  }

  private navigate(path: string) {
    const absolutePath = new URL(path, new URL(this.basePath || '/', document.baseURI)).pathname;

    if (window.navigation?.navigate) {
      window.navigation.navigate(absolutePath);
      return;
    }

    window.history.pushState({}, '', absolutePath);
    this.syncRelativePath(absolutePath);
  }

  private get activeView(): ActiveView {
    switch (this.relativePath.replace(/^\/+/, '')) {
      case 'paramedic-vehicle-management':
        return 'paramedic-vehicle-management';
      case 'ambulance-crew-management':
        return 'ambulance-crew-management';
      default:
        return 'home';
    }
  }

  private renderNavigationButton(label: string, target: string, view: ActiveView) {
    const isActive = this.activeView === view;

    return (
      <button
        class={{ 'nav-link': true, active: isActive }}
        type="button"
        aria-current={isActive ? 'page' : undefined}
        onClick={() => {
          if (!isActive) {
            this.navigate(target);
          }
        }}
      >
        {label}
      </button>
    );
  }

  private renderContent() {
    switch (this.activeView) {
      case 'paramedic-vehicle-management':
        return <ambulance-management-paramedic-vehicle-management></ambulance-management-paramedic-vehicle-management>;
      case 'ambulance-crew-management':
        return <ambulance-management-ambulance-crew-management></ambulance-management-ambulance-crew-management>;
      default:
        return (
          <section class="overview">
            <h1 class="overview-title">Ambulance Management</h1>
            <p class="overview-text">Choose a section from the navigation bar to continue.</p>
          </section>
        );
    }
  }

  render() {
    return (
      <Host>
        <main class="shell">
          <nav class="navigation" aria-label="Module navigation">
            <div class="nav-center">
              {this.renderNavigationButton('Home', './', 'home')}
              {this.renderNavigationButton(
                'Paramedic Vehicle Management',
                './paramedic-vehicle-management',
                'paramedic-vehicle-management',
              )}
              {this.renderNavigationButton(
                'Ambulance Crew Management',
                './ambulance-crew-management',
                'ambulance-crew-management',
              )}
            </div>
          </nav>

          <section class="content">{this.renderContent()}</section>
        </main>
      </Host>
    );
  }
}
