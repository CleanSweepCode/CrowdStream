// Create React Component 'IVSManager'
// Purpose: Manage IVS Stream

import React from 'react';
import { IVS } from 'aws-sdk';
import AWS from 'aws-sdk';

export const IVSManager = () => {
    const config = {
        "name": "User1",
        "region": "eu-west-1",
        "output": "json",
        "accessKeyId": "AKIAWRICLM5PTUDKRNTH",
        "secretAccessKey": "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"
    }
    console.log("in IVSManager");
    AWS.config.update(config);

    var ivs = new IVS({ region: 'eu-west-1' });
    console.log('ivs created.', ivs);
}

