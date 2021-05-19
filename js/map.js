/** Global Variables */
var active_basemap = "OSM";
var map;
var overlayMaps = {};
var adminLayer;
var adminHighlightLayer;
var highlightedIDs = [];
var uploadLayer;
var baseLayers;
var drawnItems;
var drawtoolbar;
var styleOptions = [];

function getLayerHtml(item) {
  return $("#layersTemplate:first")
    .clone()
    .html()
    .replaceAll("{title}", item.title)
    .replaceAll("{id}", item.id)
    .replaceAll("{layername}", item.id + "TimeLayer");
}

function createLayer(item, index) {
  // Add to layer manager
  $("#layer-list").append(getLayerHtml(item));
  // Create actual layer and put in overlayMaps
  var key = (overlayMaps[item.id + "TimeLayer"] = L.timeDimension.layer.wms(
    L.tileLayer.wms(item.url + "&crs=EPSG%3A3857", {
      layers: item.layers,
      format: "image/png",
      transparent: true,
      colorscalerange: item.colorrange,
      abovemaxcolor: "transparent",
      belowmincolor: "transparent",
      numcolorbands: 100,
      styles: item.styles,
    }),
    {
      updateTimeDimension: true,
    }
  ));
  overlayMaps[item.id + "TimeLayer"].id = item.id;
}

function getLayer(which) {
  return globalLayerArray.find(
    (item) => item.id === which.replace("TimeLayer", "")
  );
}

//function reorderLayers(e, b) {
//    console.log('e: ' + e);
//    console.log('b: ' + b);
//}

function buildStyles() {
  $.get(globalLayerArray[0].url + "&request=GetCapabilities", function (xml) {
    var jsonObj = $.xml2json(xml);
    var styles =
      jsonObj["#document"].WMS_Capabilities.Capability.Layer.Layer.Layer.Style;

    for (i = 0; i < styles.length; i++) {
      styleOptions.push({
        val: styles[i].Name,
        text: styles[i].Name,
      });
    }
  });
}

function openSettings(which) {
  var active_layer = getLayer(which);

  var settingsHtml = "";
  if (active_layer.dataset == "model") {
    // need to get available ensembles then
    // add checkboxes for each to enable turning on and off
    // will likely have to adjust the apply button as well since
    // it currently works on overlayMaps[which]

    settingsHtml += "Get the Ens info to build the checkboxes";
  }

  settingsHtml += baseSettingsHtml();

  $("#dialog").html(settingsHtml);
  $("#dialog").dialog({
    title: "Settings",
    resizable: { handles: "se" },
    width: "auto",
    height: "auto",
  });
  $(".ui-dialog-title").attr("title", "Settings");
  $(styleOptions).each(function () {
    $("#style_table").append(
      $("<option>").attr("value", this.val).text(this.text)
    );
  });

  $("#style_table").val(overlayMaps[which]._baseLayer.wmsParams.styles);

  var slider = document.getElementById("opacityctrl");
  slider.value = overlayMaps[which].options.opacity;
  slider.oninput = function () {
    console.log(
      "Handler for .change() called on Layer: " + which + " " + this.value
    );
    overlayMaps[which].setOpacity(this.value);
  };

  var applyStylebtn = document.getElementById("applyStylebtn");

  applyStylebtn.onclick = function () {
    if (map.hasLayer(overlayMaps[which])) {
      map.removeLayer(overlayMaps[which]);
    }
    overlayMaps[which] = L.timeDimension.layer.wms(
      L.tileLayer.wms(active_layer.url + "&crs=EPSG%3A3857", {
        layers: active_layer.layers,
        format: "image/png",
        transparent: true,
        colorscalerange:
          document.getElementById("range-min").value +
          "," +
          document.getElementById("range-max").value,
        abovemaxcolor: "transparent",
        belowmincolor: "transparent",
        numcolorbands: 100,
        styles: $("#style_table").val(),
      }),
      {
        updateTimeDimension: true,
      }
    );
    map.addLayer(overlayMaps[which]);
    document.getElementById(which.replace("TimeLayer", "")).checked = true;
  };
  // Update min/max
  document.getElementById("range-min").value =
    overlayMaps[which]._baseLayer.options.colorscalerange.split(",")[0];
  document.getElementById("range-max").value =
    overlayMaps[which]._baseLayer.options.colorscalerange.split(",")[1];
}
var kickout;
function baseSettingsHtml(which) {
  var replica = $("#styletemplate:first").clone();
  return replica.html();
}

