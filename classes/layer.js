"use strict";
import { Feature } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Polygon, MultiPoint, Circle } from 'ol/geom';
import { Style, Fill, Stroke } from 'ol/style';
import { transform } from 'ol/proj';
import * as turf from '@turf/turf'



//Classes
import ServiceLayer from './services';

export default class LayerQuery{
    constructor(){
    }

    getPolygon(geoURL){
        const service = new ServiceLayer();
        const promise = service.get(geoURL, function(status, response){
            if(status == 200){
                const data = response.features                               
                return data;    
            }else{
                console.log('Error createLayer: ', status);
            }
        });

        return promise
    }

    getPolygon2(geoURL1,geoURL2, geoURL3){
        const service = new ServiceLayer();
        const promise = service.getAll(geoURL1, geoURL2, geoURL3, function(status, response){
            if(status[0] == 200 && status[1] == 200 && status[2] == 200){
                const data = response;
                return data;    
            }else{
                console.log('Error createLayer0: ', status[0]);
                console.log('Error createLayer1: ', status[1]);
                console.log('Error createLayer1: ', status[2]);
            }
        });

        return promise
    }

    createLayerCircle(coordinates, map){

        const center = transform(coordinates, 'EPSG:4326', 'EPSG:3857');
        
        const circle = new Circle(
            center,
            20
        );

        const styleCircle = new Style({
            fill: new Fill({
                color: 'rgb(255, 0, 0, 0.7)'
            }),
            stroke: new Stroke({
                color: 'rgb(255, 0, 0, 1)',
                width: 'rgb(255, 0, 0, 1)'
            })
        });
        const circleFeature = new Feature(circle);  

        circleFeature.setStyle(styleCircle);
        const vectorSource = new VectorSource({
            projection: 'EPSG:4326',
            features: [circleFeature]
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource
        });

        map.addLayer(vectorLayer);  
    }


    makePolygonFromCentroid(centerPolygon,map){
        const center = transform(centerPolygon, 'EPSG:3857', 'EPSG:4326');
        const radius = 0.353;
        const options = {steps: 64, units: 'kilometers', properties: {foo: 'bar'}};
        const circle = turf.circle(center, radius, options);
        let polygon = new Polygon([circle.geometry.coordinates[0]]);
        polygon.transform('EPSG:4326', 'EPSG:3857');
    
        // Create feature with polygon.
        var feature = new Feature(polygon);
    
        // Create vector source and the feature to it.
        var vectorSource = new VectorSource();
        vectorSource.addFeature(feature);
    
        // Create vector layer attached to the vector source.
        var vectorLayer = new VectorLayer({
            source: vectorSource
        });
        
        map.addLayer(vectorLayer);
    
        return feature;
    
      }

    
    randomPointInPoly(polygon,nros_points,map) {
        
        const pointPolygon = polygon.getCoordinates();
        const bounds = polygon.getExtent(); 
        const x_min  = bounds[0];
        const x_max  = bounds[2];
        const y_min  = bounds[1];
        const y_max  = bounds[3];
        let lng = 0;
        let lat = 0;
        let point = [];
        let i = 0;
        let pol = turf.polygon(pointPolygon);
        let poi = [];
        let ptsWithin = [];

        for(i = 0; i < nros_points; i++){
            lat = y_min + (Math.random() * (y_max - y_min));
            lng = x_min + (Math.random() * (x_max - x_min));
            poi = turf.point([lng,lat]);
            ptsWithin = turf.pointsWithinPolygon(poi,pol);
            if(ptsWithin.features.length != 0){
                point.push([lng,lat]);
            }
        }
        
        const point_feature = new Feature({});
        const point_geom = new MultiPoint(point);
        point_feature.setGeometry(point_geom);
        const vector_layer = new VectorLayer({
            source: new VectorSource({
                features: [point_feature]
            }),
            zIndex:1
        })

        map.addLayer(vector_layer);
    }


    getCenterOfExtent(polygon){
        const bounds = polygon.getExtent(); 
        const x_min  = bounds[0];
        const x_max  = bounds[2];
        const y_min  = bounds[1];
        const y_max  = bounds[3];

        const X = x_min + (x_max-x_min)/2;
        const Y = y_min + (y_max-y_min)/2;
        const center = [X, Y]; 

        return center;
    }
}
