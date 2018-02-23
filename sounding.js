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
                    temp: dd[1],
                    dwpt: dd[2],
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

