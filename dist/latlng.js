var _util=require('util');var _util2=_interopRequireDefault(_util);var _winston=require('winston');var _winston2=_interopRequireDefault(_winston);var _nodeFetch=require('node-fetch');var _nodeFetch2=_interopRequireDefault(_nodeFetch);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}var postalCodeCache={};function toRad(number){return number*(Math.PI/180);}function locationsToCart(){var coords=arguments.length>0&&arguments[0]!==undefined?arguments[0]:[];return radToCart(coords.map(function(coord){return{x:toRad(coord.lat),y:toRad(coord.lng)};}));}function radToCart(){var coords=arguments.length>0&&arguments[0]!==undefined?arguments[0]:[];return coords.map(function(coord){var x=coord.x,y=coord.y;return{x:Math.cos(x)*Math.cos(y),y:Math.cos(x)*Math.sin(y),z:Math.sin(x)};});}var LatLng=function LatLng(config){var appId=config.appId;function genLocationByPostalCode(postalCode){var url,results,item,_lat,_lng,loc,entry;return regeneratorRuntime.async(function genLocationByPostalCode$(_context){while(1){switch(_context.prev=_context.next){case 0:if(!postalCodeCache[postalCode]){_context.next=5;break;}_winston2.default.info('RETRIEVED: '+postalCode+' from cache: '+_util2.default.inspect(postalCodeCache[postalCode]));return _context.abrupt('return',postalCodeCache[postalCode]);case 5:_winston2.default.info('RETRIEVING: Location data for '+postalCode+' from service.');url='https://www.zipcodeapi.com/rest/'+appId+'/info.json/'+postalCode+'/degrees';_context.next=9;return regeneratorRuntime.awrap((0,_nodeFetch2.default)(url));case 9:results=_context.sent;_context.next=12;return regeneratorRuntime.awrap(results.json());case 12:item=_context.sent;_lat=item.lat;_lng=item.lng;loc=item.city+', '+item.state;entry={postalCode:postalCode,loc:loc&&loc.length>0?loc:'',lat:_lat,lng:_lng};if(!(!entry.lat||!entry.lng)){_context.next=23;break;}_winston2.default.error('Postal code '+postalCode+' did not return valid results.');_winston2.default.debug('Created: '+_util2.default.inspect(entry)+' From: '+_util2.default.inspect(item));return _context.abrupt('return',null);case 23:_winston2.default.info('RETRIEVED: '+entry.loc+' for Postal code '+postalCode);postalCodeCache[postalCode]=entry;return _context.abrupt('return',entry);case 26:case'end':return _context.stop();}}},null,this);}function getDistance(start,end){var radius=6371;var dLat=toRad(end.lat-start.lat);var dLon=toRad(end.lng-start.lng);var angle=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(toRad(start.lat))*Math.cos(toRad(end.lat))*Math.sin(dLon/2)*Math.sin(dLon/2);var km=radius*(2*Math.atan2(Math.sqrt(angle),Math.sqrt(1-angle)));var miles=km/1.607;return{start:start,end:end,miles:miles,km:km};}function getMidpoint(){var locations=arguments.length>0&&arguments[0]!==undefined?arguments[0]:[];var allCarts=locationsToCart(locations);var f=function f(p,c,_,a){return(p+c)/a.length;};var meanX=allCarts.map(function(cart){return cart.x;}).reduce(f);var meanY=allCarts.map(function(cart){return cart.y;}).reduce(f);var meanZ=allCarts.map(function(cart){return cart.z;}).reduce(f);var hyp=Math.sqrt(meanX*meanX+meanY*meanY);var lat=toRad(Math.atan2(meanZ,hyp));var lng=toRad(Math.atan2(meanY,meanX));return{lat:lat,lng:lng};}return{getDistance:getDistance,genLocationByPostalCode:genLocationByPostalCode,getMidpoint:getMidpoint};};exports=module.exports=LatLng;