export function latLngToPix(map, latLng = null) {
    // project latLng to pixel coordinates.
    // if latLng is null, use the current centre of the map.
    var projection = map.getProjection();

    if (latLng === null) {
        latLng = map.getCenter();
    }


    var numTiles = 1 << map.getZoom();
    var worldCoordinate = projection.fromLatLngToPoint(latLng);
    var pixelCoordinate = new google.maps.Point(
            worldCoordinate.x * numTiles,
            worldCoordinate.y * numTiles);

    var topLeft = new google.maps.LatLng(
        map.getBounds().getNorthEast().lat(),
        map.getBounds().getSouthWest().lng()
    );

    var topLeftWorldCoordinate = projection.fromLatLngToPoint(topLeft);
    var topLeftPixelCoordinate = new google.maps.Point(
            topLeftWorldCoordinate.x * numTiles,
            topLeftWorldCoordinate.y * numTiles);

    return {x: pixelCoordinate.x - topLeftPixelCoordinate.x,
       y: pixelCoordinate.y - topLeftPixelCoordinate.y}

}

export function pixToLatLng(map, pix) {
    // project pixel coordinates to latLng
    var projection = map.getProjection();

    var numTiles = 1 << map.getZoom();

    var topLeft = new google.maps.LatLng(
        map.getBounds().getNorthEast().lat(),
        map.getBounds().getSouthWest().lng()
    );

    var topLeftWorldCoordinate = projection.fromLatLngToPoint(topLeft);
    var topLeftPixelCoordinate = new google.maps.Point(
            topLeftWorldCoordinate.x * numTiles,
            topLeftWorldCoordinate.y * numTiles);

    var worldCoordinate = new google.maps.Point(
            (pix.x + topLeftPixelCoordinate.x) / numTiles,
            (pix.y + topLeftPixelCoordinate.y) / numTiles);

    return projection.fromPointToLatLng(worldCoordinate);
}