import { Component, Host, Prop, State, h } from '@stencil/core';

import { listVehicles, getApiErrorMessage } from '../../api/ambulance-management/client';
import { listDispatches } from '../../api/ambulance-management/dispatch-client';
import { isHistoricalDispatch, type DispatchRecord } from '../../types/dispatch';
import { VEHICLE_STATUS_LABELS, type VehicleRecord, type VehicleStatus } from '../../types/vehicle';

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
  @Prop() apiBase: string = '';

  @State() private relativePath = '';
  @State() private overviewVehicles: VehicleRecord[] = [];
  @State() private overviewDispatches: DispatchRecord[] = [];
  @State() private isOverviewLoading = true;
  @State() private overviewError = '';

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

  private readonly handleNavigate = async (event: Event) => {
    const navigateEvent = event as any;
    if (navigateEvent.canIntercept) {
      navigateEvent.intercept();
    }

    const path = new URL(navigateEvent.destination.url).pathname;
    this.resolvedBasePath = this.resolveBasePath(path);
    this.syncRelativePath(path);
    if (this.activeView === 'home') {
      await this.loadOverview();
    }
    this.logNavigation('handled navigate event', {
      destinationUrl: navigateEvent.destination?.url,
      intercepted: navigateEvent.canIntercept ?? false,
      syncedPath: path,
    });
  };

  async componentWillLoad() {
    this.resolvedBasePath = this.resolveBasePath();
    window.navigation?.addEventListener('navigate', this.handleNavigate);
    this.syncRelativePath(location.pathname);
    await this.loadOverview();
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
    if (this.activeView === 'home') {
      void this.loadOverview();
    }
    this.logNavigation('navigate requested', {
      requestedPath: path,
      navigationBasePath,
      absolutePath,
      navigationApiAvailable: Boolean(window.navigation?.navigate),
    });
  }

  private async loadOverview() {
    this.isOverviewLoading = true;
    this.overviewError = '';

    try {
      const [vehicles, dispatches] = await Promise.all([listVehicles(this.apiBase), listDispatches(this.apiBase)]);
      this.overviewVehicles = vehicles;
      this.overviewDispatches = dispatches;
    } catch (error) {
      this.overviewError = await getApiErrorMessage(error, 'Unable to load home summary.');
    } finally {
      this.isOverviewLoading = false;
    }
  }

  private get vehicleStatusCounts() {
    return this.overviewVehicles.reduce<Record<VehicleStatus, number>>(
      (counts, vehicle) => {
        counts[vehicle.status] += 1;
        return counts;
      },
      {
        AVAILABLE: 0,
        ON_MISSION: 0,
        OUT_OF_SERVICE: 0,
        IN_SERVICE: 0,
      },
    );
  }

  private get activeDispatchCount() {
    return this.overviewDispatches.filter((dispatch) => !isHistoricalDispatch(dispatch)).length;
  }

  private get historicalDispatchCount() {
    return this.overviewDispatches.filter((dispatch) => isHistoricalDispatch(dispatch)).length;
  }

  private renderOverviewMetric(label: string, value: string, tone: 'neutral' | 'accent' = 'neutral') {
    return (
      <article class={{ 'overview-metric': true, accent: tone === 'accent' }}>
        <span class="overview-metric-label">{label}</span>
        <strong class="overview-metric-value">{value}</strong>
      </article>
    );
  }

  private renderStatusChip(label: string, value: number) {
    return <md-suggestion-chip label={`${label}: ${value}`}></md-suggestion-chip>;
  }

  private renderOverview() {
    return (
      <section class="overview">
        <div class="overview-hero">
          <div class="overview-copy">
            <p class="overview-label">Operations dashboard</p>
            <h1 class="overview-title">Ambulance Management</h1>
            <p class="overview-text">
              Review the current fleet snapshot, see dispatch activity, and jump directly into the operational modules.
            </p>
          </div>

          <div class="overview-actions">
            <md-filled-tonal-button onClick={() => this.navigate('./paramedic-vehicle-management')}>
              <md-icon slot="icon">local_shipping</md-icon>
              Vehicle management
            </md-filled-tonal-button>
            <md-outlined-button onClick={() => this.navigate('./ambulance-dispatch-management')}>
              <md-icon slot="icon">emergency</md-icon>
              Dispatch management
            </md-outlined-button>
          </div>
        </div>

        {this.isOverviewLoading ? <md-linear-progress indeterminate></md-linear-progress> : null}

        {this.overviewError ? (
          <div class="overview-feedback" role="alert">
            <span>{this.overviewError}</span>
            <md-outlined-button onClick={() => this.loadOverview()}>
              <md-icon slot="icon">refresh</md-icon>
              Retry
            </md-outlined-button>
          </div>
        ) : null}

        <div class="overview-grid">
          <section class="overview-panel vehicle-panel">
            <div class="panel-header">
              <div>
                <p class="panel-label">Module 01</p>
                <h2>Paramedic Vehicle Management</h2>
                <p class="panel-copy">Monitor fleet readiness, availability, and operational state across the ambulance pool.</p>
              </div>
              <md-filled-tonal-button onClick={() => this.navigate('./paramedic-vehicle-management')}>
                <md-icon slot="icon">local_shipping</md-icon>
                Open vehicle management
              </md-filled-tonal-button>
            </div>

            <div class="metric-grid">
              {this.renderOverviewMetric('Total vehicles', String(this.overviewVehicles.length), 'accent')}
              {this.renderOverviewMetric('Available', String(this.vehicleStatusCounts.AVAILABLE))}
              {this.renderOverviewMetric('On mission', String(this.vehicleStatusCounts.ON_MISSION))}
              {this.renderOverviewMetric('In service', String(this.vehicleStatusCounts.IN_SERVICE))}
              {this.renderOverviewMetric('Out of service', String(this.vehicleStatusCounts.OUT_OF_SERVICE))}
            </div>

            <div class="status-list">
              {(['AVAILABLE', 'ON_MISSION', 'IN_SERVICE', 'OUT_OF_SERVICE'] as VehicleStatus[]).map((status) =>
                this.renderStatusChip(VEHICLE_STATUS_LABELS[status], this.vehicleStatusCounts[status]),
              )}
            </div>
          </section>

          <section class="overview-panel dispatch-panel">
            <div class="panel-header">
              <div>
                <p class="panel-label">Module 02</p>
                <h2>Ambulance Dispatch Management</h2>
                <p class="panel-copy">Track current interventions, completed missions, and operational dispatch workload in one place.</p>
              </div>
              <md-outlined-button onClick={() => this.navigate('./ambulance-dispatch-management')}>
                <md-icon slot="icon">emergency</md-icon>
                Open dispatch management
              </md-outlined-button>
            </div>

            <div class="metric-grid">
              {this.renderOverviewMetric('Total dispatches', String(this.overviewDispatches.length), 'accent')}
              {this.renderOverviewMetric('Active dispatches', String(this.activeDispatchCount))}
              {this.renderOverviewMetric('Historical dispatches', String(this.historicalDispatchCount))}
            </div>

            <div class="summary-copy">
              <p>
                Use the vehicle module to manage fleet readiness and the dispatch module to track interventions from accepted call
                through completion.
              </p>
            </div>
          </section>
        </div>
      </section>
    );
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
        return <ambulance-management-paramedic-vehicle-management api-base={this.apiBase}></ambulance-management-paramedic-vehicle-management>;
      case 'ambulance-dispatch-management':
        return <ambulance-management-ambulance-dispatch-management api-base={this.apiBase}></ambulance-management-ambulance-dispatch-management>;
      default:
        return this.renderOverview();
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
