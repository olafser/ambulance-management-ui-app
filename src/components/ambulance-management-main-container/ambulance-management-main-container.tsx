import { Component, Host, Prop, State, h } from '@stencil/core';

declare global {
  interface Window {
    navigation: any;
  }
}

type ActiveView = 'home' | 'paramedic-vehicle-management' | 'ambulance-dispatch-management';

const MODULE_ROOT_SEGMENT = 'ambulance-management';
const KNOWN_CHILD_ROUTES: ReadonlyArray<Exclude<ActiveView, 'home'>> = [
  'paramedic-vehicle-management',
  'ambulance-dispatch-management',
];

const normalizePath = (path: string) => (path !== '/' ? path.replace(/\/+$/, '') : '/');

@Component({
  tag: 'ambulance-management-main-container',
  styleUrl: 'ambulance-management-main-container.css',
  shadow: true,
})
export class AmbulanceManagementMainContainer {
  @Prop() basePath: string = '';

  @State() private relativePath = '';

  private resolvedBasePath = '/';

  private logNavigation(message: string, details: Record<string, unknown> = {}) {
    console.info('[ambulance-management-main-container]', message, {
      basePath: this.basePath,
      documentBaseURI: document.baseURI,
      locationPathname: location.pathname,
      resolvedBasePath: this.resolvedBasePath,
      relativePath: this.relativePath,
      ...details,
    });
  }

  private readonly handleNavigate = (event: Event) => {
    const navigateEvent = event as any;
    if (navigateEvent.canIntercept) {
      navigateEvent.intercept();
    }

    const path = new URL(navigateEvent.destination.url).pathname;
    this.resolvedBasePath = this.resolveBasePath(path);
    this.syncRelativePath(path);
    this.logNavigation('handled navigate event', {
      destinationUrl: navigateEvent.destination?.url,
      intercepted: navigateEvent.canIntercept ?? false,
      syncedPath: path,
    });
  };

  componentWillLoad() {
    this.resolvedBasePath = this.resolveBasePath();
    window.navigation?.addEventListener('navigate', this.handleNavigate);
    this.syncRelativePath(location.pathname);
    this.logNavigation('component will load');
  }

  disconnectedCallback() {
    window.navigation?.removeEventListener('navigate', this.handleNavigate);
  }

  private resolveBasePath(pathname: string = location.pathname) {
    const baseUri = new URL(this.basePath || '/', document.baseURI || '/').pathname;
    const normalizedBasePath = normalizePath(baseUri);

    if (normalizedBasePath !== '/') {
      const inferredBasePath = this.inferBasePath(pathname);
      if (inferredBasePath !== '/' && inferredBasePath.endsWith(normalizedBasePath)) {
        return inferredBasePath;
      }

      return normalizedBasePath;
    }

    return this.inferBasePath(pathname);
  }

  private inferBasePath(pathname: string) {
    const normalizedPath = normalizePath(pathname);
    const pathSegments = normalizedPath.split('/').filter(Boolean);
    const moduleRootIndex = pathSegments.indexOf(MODULE_ROOT_SEGMENT);

    if (moduleRootIndex >= 0) {
      return `/${pathSegments.slice(0, moduleRootIndex + 1).join('/')}`;
    }

    const childRoute = KNOWN_CHILD_ROUTES.find(
      (route) => normalizedPath === `/${route}` || normalizedPath.endsWith(`/${route}`),
    );

    if (!childRoute) {
      return '/';
    }

    const inferredBasePath = normalizedPath.slice(0, -(childRoute.length + 1));
    return inferredBasePath || '/';
  }

  private syncRelativePath(pathname: string) {
    const normalizedPath = normalizePath(pathname);

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
    this.resolvedBasePath = this.resolveBasePath(location.pathname);
    const navigationBasePath = this.resolvedBasePath === '/' ? '/' : `${this.resolvedBasePath}/`;
    const absolutePath = new URL(path, `${window.location.origin}${navigationBasePath}`).pathname;
    window.history.pushState({}, '', absolutePath);
    const popStateEvent =
      typeof PopStateEvent === 'function' ? new PopStateEvent('popstate') : new Event('popstate');
    window.dispatchEvent(popStateEvent);
    this.resolvedBasePath = this.resolveBasePath(absolutePath);
    this.syncRelativePath(absolutePath);
    this.logNavigation('navigate requested', {
      requestedPath: path,
      navigationBasePath,
      absolutePath,
      navigationApiAvailable: Boolean(window.navigation?.navigate),
    });
  }

  private get activeView(): ActiveView {
    switch (this.relativePath.replace(/^\/+/, '')) {
      case KNOWN_CHILD_ROUTES[0]:
        return KNOWN_CHILD_ROUTES[0];
      case KNOWN_CHILD_ROUTES[1]:
        return KNOWN_CHILD_ROUTES[1];
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
      case 'ambulance-dispatch-management':
        return <ambulance-management-ambulance-dispatch-management></ambulance-management-ambulance-dispatch-management>;
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
                'Ambulance Dispatch Management',
                './ambulance-dispatch-management',
                'ambulance-dispatch-management',
              )}
            </div>
          </nav>

          <section class="content">{this.renderContent()}</section>
        </main>
      </Host>
    );
  }
}