function openLegend(which) {
  //fix this, it's not getting the new style if the user changes, it's getting the default
  var active_layer = getLayer(which);
  var src =
    active_layer.url +
    "&REQUEST=GetLegendGraphic&LAYER=" +
    active_layer.layers +
    "&colorscalerange=" +
    active_layer.colorrange +
    "&PALETTE=" +
    active_layer.styles;
  $("#dialog").html(
    '<p style="text-align:center;"><img src="' + src + '" alt="legend"></p>'
  );
  $("#dialog").dialog({
    title: active_layer.title,
    resizable: { handles: "se" },
    width: 169,
    height: 322,
  });
  $(".ui-dialog-title").attr("title", active_layer.title);
}

function mapSetup() {
  map = L.map("servirmap", {
    zoom: 5,
    fullscreenControl: true,
    timeDimension: true,
    timeDimensionControl: true,
    center: [38.0, 15.0],
  });

  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);
  baseLayers = getCommonBaseLayers(map); // use baselayers.js to add, remove, or edit
  L.control.layers(baseLayers, overlayMaps).addTo(map);
  L.control.sidebar("sidebar").addTo(map);

  //create the basemap thumbnails in the panel
  for (var key of Object.keys(baseLayers)) {
    var img = $("<img>");
    img.attr("src", baseLayers[key].options.thumb);
    img.addClass("basemapbtn");
    img.attr("alt", baseLayers[key].options.displayName);
    img.attr("title", baseLayers[key].options.displayName);
    img.attr("datavalue", key);
    img.on("click", function (e) {
      handleBaseMapSwitch($(this)[0].getAttribute("datavalue"));
    });
    img.appendTo("#basemap");
  }
}
/**
 *
 * @param {string} [which] The Key of the basemap
 *
 */
function handleBaseMapSwitch(which) {
  map.removeLayer(baseLayers[active_basemap]);
  active_basemap = which;
  baseLayers[active_basemap].addTo(map);
}

/**
 *
 * @param {string} which The id of the layer to toggle
 */
function toggleLayer(which) {
  if ($("#dialog").dialog()) {
    $("#dialog").dialog("close");
  }
  if (map.hasLayer(overlayMaps[which])) {
    map.removeLayer(overlayMaps[which]);
  } else {
    map.addLayer(overlayMaps[which]);
  }
}

function selectAOI(which) {
  $(".selectAOI").hide();
  $("#" + which + "AOI").show();

  clearAOISelections();

    if (which === "draw") {
        enableDrawing();
    } else if (which === "upload") {
        enableUpload();
    }
}
function clearAOISelections() {
  if (drawtoolbar) {
    drawtoolbar.remove();
  }

  map.off("click");
  if (adminLayer) {
    adminLayer.remove();
  }
  if (adminHighlightLayer) {
    adminHighlightLayer.remove();
  }

  highlightedIDs = [];
  if (drawnItems) {
    drawnItems.clearLayers();
    }
    if (uploadLayer) {
        uploadLayer.remove();
    }
}

var hfile;

var shpdata;

function enableUpload() {

    uploadLayer = L.geoJson().addTo(map);

    var targetEl = document.getElementById("drop-container");
    targetEl.addEventListener('dragenter', function (e) { e.preventDefault(); });
    targetEl.addEventListener('dragover', function (e) { e.preventDefault(); });

    targetEl.addEventListener('drop', function (e) {
        e.preventDefault();
        var reader = new FileReader();
        reader.onloadend = function () {
            var data = JSON.parse(this.result);
            dropped(data);
        };
        console.log("1");
        var files = e.target.files || e.dataTransfer.files;
        console.log("2");
        console.log(files.length);
        for (var i = 0, file; file = files[i]; i++) {
            hfile = file;
            console.log(file.type);
            if (file.type === "application/json") {
                reader.readAsText(file);
            } else if (file.name.indexOf(".geojson") > -1) {
                reader.readAsText(file);
            } else if (file.type === "application/x-zip-compressed") {
                console.log("process the zipped shapefile");
                if (uploadLayer) {
                    uploadLayer.clearLayers();
                }
                loadshp({
                    url: file,
                    encoding: 'UTF-8',
                    EPSG: 4326
                }, function (data) {
                    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL,
                        url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));

                    //$('#link').attr('href', url);
                    //$('#link').html(file.name + '.geojson' + '<i class="download icon"></i>').attr('download', file.name + '.geojson');

                    //$('#downloadLink').slideDown(400);

                    //$('.shp-modal').toggleClass('effect');
                    //$('.overlay').toggleClass('effect');
                    //    $('#wrap').toggleClass('blur');
                        shpdata = data
                        if (data.features.length > 10) {
                            data.features = data.features.splice(0, 10);
                        }
                        
                        uploadLayer.addData(data);
                    map.fitBounds([
                        [data.bbox[1], data.bbox[0]], [data.bbox[3], data.bbox[2]]
                    ]);
                    $('.dimmer').removeClass('active');
                    $('#preview').addClass('disabled');
                    $('#epsg').val('');
                    $('#encoding').val('');
                    $('#info').addClass('picInfo');
                    $('#option').slideUp(500);
                });
            }
        }
        
    });
}

