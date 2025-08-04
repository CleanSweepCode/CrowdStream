<p align="center">
  <img src="https://github.com/user-attachments/assets/475a1aeb-cd66-4d30-9dda-95c88230f7fc" width="25%" style="margin-right: 20px;">
  <img src="https://github.com/user-attachments/assets/4e1a00ae-804f-441c-8c0f-b7d53930cc3f" width="25%">
</p>


This is the front-end repo for the <b><span style="color:black">Crowd</span><span style="color:red">Stream</span></b> MVP. We host crowdsourced event livestreams. 

### Current Tech Stack (2023-07-12)
The frontend website is written in React JS, and is hosted on vercel. The backend server (ie. nodeJS) is hosted on Google Cloud Platform which makes calls to AWS. Video streaming is managed using the Amazon IVS API.

The website's backend nodeJS server is hosted on Google cloud. The following link should show "Hello World Google Cloud Integration!":

[https://livestreamapp-backend-qihkgbi3xa-od.a.run.app](https://livestreamapp-backend-qihkgbi3xa-od.a.run.app)

If "Hello World Google Cloud Integration!" doesn't appear at the link above, the nodeJS server needs to be restarted. This can be done either via Google Cloud or locally by cloning the private backend repo and running `node aws_interfacing.js`.

### Getting Started (as a Developer)
Clone this repo and open in your code editor.

From the LiveStream directory, run `npm install` to install relevant modules. 

Then, run `npm start`. This opens a local version of the website which will auto-update as you make changes to the code. 

To update the live website, simply push your changes to this repo. 

### System overview

[![](https://mermaid.ink/img/pako:eNptkT1rwzAQhv-KuKmFZPLmQgc7USi4FOLWi5RBtc6OqC0FVUopIf-9skSdGrqd3nt0731coDUSIYfeitORvG4euCakdhbFiJb9BgeyXpNGSTQheCQFe2rqQ0SLZabOWJ2Rwrcf6P4AL5pYbI2VSvcEtYwsZdszaldYJXtMMJ3g_Uwq3aWyO1aJ8V2KRO0mqqTkbV_Fbm4-SYxfSppGyZYNlpRxKAfjJbVGO3JX0nsOqW5Jl2zVBFuHQcGvsIP_5q1Ypc43AlYQtjUKJcNKLxPPwR1xRA55CCV2wg-OA9fXgArvTP2tW8id9bgCf5LBbqNEOMYIeSeGz1ndSuWMnUWMz-d0u3jC6w-fPowK?type=png)](https://mermaid.live/edit#pako:eNptkT1rwzAQhv-KuKmFZPLmQgc7USi4FOLWi5RBtc6OqC0FVUopIf-9skSdGrqd3nt0731coDUSIYfeitORvG4euCakdhbFiJb9BgeyXpNGSTQheCQFe2rqQ0SLZabOWJ2Rwrcf6P4AL5pYbI2VSvcEtYwsZdszaldYJXtMMJ3g_Uwq3aWyO1aJ8V2KRO0mqqTkbV_Fbm4-SYxfSppGyZYNlpRxKAfjJbVGO3JX0nsOqW5Jl2zVBFuHQcGvsIP_5q1Ypc43AlYQtjUKJcNKLxPPwR1xRA55CCV2wg-OA9fXgArvTP2tW8id9bgCf5LBbqNEOMYIeSeGz1ndSuWMnUWMz-d0u3jC6w-fPowK)

### Backend API

Table of functions:

| Function | Inputs | Outputs | Description |
| -------- | ------ | ------- | ----------- |
| `check` | | `string` | Check if the server is alive. |
| `channels/markinactive` | `{channelName: <>}` | | Mark a channel as inactive| 
| `channels/markactive` | `{channelName: <>}` | | Mark a channel as active|
| `channels/list` | | [[Channel](https://docs.aws.amazon.com/ivs/latest/LowLatencyAPIReference/API_ChannelSummary.html), ...] | List all channels |
| `channels/getByArn?channelArn=${arn}` | `string` | [Channel](https://docs.aws.amazon.com/ivs/latest/LowLatencyAPIReference/API_ChannelSummary.html) | Get channel by ARN |
| `channels/tagByName` | `{channelName: <>, tags: {<>}}` | Tag a channel |
| `channels/untagByName` | `{channelName: <>, tagKeys: [<>]}` | | Untag a channel |
| `channels/deleteByName` |  `{channelName: <>}` | | Delete a channel |
| `channels/streamLinkByName` | `{channelName: <>}` | `string` | Stream link of a channel (either active or past)|
| `channels/new` | `{tags: {<>}}` | [Channel](https://docs.aws.amazon.com/ivs/latest/LowLatencyAPIReference/API_ChannelSummary.html) | Create new channel with (optional) tags* |

#### Channel creation tags

The following tags are supported for channel creation:
```json
    {
        "latitude": float,
        "longitude": float,
        "active": string,
        "recording": string,
    }
```

- `latitude` and `longitude` are the GPS positions as floats.
- `active` is a string, `preparing`, `active` or `false` depending on the channel's status.
- `recording` is an optional string. If `true`, will save recording to S3 bucket on completion.


### Lambda function

Lambda function in [this folder](https://github.com/CleanSweepCode/LivestreamApp-backend/tree/main/lambda_func). Follow the steps in its readme to build the code onto our Lambda function on AWS.
