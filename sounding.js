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
        var geojson = this.createGeojson(500);
        console.log(geojson);

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
                    temp: +dd[1],
                    dwpt: (dd[2]) ? +dd[2] : null,
                    wdir: +dd[5],
                    wspeed: +dd[6]
                },
                geometry: {
                    type: 'Point',
                    coordinates: [
                        +d.indices.SLON,
                        +d.indices.SLAT
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

