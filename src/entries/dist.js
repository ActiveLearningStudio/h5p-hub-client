require('../../src/styles/main.scss');

// Load library
H5P = H5P || {};
H5P.HubClient = require('../scripts/hub').default;
H5P.HubClient.renderErrorMessage = require('../scripts/utils/errors').default;
