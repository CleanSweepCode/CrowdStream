
var AWS = require('aws-sdk');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.get('/check', (req, res) => {
  res.send('Checking API!')
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
});

AWS.config.update({
  "name": "User1",
  "region": "eu-west-1",
  "output": "json",
  "accessKeyId": "AKIAWRICLM5PTUDKRNTH",
  "secretAccessKey": "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"
});

const ivs = new AWS.IVS();

async function getChannelArn(channelName) {
  // Given a channel name, return ARN
  try {
    let nextToken = undefined;
    do {
      const channels = await ivs.listChannels({ nextToken }).promise();
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

async function deleteChannelARN(channelARN, res) {
  const params = {
    arn: channelARN
  };

  try {
    const response = await ivs.deleteChannel(params).promise();
    console.log('Channel deleted successfully:', response);
    res.json({ success: true, message: 'Channel deleted successfully', data: response });
  } catch (error) {
    console.error('Error deleting channel:', error);
    res.status(500).json({ success: false, message: 'Error deleting channel', error: error.message });
  }

}

app.get('/channels/list', (req, res) => {
  console.log('Listing channels');
  ivs.listChannels({}, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to list channels' });
    } else {
      res.json(data.channels);
    }
  });
});

// Define a new route to add a tag to a channel
app.post('/channels/tagByName', async (req, res) => {
  console.log(req.body);
  const channelArn = await getChannelArn(req.body.channelName);
  const tags = req.body.tags;

  const params = {
    resourceArn: channelArn,
    tags: tags
  };

  try {
    const response = await ivs.tagResource(params).promise();
    console.log('Channel tagged successfully:', response);
    res.json({ success: true, message: 'Channel tagged successfully', data: response });
  } catch (error) {
    console.error('Error tagging channel:', error);
    res.status(500).json({ success: false, message: 'Error tagging channel', error: error.message });
  }
});



// Untag channel
app.post('/channels/untagByName', async (req, res) => {
  const channelArn = await getChannelArn(req.body.channelName);
  const tagKeys = req.body.tagKeys;

  const params = {
    resourceArn: channelArn,
    tagKeys: tagKeys
  };

  try {
    const response = await ivs.untagResource(params).promise();
    console.log('Tags removed from channel successfully:', response);
    res.json({ success: true, message: 'Tags removed from channel successfully', data: response });
  } catch (error) {
    console.error('Error removing tags from channel:', error);
    res.status(500).json({ success: false, message: 'Error removing tags from channel', error: error.message });
  }
});


// Delete channel by name
app.post('/channels/deleteByName', async (req, res) => {
  const channelName = req.body.channelName;
  const channelArn = await getChannelArn(channelName);
  if (!channelArn) {
    console.error('Channel not found:', channelName);
    res.status(500).json({ success: false, message: 'Channel not found' });
    return;
  }
  deleteChannelARN(channelArn, res);
});