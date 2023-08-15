// Some old functionality for getting camera devices
// Keeping here as could be reintegrated 

export async function getCameraDevices() {
    // Return a dictionary of camera devices
    // front: [all front cameras]
    // rear: [all rear cameras]
    // all: [all other cameras]

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    var cameras = videoDevices;

    const returnDict = {
      front: [],
      rear: [],
      other: []
    };

  videoDevices.forEach(device => {
    const label = device.label.toLowerCase();
    
    if (label.includes('front') || label.includes('forward')) {
        returnDict.front.push(device);
    } else if (label.includes('rear') || label.includes('back') || label.includes('behind') /* you can add more keywords here */) {
        returnDict.rear.push(device);
    } else {
        returnDict.other.push(device);
    }
  });

  return returnDict
}

export function canToggleCameras(cameraDevices){
  if (cameraDevices["front"].length > 0 && cameraDevices["rear"].length > 0) {
    return true;
  }

  if ((cameraDevices['front'].length + cameraDevices['rear'].length) > 1 && cameraDevices['other'].length > 0) {
    return true;
  }

  if (cameraDevices['other'].length > 1) {
    return true;
  }

  return false;

}

export function getCameraByType(cameraDevices, cameraType="front") {
  // Receives either `front` or `rear`
  
  // First, retrieve the first instance in cameraDevices[cameraType]
  if (cameraType in cameraDevices && cameraDevices[cameraType].length > 0) {
    return cameraDevices[cameraType][0];
  }

  // If that fails, retrieve the 0/1st instance in cameraDevices[other]
  // (ideally 0 for front, 1 for rear, but if not available, just return the first one)
  let idx = (cameraType === "front" ? 0 : 1);
  let numOthers = cameraDevices["other"].length;
  if (numOthers > 0) {
    return cameraDevices["other"][idx % numOthers];
  }

  // If that fails, return [other][0]
  let otherType = (cameraType === "front" ? "rear" : "front");
  if (cameraDevices[otherType].length > 0) {
    return cameraDevices[otherType][0];
  }

  console.error("No available cameras.", cameraDevices);
}