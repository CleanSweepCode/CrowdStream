
var AWS = require('aws-sdk');


// set config from config file
AWS.config.loadFromPath('C:\\Users\\Thomas\\source\\repos\\LivestreamApp\\video_uploading\\.aws\\config.json');


var ivs = new AWS.IVS();

function createChannel(name, type) {
  const params = {
    name, // Name of the channel
    type, // Type of the channel: 'BASIC' | 'STANDARD'
  };

  return new Promise((resolve, reject) => {
    ivs.createChannel(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function listChannels() {
    return new Promise((resolve, reject) => {
      var params = {};
      ivs.listChannels(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data.channels);
        }
      });
    });
  }
  
  async function main() {

    // Create a channel
    createChannel('MyChannelTest1', 'BASIC')
    .then(data => console.log(data)) // successful response
    .catch(err => console.error(err)); // an error occurred
  
    try {
      var channels = await listChannels();
      var arns = channels.map(channel => channel.arn);
      console.log(arns);
      params = {
        channelArn: arns[0],
        }
      ivs.listStreamKeys(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data); // successful response
      });
      
      
    } catch (err) {
      console.log(err);
      // Handle the error
    }
  }
  
  main();
  
  
  
  
  
/*

var params = {};
var arns = [];

ivs.listChannels(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
        var channels = data.channels; // Store the list of channels in a variable
        channels.forEach(function(channel) {
          var arn = channel.arn; // Access the ARN of each channel
          arns.push(arn); // Add the ARN to the arns array
        });
        
        // You can access the arns array here or perform further operations with it
        console.log(arns);
      }
  });




var params = {
    arn: arns[0],
}


ivs.getStreamKey(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data.streamKey);           // successful response
  });

*/