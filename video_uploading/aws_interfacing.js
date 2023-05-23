
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
  

function deleteChannel(arn) {
  const params = {
    arn, // ARN of the channel
  };
  return new Promise((resolve, reject) => {
    ivs.deleteChannel(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

const tagChannel = async (channelArn, tags) => {
  const params = {
    resourceArn: channelArn,
    tags: tags
  };

  try {
    const response = await ivs.tagResource(params).promise();
    console.log('Channel tagged successfully:', response);
  } catch (error) {
    console.error('Error tagging channel:', error);
  }
};

const untagChannel = async (channelArn, tagKeys) => {
  const params = {
    resourceArn: channelArn,
    tagKeys: tagKeys
  };

  try {
    const response = await ivs.untagResource(params).promise();
    console.log('Tags removed from channel successfully:', response);
  } catch (error) {
    console.error('Error removing tags from channel:', error);
  }
};


async function getChannelArn(channelName) {
  try {
    let nextToken = undefined;
    do {
      const channels = await ivs.listChannels({nextToken}).promise();
      for (const channel of channels.channels) {
        if (channel.name === channelName) {
          return channel.arn;
        }
      }
      nextToken = channels.nextToken;
    } while (nextToken);
  } catch (error) {
    console.error('Failed to get channel ARN:', error);
  }
  return null;
}

async function deleteChannelByName(channelName) {
  try {
    const channelArn = await getChannelArn(channelName);
    if (!channelArn) {
      console.error('Channel not found:', channelName);
      return;
    }
    const response = await ivs.deleteChannel({ arn: channelArn }).promise();
    console.log('Channel deleted:', channelName);
    return response;
  } catch (error) {
    console.error('Failed to delete channel:', error);
  }
}




async function main() {

  // Create channel 1
  // createChannel('Channel1Test', 'BASIC')
  // .then(data => console.log(data)) // successful response
  // .catch(err => console.error(err)); // an error occurred

  // // Create channel 2
  // createChannel('Channel 2 Test', 'BASIC')
  // .then(data => console.log(data)) // successful response
  // .catch(err => console.error(err)); // an error occurred

  // // Create channel 3
  // createChannel('Channel 3 Test', 'BASIC')
  // .then(data => console.log(data)) // successful response
  // .catch(err => console.error(err)); // an error occurred


  try {
    // Lists existing channels' names and tags (pulls ARN's too)
    var channels = await listChannels();
    var arns = channels.map(channel => channel.arn);
    var names = channels.map(channel => channel.name);
    var tags = channels.map(channel => channel.tags)
    // console.log(arns);
    console.log(names);
    console.log(tags);

    tags = {
      tagKey1: 'test tag',
      tagKey2: 'test tag 2'
    }
    //Tag's channel 0 with above tags
    tagChannel(arns[0], tags)

    // List channels again
    var channels = await listChannels();
    var names = channels.map(channel => channel.name);
    var tags = channels.map(channel => channel.tags)
    // console.log(arns);
    console.log(names);
    console.log(tags);

    tagKeys = ['tagKey1', 'tagKey2']

    untagChannel(arns[0], tagKeys)

    var channels = await listChannels();
    var arns = channels.map(channel => channel.arn);
    var names = channels.map(channel => channel.name);
    var tags = channels.map(channel => channel.tags)
    // console.log(arns);
    console.log(names);
    console.log(tags);



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

  deleteChannelByName('Channel1Test');
  
  try {
    var channels = await listChannels();
    var arns = channels.map(channel => channel.arn);
    // console.log(arns);
    // console.log(channels);
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