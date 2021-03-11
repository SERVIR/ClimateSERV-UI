/*
 *    Return common layers used in different examples
 */
function getCommonBaseLayers(map) {
  var osmLayer = L.tileLayer("https://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
    thumb: "img/osm.png",
    displayName: "OSM",
  });
  var bathymetryLayer = L.tileLayer.wms(
    "https://ows.emodnet-bathymetry.eu/wms",
    {
      layers: "emodnet:mean_atlas_land",
      format: "image/png",
      transparent: true,
      attribution: "EMODnet Bathymetry",
      opacity: 0.8,
    }
  );
  var coastlinesLayer = L.tileLayer.wms(
    "https://ows.emodnet-bathymetry.eu/wms",
    {
      layers: "coastlines",
      format: "image/png",
      transparent: true,
      attribution: "EMODnet Bathymetry",
      opacity: 0.8,
    }
  );
  var bathymetryGroupLayer = L.layerGroup([bathymetryLayer, coastlinesLayer]);
  bathymetryGroupLayer.options.thumb = "img/bath.png";
  bathymetryGroupLayer.options.displayName = "Bathymetry";
  osmLayer.addTo(map);

  var topoLayer = L.tileLayer.wms(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    {
      format: "image/png",
      transparent: true,
      attribution:
        'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
        'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
      opacity: 1,
      thumb: "img/topo.png",
      displayName: "Topo",
    }
  );

  var satLayer = L.tileLayer.wms(
    "https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    {
      format: "image/png",
      transparent: true,
      attribution:
        'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
        'rest/services/Reference/World_Boundaries_and_Places/MapServer">ArcGIS</a>',
      opacity: 1,
    }
  );

  var labelLayer = L.tileLayer.wms(
    "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      format: "image/png",
      transparent: true,
      attribution:
        'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
        'rest/services/Reference/World_Imagery/MapServer">ArcGIS</a>',
      opacity: 1,
    }
  );

  var satGroupLayer = L.layerGroup([labelLayer, satLayer]);
  satGroupLayer.options.thumb = "img/satellite.png";
  satGroupLayer.options.displayName = "Satellite";

  var terrainLayer = L.tileLayer(
    "http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png",
    {
      format: "image/png",
      transparent: true,
      subdomains: ["a", "b", "c", "d"],
      attribution:
        'Map tiles by <a href="http://stamen.com/">Stamen Design</a>',
      opacity: 1,
      thumb: "img/terrain.png",
      displayName: "Terrain",
    }
  );

  var deLormeLayer = L.tileLayer.wms(
    "https://server.arcgisonline.com/arcgis/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}",
    {
      format: "image/png",
      transparent: true,
      attribution:
        'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
        'rest/services/Reference/Specialty/DeLorme_World_Base_Map/MapServer">ArcGIS</a>',
      opacity: 1,
      thumb: "img/delorme.png",
      displayName: "DeLorme",
    }
  );

  return {
    OSM: osmLayer,
    Satellite: satGroupLayer,
    Topo: topoLayer,
    Terrain: terrainLayer,
    "EMODnet Bathymetry": bathymetryGroupLayer,
    DeLorme: deLormeLayer,
  };
}
