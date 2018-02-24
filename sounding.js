const url = "https://s3-ap-northeast-1.amazonaws.com/soundings/sounding-current.json.gz";


class SoundingGL {
    constructor (map){
        this.map = map;

        let self = this;
        this._fetchSoundingJSON(function(data){
            console.log(data);
            self.data = data;
            self.initMap();
            self.showTime();
        });
    }

    _fetchSoundingJSON (callback){
        fetch(url)
            .then(function(res){
                return res.json();
            }).then(function(json){
                callback(json);
            });
    }
    
    showTime (){
        var time = d3.timeParse("%Y%m%d%H")(this.data.time);
        var timestr = d3.timeFormat("%HZ %d %b %Y")(time);
        window.mapTime.set(timestr);
    }

    initMap (){
        var init = this._getQueryType() || 500;
        this.show(init);
        this._initMapEvent();
    }

    changeLevel (level){
        this.remove();
        this.show(level);
    }

    show (level){
        if (level == this.level) return;
        this.level = level;
        var dataid = 'sounding-' + level;

        if (!this.map.getSource(dataid)){
            var geojson = this.createGeojson(level);

            this.map.addSource(dataid, {
                type: 'geojson',
                data: geojson
            });
        }

        this.map.addLayer({
            id: 'wind-barb',
            type: 'symbol',
            source: dataid,
            layout: {
                'icon-image': 'windbarb-{wicon}',
                'icon-rotate': { 
                    'type': 'identity',
                    'property': 'wdir'
                },
                'icon-rotation-alignment': 'map',
                'icon-allow-overlap': true
            }
        });

        this.map.addLayer({
            id: 'temp-label',
            type: 'symbol',
            source: dataid,
            layout: {
                'text-field': '{tempf}',
                'text-size': {
                    base: 1.5,
                    stops: [[5, 10], [8, 12]]
                },
                'text-offset': [1.6, -0.6],
                'text-allow-overlap': true
            },
            minzoom: 4.5
        });

        this.map.addLayer({
            id: 'dwpt-label',
            type: 'symbol',
            source: dataid,
            layout: {
                'text-field': '{dwptf}',
                'text-size': {
                    base: 1.5,
                    stops: [[5, 10], [8, 12]]
                },
                'text-offset': [1.6, 0.6],
                'text-allow-overlap': false
            },
            minzoom: 4.5
        });

        this.map.addLayer({
            id: 'name-label',
            type: 'symbol',
            source: dataid,
            layout: {
                'text-field': '{name}',
                'text-size': 12,
                'text-offset': {
                    base: 2,
                    stops: [[7, [0, 1.8]], [10, [0, 2.2]]]
                },
                'text-allow-overlap': true
            },
            paint: {
                'text-color': '#333'
            },
            minzoom: 5.5
        }, 'dwpt-label');

        this._setQueryType(level);
    }

    remove (){
        this.map.removeLayer('wind-barb');
        this.map.removeLayer('temp-label');
        this.map.removeLayer('dwpt-label');
        this.map.removeLayer('name-label');
    }

    createGeojson (level){
        var features = [];

        for (var id in this.data){
            if (id == 'time') continue;
            var d = this.data[id];
            var dd = d.levels[level + '.0'];
            if (!dd) dd = [null, null, null, 0, 0, 0, 0];

            features.push({
                type: 'Feature',
                properties: {
                    id: id,
                    name: d.name,
                    height: dd[0],
                    tempf: (dd[1]) ? dd[1].toFixed(1) : "",
                    dwptf: (dd[2]) ? dd[2].toFixed(1) : "",
                    wdir: dd[5],
                    wspeed: dd[6],
                    wicon: Math.round(dd[6] / 5)
                },
                geometry: {
                    type: 'Point',
                    coordinates: [
                        d.indices.SLON,
                        d.indices.SLAT
                    ]
                }
            });
        }

        return {
            type: 'FeatureCollection',
            features: features
        };
    }
    
    
    _initMapEvent (){
        this._moving = false;
        this._zooming = false;
        this._popup = new mapboxgl.Popup({ closeButton: false, offset: [0, -10] });

        var self = this;
        if (this._isTouchDevice()){
            this.map.on('mousemove', function (e){ self.select(e); });

        }else{
            this.map.on('click', function (e){ self.select(e); });
            this.map.on('mousemove', function (e){ self._hover(e); });
            this.map.on('movestart', function (){ self._moving = true; });
            this.map.on('moveend',   function (){ self._moving = false; });
            this.map.on('zoomstart', function (){ self._zooming = true; });
            this.map.on('zoomend',   function (){ self._zooming = false; });
        }
    }

    _isTouchDevice () {
        return (('ontouchstart' in window)
            || (navigator.MaxTouchPoints > 0)
            || (navigator.msMaxTouchPoints > 0));
    }


    _hover (e){
        if (this._moving || this._zooming) return false;

        var features = this.queryFeatures(e.point);
        map.getCanvas().style.cursor = (features.length) ? 'crosshair' : '';
        
        if (!features.length) {
            this._popup.remove();
            return;
        }

        var feature = features[0];
        var text = feature.properties.name + ' ' + this.featureText(feature);
        this._popup.setLngLat(feature.geometry.coordinates)
            .setText(text)
            .addTo(this.map);
    }

    select (e){
        var features = this.queryFeatures(e.point);   
        if (!features.length){
            window.infoBar.hide();
            return;
        }
        
        var feature = features[0];
        var props = feature.properties;
        var value = this.featureText(feature);

        this._selectPopup(feature.geometry.coordinates, props.name);

        console.log(props.name, props.id);
        window.infoBar.showPoint(props.name, value, this.data[props.id], this.onclose.bind(this));
    }

    _selectPopup (lnglat, text){
        if (this._sPopup) this._sPopup.remove();
        this._sPopup = new mapboxgl.Popup({ closeButton: false, offset: [0, -10] });
        this._sPopup.setLngLat(lnglat)
            .setText(text)
            .addTo(this.map);
    }

    onclose (){
        if (this._sPopup) this._sPopup.remove();
    }

    queryFeatures (point){
		return this.map.queryRenderedFeatures(point, {
            layers: ['wind-barb', 'temp-label', 'dwpt-label', 'name-label']
        });
    }
    featureText (feature){
        var prop = feature.properties;
		return prop.wdir + '° ' + prop.wspeed + 'kt';
    }

    _getQueryType (){
        return location.search.slice(1);
    }

    _setQueryType (type){
        history.replaceState(null, null, '?' + type + location.hash);
    }
}

