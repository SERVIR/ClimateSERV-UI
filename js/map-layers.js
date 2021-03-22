var globalLayerArray = [
  {
    title: "West Africa eMODIS NDVI",
    url:
      "https://thredds.servirglobal.net/thredds/wms/Agg/emodis-ndvi_westafrica_250m_10dy.nc4?service=WMS&version=1.3.0",
    attribution: "SERVIR THREDDS",
    layers: "ndvi",
    styles: "boxfill/cape_surface",
    colorrange: "0, 1",
    id: "wandvi",
  },
  {
    title: "East Africa eMODIS NDVI",
    url:
      "https://thredds.servirglobal.net/thredds/wms/Agg/emodis-ndvi_eastafrica_250m_10dy.nc4?service=WMS&version=1.3.0",
    attribution: "SERVIR THREDDS",
    layers: "ndvi",
    styles: "boxfill/cape_surface",
    colorrange: "0, 1",
    id: "eandvi",
  },
  {
    title: "South Africa eMODIS NDVI",
    url:
      "https://thredds.servirglobal.net/thredds/wms/Agg/emodis-ndvi_southafrica_250m_10dy.nc4?service=WMS&version=1.3.0",
    attribution: "SERVIR THREDDS",
    layers: "ndvi",
    styles: "boxfill/cape_surface",
    colorrange: "0, 1",
    id: "sandvi",
  },
  {
    title: "Central Asia eMODIS NDVI",
    url:
      "https://thredds.servirglobal.net/thredds/wms/Agg/emodis-ndvi_centralasia_250m_10dy.nc4?service=WMS&version=1.3.0",
    attribution: "SERVIR THREDDS",
    layers: "ndvi",
    styles: "boxfill/cape_surface",
    colorrange: "0, 1",
    id: "candvi",
  },
  {
    title: "Evaporative Stress Index (ESI-4WEEK)",
    url:
      "https://thredds.servirglobal.net/thredds/wms/Agg/sport-esi_global_0.05deg_4wk.nc4?service=WMS&version=1.3.0",
    attribution: "SERVIR THREDDS",
    layers: "esi",
    styles: "boxfill/cape_surface",
    colorrange: "-5, 5",
    id: "esi4w",
  },
  {
    title: "Evaporative Stress Index (ESI-12WEEK)",
    url:
      "https://thredds.servirglobal.net/thredds/wms/Agg/sport-esi_global_0.05deg_12wk.nc4?service=WMS&version=1.3.0",
    attribution: "SERVIR THREDDS",
    layers: "esi",
    styles: "boxfill/cape_surface",
    colorrange: "-5, 5",
    id: "esi12w",
  },
  {
    title: "UCSB CHIRP Rainfall",
    url:
      "https://thredds.servirglobal.net/thredds/wms/Agg/ucsb-chirp_global_0.05deg_daily.nc4?service=WMS&version=1.3.0",
    attribution: "SERVIR THREDDS",
    layers: "precipitation_amount",
    styles: "boxfill/cape_surface",
    colorrange: "1, 50",
    id: "chirpucsb",
  },
  {
    title: "UCSB CHIRPS Rainfall",
    url:
      "https://thredds.servirglobal.net/thredds/wms/Agg/ucsb-chirps_global_0.05deg_daily.nc4?service=WMS&version=1.3.0",
    attribution: "SERVIR THREDDS",
    layers: "precipitation_amount",
    styles: "boxfill/cape_surface",
    colorrange: ".01, 50",
    id: "ucsbchirps",
  },
  {
    title: "UCSB CHIRPS-GEFS Precip",
    url:
      "https://thredds.servirglobal.net/thredds/wms/Agg/ucsb-chirps-gefs_global_0.05deg_10dy.nc4?service=WMS&version=1.3.0",
    attribution: "SERVIR THREDDS",
    layers: "precipitation_amount",
    styles: "boxfill/cape_surface",
    colorrange: ".01, 50",
    id: "chirpsgefs",
  },
  {
    title: "NASA-IMERG-Late 1 Day",
    url:
      "https://thredds.servirglobal.net/thredds/wms/Agg/nasa-imerg-late_global_0.1deg_1dy.nc4?service=WMS&version=1.3.0",
    attribution: "SERVIR THREDDS",
    layers: "precipitation_amount",
    styles: "boxfill/cape_surface",
    colorrange: "0, 20",
    id: "nasaimerglate1day",
  },
  {
    title: "NASA-IMERG-Early 1 Day",
    url:
      "https://thredds.servirglobal.net/thredds/wms/Agg/nasa-imerg-early_global_0.1deg_1dy.nc4?service=WMS&version=1.3.0",
    attribution: "SERVIR THREDDS",
    layers: "precipitation_amount",
    styles: "boxfill/cape_surface",
    colorrange: "0, 20",
    id: "nasaimergearly1day",
  },
];
