//FONTE: Time Series Proportional Symbol Maps with Leaflet and jQuery https://cartographicperspectives.org/index.php/journal/article/view/cp76-donohue-et-al/1307
$(document).ready(function () {
    var centroides;
     map = L.map("map", {
        center: [39, -8.5],
        zoom: 6
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
    }).addTo(map);

    var scale = L.control.scale();
    scale.addTo(map);

    map.attributionControl.setPrefix(
        '&copy; <i>yMaps</i>' + ' | Dados: <a href="https://www.ipma.pt/pt/oclima/normais.clima/1971-2000/normalclimate7100.jsp">IPMA</a> | <a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
    );
    /*
    fetch("data/nt_dq_7100.geojson")
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        var conc = L.geoJSON(data, {
          //style: conc_style
          }).addTo(map);
          //var bounds = conc.getBounds();
          map.fitBounds(conc.getBounds(), {padding: []});
          //map.setMaxBounds(bounds);
          //clearBounds(map);
      });
*/
    //Extent
    //var bounds = conc.getBounds();
    //map.fitBounds(conc.getBounds());
    //map.setMaxBounds(bounds);

    $.getJSON("data/nt_dq_7100.geojson")
      .done(function (data) {
        //L.geoJSON(data).addTo(map);

        var info = processData(data);
        createPropSymbols(info.timestamps, data);
        createLegend(info.min, info.max);
        //createSliderUI(info.timestamps);
      })
      .fail(function () {
        alert("Não é possível carregar o ficheiro com os dados.");
      });

  function processData(data) {
		var timestamps = [];
		var min = Infinity;
		var max = -Infinity;

		for (var feature in data.features) {
			var properties = data.features[feature].properties;
			for (var attribute in properties) {
				if ( attribute === "Tn_ND20"
                  /*attribute != "Nome" &&
                  attribute != "Lat" &&
                  attribbute != "Long" &&
                  attribute != "Tx_ND30"*/) {
          if ( $.inArray(attribute,timestamps) === -1) {
					       timestamps.push(attribute);
          }
          if (properties[attribute] < min) {
					       min = properties[attribute];
          }
          if (properties[attribute] > max) {
					       max = properties[attribute];
          }
        }
      }
    }
		return {
			timestamps : timestamps,
			min : min,
			max : max
        }
    }

  function createPropSymbols(timestamps, data) {
		centroides = L.geoJson(data, {
			pointToLayer: function(feature, latlng) {
			return L.circleMarker(latlng, {
                fillColor: '#c994c7',
				color: '#dd1c77',
				weight: 1,
				fillOpacity: 0.6
                }).on({
                    mouseover: function(e) {
                        this.openPopup();
                        this.setStyle({color: 'yellow'});
					},
					mouseout: function(e) {
                        this.closePopup();
                        this.setStyle({color: '#dd1c77'});
					}
				});
			}
		}).addTo(map);
        updatePropSymbols(timestamps[0]);
    }

  function updatePropSymbols(timestamp) {
    centroides.eachLayer(function(layer) {
      var props = layer.feature.properties;
      var radius = calcPropRadius(props[timestamp]);
      //var nhab = addspaces(props[timestamp]);
      var popupContent = String(props.Nome) + "<br>" +  String(props[timestamp]) + " dias";
      layer.setRadius(radius);
		  layer.bindPopup(popupContent, { offset: new L.Point(0,-radius) });
		  });
    }

	function calcPropRadius(attributeValue) {
		var scaleFactor = 10;
		var area = attributeValue * scaleFactor;
		return Math.sqrt(area/Math.PI)*2;
	}

  function createLegend(min, max) {

    if (min < 1) {
			min = 1;
		}


		function roundNumber(inNumber) {
				return (Math.round(inNumber/10) * 10);
		}

		var legend = L.control( { position: 'bottomright' } );
		legend.onAdd = function(map) {
      var legendContainer = L.DomUtil.create("div", "legend");
      var symbolsContainer = L.DomUtil.create("div", "symbolsContainer");
      //var classes = [roundNumber(min), roundNumber((max-min)/2), roundNumber(max)];
      var classes = [min, (max-min)/2, max];
      var legendCircle;
      var lastRadius = 0;
      var currentRadius;
      var margin;
      //stop propagation: a solução abaixo não funcionava
      L.DomEvent.disableClickPropagation(legendContainer);
      L.DomEvent.addListener(legendContainer, 'mousedown', L.DomEvent.stopPropagation);//new
      /*
      L.DomEvent.addListener(legendContainer, 'mousedown', function(e) {
          L.DomEvent.stopPropagation(e);
      });
      */
      $(legendContainer).append("<p id='legendTitle'>Número médio</p>");
      for (var i = 0; i <= classes.length-1; i++) {
        legendCircle = L.DomUtil.create("div", "legendCircle");
        currentRadius = calcPropRadius(classes[i]);
        margin = -currentRadius - lastRadius - 2;
        $(legendCircle).attr("style", "width: " + currentRadius*2 +
              "px; height: " + currentRadius*2 +
              "px; margin-left: " + margin + "px" );
        var valor = addspaces(classes[i]);
        //$(legendCircle).append("<span class='legendValue'>"+classes[i]+"</span>");
        $(legendCircle).append("<span class='legendValue'>"+valor+"</span>");
        $(symbolsContainer).append(legendCircle);
        lastRadius = currentRadius;
      }
      $(legendContainer).append(symbolsContainer);
        return legendContainer;
        };
        legend.addTo(map);
	 } // end createLegend();

	function createSliderUI(timestamps) {
		let sliderControl = L.control({ position: 'topright'} );
		sliderControl.onAdd = function(map) {
			var slider = L.DomUtil.create("input", "range-slider");
			//var slider = L.DomUtil.create("input", "range-slider");
			//stop propagation: a solução abaixo não funcionava
      L.DomEvent.disableClickPropagation(slider);
      L.DomEvent.addListener(slider, 'mousedown', L.DomEvent.stopPropagation);
            /*
            L.DomEvent.addListener(slider, 'mousedown', function(e) {
                L.DomEvent.stopPropagation(e);
			});
            */
		$(slider)
      .attr({'type':'range',
				'max': timestamps[timestamps.length-1],
				'min': timestamps[0],
				'step': 10,
        'value': String(timestamps[0])})
      .on('input change', function() {
        updatePropSymbols($(this).val().toString());
        $(".temporal-legend").text(this.value);
        });
		return slider;
		}
		sliderControl.addTo(map);
        createTemporalLegend(timestamps[0]);
	     }

	function createTemporalLegend(startTimestamp) {
		var temporalLegend = L.control({ position: 'topright' });
		temporalLegend.onAdd = function(map) {
			var output = L.DomUtil.create("output", "temporal-legend");
            $(output).text(startTimestamp)
			return output;
		}
		temporalLegend.addTo(map);
	}

  //espaço como separador de milhares
  function addspaces(x) {
    let retVal = String(x).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1 ');
    return retVal;
  }

  function conc_style(feature) {
    return {
      color: "gray",
      weight: 1.5,
      fill: false
    };
  }
  //var bounds = conc.getBounds();
  map.fitBounds(centroides.getBounds());
  //map.setMaxBounds(bounds);
});
