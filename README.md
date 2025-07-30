### LivestreamApp
This is the front-end repo for the CrowdStream MVP. We host crowdsourced event livestreams. 

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
