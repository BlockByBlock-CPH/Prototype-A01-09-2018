//Classes
import MapBBB from './classes/map';
import LayerBBB from './classes/layer';
import MgmQuery from './classes/mgm_query';


const mapBase = new MapBBB();
const layer = new LayerBBB();
const mgm_query = new MgmQuery();
mapBase.createBaseMap();

  $("#btn_timeline").click(function(event){
  event.preventDefault();
  const search_address = $('#search_address').val();
  $( "#list_suggestions" ).empty();
  

  mapBase.removeOldAddress(mapBase.map);
  mgm_query.addressCoord(search_address);

  $("#list_suggestions").on("click", "li #element", function(event){  
    const select_day = $('#select_day').val();
    const longitude = event.target.childNodes[1].value;
    const latitude = event.target.childNodes[3].value;
    
    $( "#list_suggestions" ).empty();
    const POINT_ADDRESS = [parseFloat(longitude),parseFloat(latitude)];
    const geoURL = mgm_query.findQuery(POINT_ADDRESS, select_day);

    if(select_day == 0){
      layer.getPolygon2(geoURL[0], geoURL[1], geoURL[2]).then(response => {
        mgm_query.runTimelineWeek(response[0],response[1], response[2], mapBase, POINT_ADDRESS);
      });
    }else if(select_day > 0){
      layer.getPolygon(geoURL).then(response => {
        mgm_query.runTimelineDay(response,mapBase, POINT_ADDRESS);
      });
    }else {
      console.log("Error choosing timeline");
    }
 
    mgm_query.tableQueries(POINT_ADDRESS, select_day);
    mapBase.centerAddress(mapBase.map, POINT_ADDRESS);

    $('#btnModalTop').css('display','block');
    mgm_query.topQueries(select_day);
  });
});

