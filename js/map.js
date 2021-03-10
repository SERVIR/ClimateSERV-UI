$(function () {
  $("ol.layers").sortable({
    group: "simple_with_animation",
    pullPlaceholder: true,
    placeholder: "<hr />",
    // animation on drop
    onDrop: function ($item, container, _super) {
      var $clonedItem = $("<li/>").css({ height: 0 });
      $item.before($clonedItem);
      $clonedItem.animate({ height: $item.height() });

      $clonedItem.detach();
      _super($item, container);
    },

    // set $item relative to cursor position
    onDragStart: function ($item, container, _super) {
      var offset = $item.offset(),
        pointer = container.rootGroup.pointer;

      adjustment = {
        left: pointer.left - offset.left,
        top: pointer.top - offset.top,
      };

      _super($item, container);
    },
    onDrag: function ($item, position) {
      $item.css({
        left: position.left - adjustment.left,
        top: position.top - adjustment.top,
      });
    },
  });
});
var map = L.map("servirmap", {
  zoom: 5,
  fullscreenControl: true,
  timeDimension: true,
  timeDimensionControl: true,
  center: [38.0, 15.0],
});

var imerg =
  "https://thredds.servirglobal.net/thredds/wms/Agg/nasa-imerg-late_global_0.1deg_30min.nc4?service=WMS&version=1.3.0&crs=EPSG%3A3857";

var imergLayer = L.tileLayer.wms(imerg, {
  layers: "precipitation_amount",
  format: "image/png",
  transparent: true,
  colorscalerange: "-0.4,0.4",
  abovemaxcolor: "extend",
  belowmincolor: "extend",
  numcolorbands: 100,
  styles: "boxfill/rainbow",
});

var imergTimeLayer = L.timeDimension.layer.wms(imergLayer, {
  updateTimeDimension: true,
});

// Legends
var heigthLegend = L.control({
  position: "bottomright",
});
heigthLegend.onAdd = function (map) {
  var src =
    ndvi +
    "?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&LAYER=adt&colorscalerange=-0.4,0.4&PALETTE=rainbow&transparent=TRUE";
  var div = L.DomUtil.create("div", "info legend");
  div.innerHTML += '<img src="' + src + '" alt="legend">';
  return div;
};

var overlayMaps = {
  IMERG: imergTimeLayer,
};

map.on("layeradd", function (eventLayer) {
  console.log("added");
  console.log(eventLayer.name);
  if (eventLayer.name == "AVISO - Sea surface height above geoid") {
    heigthLegend.addTo(this);
  } else if (
    eventLayer.name == "AVISO - Surface geostrophic sea water velocity"
  ) {
    velocityLegend.addTo(this);
  }
});

map.on("overlayadd", function (eventLayer) {
  console.log("added over");
  console.log(eventLayer.name);
});

map.on("add", function (eventLayer) {
  console.log("add");
  console.log(eventLayer);
});

map.on("layerremove", function (eventLayer) {
  console.log("layerremove");
});

map.on("baselayerchange", function (eventLayer) {
  console.log("baselayerchange");
  console.log(eventLayer.name);
});

map.on("overlayremove", function (eventLayer) {
  console.log("overlayremove");
  if (eventLayer.name == "AVISO - Sea surface height above geoid") {
    map.removeControl(heigthLegend);
  } else if (
    eventLayer.name == "AVISO - Surface geostrophic sea water velocity"
  ) {
    map.removeControl(velocityLegend);
  }
});

var baseLayers = getCommonBaseLayers(map); // see baselayers.js
L.control.layers(baseLayers, overlayMaps).addTo(map);
var sidebar = L.control.sidebar("sidebar").addTo(map);

imergTimeLayer.addTo(map);
var visible = true;
function toggleLayer(which) {
  visible = !visible;
  if (visible) {
    which.addTo(map);
  } else {
    map.removeLayer(which);
  }
}
