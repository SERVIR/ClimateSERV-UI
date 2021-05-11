/** Global Variables */
var active_basemap = "OSM";
var map;
var overlayMaps = {};
var adminLayer;
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
    $.get(globalLayerArray[0].url + '&request=GetCapabilities', function (xml) {
        var jsonObj = $.xml2json(xml);
        var styles = jsonObj["#document"].WMS_Capabilities.Capability.Layer.Layer.Layer.Style;

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

    $("#dialog").html(
        settingsHtml
    );
    $("#dialog").dialog({
        title: "Settings",
        resizable: { handles: "se" },
        width: 'auto',
        height: 'auto',
    });
    $(".ui-dialog-title").attr("title", "Settings");
    $(styleOptions).each(function () {
        $("#style_table").append($("<option>").attr('value', this.val).text(this.text));
    });

    $("#style_table").val(overlayMaps[which]._baseLayer.wmsParams.styles);

    var slider = document.getElementById("opacityctrl");
    slider.value = overlayMaps[which].options.opacity;
    slider.oninput = function () {
        console.log("Handler for .change() called on Layer: " + which + " " + this.value);
        overlayMaps[which].setOpacity(this.value);
    }

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
                colorscalerange: document.getElementById("range-min").value + "," + document.getElementById("range-max").value,
                abovemaxcolor: "transparent",
                belowmincolor: "transparent",
                numcolorbands: 100,
                styles: $("#style_table").val(),
            }),
            {
                updateTimeDimension: true,
            }
        )
        map.addLayer(overlayMaps[which]);
        document.getElementById(which.replace("TimeLayer", '')).checked = true
    }
    // Update min/max
    document.getElementById("range-min").value = overlayMaps[which]._baseLayer.options.colorscalerange.split(',')[0];
    document.getElementById("range-max").value = overlayMaps[which]._baseLayer.options.colorscalerange.split(',')[1];
   
}
var kickout;
function baseSettingsHtml(which) {
    var replica = $("#styletemplate:first").clone();
    return replica.html();
}

function openLegend(which) {
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
    if ($('#dialog').dialog()) {
        $('#dialog').dialog('close');
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

    if (drawtoolbar) {
        drawtoolbar.remove();
    }

    drawnItems.clearLayers();

    if (which === "draw") {
        enableDrawing();
    }
}

function enableDrawing() {
    drawtoolbar = new L.Control.Draw({
        draw: {
            polyline: false,
            circle: false,
            circlemarker: false,
        },
        edit: {
            featureGroup: drawnItems
        }
    });
    map.addControl(drawtoolbar);

    map.on(L.Draw.Event.CREATED, function (e) {
        var type = e.layerType,
            layer = e.layer;
        if (type === 'marker') {
            // Do marker specific actions
        }
        // Do whatever else you need to. (save to db; add to map etc)
        drawnItems.addLayer(layer);
    });

    map.on('draw:drawstart', function (e) {
        drawnItems.clearLayers();
    });
}

function enableAdminFeature(which) {
    if (adminLayer) {
        adminLayer.remove();
    }
    adminLayer = L.tileLayer.wms("https://climateserv.servirglobal.net/cgi-bin/servirmap_102100?&crs=EPSG%3A102100", {
        layers: which,
        format: "image/png",
        transparent: true,
        styles: '',
        TILED: true,
        VERSION: "1.3.0"
    });
    map.addLayer(adminLayer);
    adminLayer.setZIndex(Object.keys(baseLayers).length + globalLayerArray.length + 5)
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
    } catch (e) { }
});