function dropped(data) {
    // dropped - do something with data
    console.log(data);
}

function enableDrawing() {
  clearAOISelections();
  drawtoolbar = new L.Control.Draw({
    draw: {
      polyline: false,
      circle: false,
      circlemarker: false,
    },
    edit: {
      featureGroup: drawnItems,
    },
  });
  map.addControl(drawtoolbar);

  map.on(L.Draw.Event.CREATED, function (e) {
    var type = e.layerType,
      layer = e.layer;
    if (type === "marker") {
      // Do marker specific actions
    }
    // Do whatever else you need to. (save to db; add to map etc)
    drawnItems.addLayer(layer);
  });

  map.on("draw:drawstart", function (e) {
    drawnItems.clearLayers();
  });
}

function enableAdminFeature(which) {
  clearAOISelections();

  adminLayer = L.tileLayer.wms(
    "https://climateserv2-ui.servirglobal.net/servirmap_102100/?&crs=EPSG%3A102100",
    {
      layers: which,
      format: "image/png",
      transparent: true,
      styles: "",
      TILED: true,
      VERSION: "1.3.0",
    }
  );
  map.addLayer(adminLayer);
  adminLayer.setZIndex(
    Object.keys(baseLayers).length + globalLayerArray.length + 5
  );

  // enable map click to show highlighted selections
  map.on("click", function (e) {
    var url = getFeatureInfoUrl(map, adminLayer, e.latlng, {
      info_format: "application/json",
      propertyName: "NAME,AREA_CODE,DESCRIPTIO",
    });

    $.ajax({
      type: "GET",
      async: true,
      url: url,
      crossDomain: true,
      jsonp: "callback",
      dataType: "jsonp",
      success: function (response) {
        if (adminHighlightLayer) {
          adminHighlightLayer.remove();
        }

        var selectedID = response["data"];
        if (highlightedIDs.includes(selectedID)) {
          highlightedIDs = highlightedIDs.filter((e) => e !== selectedID);
        } else {
          highlightedIDs.push(selectedID);
        }

        adminHighlightLayer = L.tileLayer.wms(
          "https://climateserv2-ui.servirglobal.net/servirmap_102100/?&crs=EPSG%3A102100",
          {
            layers: which + "_highlight",
            format: "image/png",
            transparent: true,
            styles: "",
            TILED: true,
            VERSION: "1.3.0",
            feat_ids: highlightedIDs.join(),
          }
        );
        map.addLayer(adminHighlightLayer);
        adminHighlightLayer.setZIndex(
          Object.keys(baseLayers).length + globalLayerArray.length + 6
        );
      },
    });
  });
}

function getFeatureInfoUrl(map, layer, latlng, params) {
  var point = map.latLngToContainerPoint(latlng, map.getZoom()),
    size = map.getSize(),
    bounds = map.getBounds(),
    sw = bounds.getSouthWest(),
    ne = bounds.getNorthEast(),
    sw = L.CRS.EPSG3857.project(new L.LatLng(sw.lat, sw.lng)),
    ne = L.CRS.EPSG3857.project(new L.LatLng(ne.lat, ne.lng));
  console.log(sw);
  // the bounding box works now!
  var bb = sw.x + "," + sw.y + "," + ne.x + "," + ne.y;

  var defaultParams = {
    request: "GetFeatureInfo",
    service: "WMS",
    srs: "EPSG:102100",
    styles: "",
    version: layer._wmsVersion,
    format: layer.options.format,
    bbox: bb,
    height: size.y,
    width: size.x,
    layers: layer.options.layers,
    query_layers: layer.options.layers,
    info_format: "text/html",
  };

  params = L.Util.extend(defaultParams, params || {});

  params[params.version === "1.3.0" ? "i" : "x"] = point.x;
  params[params.version === "1.3.0" ? "j" : "y"] = point.y;

  return layer._url + L.Util.getParamString(params, layer._url, true);
}

/**
 *
 *
 */
function uploadShapefile() {
  // https://gis.stackexchange.com/questions/368033/how-to-display-shapefiles-on-an-openlayers-web-mapping-application-that-are-prov
}

function sortableLayerSetup() {
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

      var count = 1;
      for (var i = $("ol.layers li").length; i > 0; i--) {
        var name = $("ol.layers li")[i - 1].id.replace("_node", "TimeLayer");
        console.log("Set z-index of layer " + name + " to " + i);

        overlayMaps[name].setZIndex(count);
        count++;
      }
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
}
/** Page load functions */
$(function () {
  mapSetup();
  globalLayerArray.forEach(createLayer);
  sortableLayerSetup();
  try {
    buildStyles();
  } catch (e) {}
});
