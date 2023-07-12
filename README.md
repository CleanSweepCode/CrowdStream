#Clean Sweep Code - CrowdShare

Frontend MVP of decentralised livestream webapp.

[livestream-app-swart.vercel.app](livestream-app-swart.vercel.app)

The frontend website is written in React JS, and the server is hosted on AWS (with Vercel as a wrapper). Video streaming is managed using the Amazon IVS API.

The website's backend nodeJS server is hosted on Google cloud. The following link should show "Hello World Google Cloud Integration!":

https://livestreamapp-backend-7r4nlien6a-od.a.run.app/

If "Hello World Google Cloud Integration!" doesn't appear at the link above, the nodeJS server needs to be restarted. This can be done either locally or via Google Cloud by cloning the LivestreamApp-Backend repo and running `node aws_interfacing.js`.

### Getting Started (as a Developer)
Clone this repo and open in your code editor.

From the LiveStream directory, run `npm install` to install relevant modules. 

Then, run `npm start`. This opens a local version of the website which will auto-update as you make changes to the code. 

To update the live Vercel website, simply push your changes to the LiveStreamApp repo. 
