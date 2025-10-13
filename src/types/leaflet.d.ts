export type LeafletMap = {
  getSize(): { x: number; y: number };
  fitBounds(bounds: unknown, opts: { padding: [number, number]; maxZoom: number }): void;
  setZoom(z: number): void;
  setView(latlng: [number, number], zoom: number): LeafletMap;
  removeLayer(layer: unknown): void;
};

export type TileLayer = {
  addTo(map: LeafletMap): TileLayer;
};

export type ZoomControl = {
  addTo(map: LeafletMap): ZoomControl;
};

export type Marker = {
  addTo(map: LeafletMap): Marker;
  bindTooltip(content: string, opts: Record<string, unknown>): Marker;
  on(event: string, handler: () => void): Marker;
};

export type LayerGroup = {
  addLayer(layer: unknown): void;
  addTo(map: LeafletMap): void;
  clearLayers(): void;
};

export type Leaflet = {
  map(el: HTMLElement, opts?: Record<string, unknown>): LeafletMap;
  tileLayer(url: string, opts: Record<string, unknown>): TileLayer;
  control: { zoom(opts: Record<string, unknown>): ZoomControl };
  layerGroup(): LayerGroup;
  divIcon(opts: Record<string, unknown>): unknown;
  marker(latlng: [number, number], opts: Record<string, unknown>): Marker;
  latLngBounds(coords: [number, number][]): unknown;
  markerClusterGroup?: (opts: {
    showCoverageOnHover: boolean;
    spiderfyOnMaxZoom: boolean;
    disableClusteringAtZoom: number;
    iconCreateFunction: (cluster: { getChildCount(): number }) => unknown;
  }) => LayerGroup;
};

declare global {
  interface Window {
    L?: Leaflet;
  }
}
