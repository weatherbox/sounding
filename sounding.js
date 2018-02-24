const url = "https://s3-ap-northeast-1.amazonaws.com/soundings/sounding-current.json.gz";


class SoundingGL {
    constructor (map){
        this.map = map;

        let self = this;
        this._fetchSoundingJSON(function(data){
            console.log(data);
            self.data = data;
            self.initMap();
        });
    }

    _fetchSoundingJSON(callback){
        fetch(url)
            .then(function(res){
                return res.json();
            }).then(function(json){
                callback(json);
            });
    }

    initMap(){
        this.show(500);

    }

    show(level){
        var geojson = this.createGeojson(level);
        console.log(geojson);

        var dataid = 'sounding-' + level;
        this.map.addSource(dataid, {
            type: 'geojson',
            data: geojson
        });

        this.map.addLayer({
            id: 'windbarb',
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
    }

    createGeojson(level){
        var features = [];

        for (var id in this.data){
            if (id == 'time') continue;
            var d = this.data[id];
            var dd = d.levels[level + '.0'];

            features.push({
                type: 'Feature',
                properties: {
                    id: id,
                    name: d.name,
                    height: dd[0],
                    tempf: dd[1].toFixed(1),
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
}

