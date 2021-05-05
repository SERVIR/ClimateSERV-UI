/** Global Variables */
var active_basemap = "OSM";
var map;
var overlayMaps = {};
var baseLayers;

function getLayerHtml(item) {
    var replica = $("#layersTemplate:first").clone();
    return replica
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

function openSettings(which) {
    var active_layer = getLayer(which);

    // Need to mirror layer toggle checkbox here at the top so users can toggle from settings as well

    // check if is model
    // if so add the ensemble checkboxes 
    // as well as  baseSettingsHtml()

    $("#dialog").html(
        baseSettingsHtml()
    );
    $("#dialog").dialog({
        title: "Settings",
        resizable: { handles: "se" },
    });
    $(".ui-dialog-title").attr("title", "Settings");

    var slider = document.getElementById("opacityctrl");
    slider.value = overlayMaps[which].options.opacity;
    slider.oninput = function () {
        console.log("Handler for .change() called on Layer: " + which + " " + this.value);
        overlayMaps[which].setOpacity(this.value);
    }
    var applyStylebtn = document.getElementById("applyStylebtn");
    applyStylebtn.onclick = function () {
        console.log("Apply style to: " + which);
    }
    // Update the rest of the form values from 
    // overlayMaps['which']._baseLayer.options.colorscalerange
    document.getElementById("range-min").value = overlayMaps[which]._baseLayer.options.colorscalerange.split(',')[0];
    document.getElementById("range-max").value = overlayMaps[which]._baseLayer.options.colorscalerange.split(',')[1];
    // Update color scheme with
    // overlayMaps['which']._baseLayer.wmsParams.styles
}

function baseSettingsHtml(which) {
    return `<div style="padding-bottom:15px;">
            <br>
            <label for="range-min" style="font-weight: 100">Min</label>
            <input type="text" class="form-control" id="range-min" name="range-min" style="width: 100%">
            <br> <label for="range-max" style="font-weight: 100">Max</label>
            <input type="text" class="form-control" id="range-max" name="range-max" style="width: 100%">
            <br><label>
            Select Color Scheme
            </label>
            <select class="style_table form-control" name="style_table" id="style_table" style="width: 100%">
            </select><br><button id="applyStylebtn" style="
                float: right;
            ">Apply</button>
            <br><br>
            <label for="opacityctrl" style="font-weight: 100">Opacity</label>
            <input id="opacityctrl" type="range" class="layer-opacity form-control" min="0" max="1" step=".01" value="1" style="width:100%">
    </div>`
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
    if (map.hasLayer(overlayMaps[which])) {
        map.removeLayer(overlayMaps[which]);
    } else {
        map.addLayer(overlayMaps[which]);
    }
}

/** Page load functions */
$(function () {
    mapSetup();
    globalLayerArray.forEach(createLayer);
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
