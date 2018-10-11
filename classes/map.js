"use strict";
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import {  defaults as defaultControls, ZoomSlider, FullScreen } from 'ol/control';
import { defaults as defaultInteractions } from 'ol/interaction';
import { transform } from 'ol/proj';


export default class MapBBB {
     
    constructor() {
        this.centerLong = 11.576124;
        this.centerLat = 48.137154;
        this.centerPoint = transform([this.centerLong, this.centerLat], 'EPSG:4326','EPSG:3857');
        this.view = null;
        this.baseLayer = null;
        this.map = null;
        this.zoom = 8;
        this.maxZoom = 20;
        this.minZoom = 2;
        this.target = 'map';
        this.paintZone = this.paintZone.bind(this);
        this.paintPeople = this.paintPeople.bind(this);
    }


    createBaseMap() {
        this.view = new View({
            center: this.centerPoint,
            zoom: this.zoom,
            maxZoom: this.maxZoom,
            minZoom: this.minZoom
        });

        this.baseLayer = new TileLayer({
            title: 'OSM',
            type: 'base',
            visible: true,
            source: new OSM()
        });

        this.map = new Map({
            target: this.target,
            controls: defaultControls().extend([
                new ZoomSlider(),
                new FullScreen,
            ]), 
            attributionOptions: {
                collapsible: false
            },
            interactions: defaultInteractions({
                mouseWheelZoom:false
            }),
            renderer: 'canvas',
            layers: [this.baseLayer],
            view: this.view
        });
    }


    pushLayerZone(layer) {       
        //Paint Zone (Address)
        const painted = this.paintZone('rgba(180, 0, 0, 0.7)', 'rgba(180, 0, 0, 1)', 3);
        layer.setStyle(painted);         
        this.map.addLayer(layer);
        
    }


    pushLayerPeople(layer) {       
        //Paint Zone (Address)
        const painted = this.paintPeople('rgba(255, 100, 50, 0.3)', 'rgba(255, 100, 50, 0.8)', 'rgba(55, 200, 150, 0.5)', 'rgba(55, 200, 150, 0.8)', 3, 5);
        layer.setStyle(painted);         
        this.map.addLayer(layer);
        
    }

    //Remove old layers (Address)  
    removeOldAddress(map){   
        const oldLayers = map; //map
        let layersToRemove = [];
        oldLayers.getLayers().forEach(function (layer) {
            layersToRemove.push(layer);        
        });
    
        const len = layersToRemove.length;
        if(len > 1){
            for(var i = 1; i < len; i++) {
                
                oldLayers.removeLayer(layersToRemove[i]);
            }
        }else {

            return false;
        }
    }


    // Center the address founded
    centerAddress(map, pointAddress) {
        const centerPoint = transform(pointAddress, 'EPSG:4326', 'EPSG:3857')
        const view = map.getView();
        view.setCenter(centerPoint);
        view.setZoom(16);
    };


    //Paint the address founded
    paintZone(fillColor, strokeColor, widthStroke){
        const StyleAddress = new Style({
            fill: new Fill({
                color: fillColor
            }),
            stroke: new Stroke({
                color: strokeColor,
                width: widthStroke
            })
        });
        return StyleAddress;
    };


    //Paint People inside of the zone
    paintPeople(fillColor, strokeColor, fillColorCircle, strokeColorCircle, widthStroke, radius){
        var style = new Style({
            fill: new Fill({
                color: fillColor
            }),
            stroke: new Stroke({
                width: widthStroke,
                color: strokeColor
            }),
            image: new CircleStyle({
                fill: new Fill({
                    color: fillColorCircle
                }),
                stroke: new Stroke({
                    width: widthStroke,
                    color: strokeColorCircle
                }),
                radius: radius
            }),
        });   

        return style;
    }

}