require('../../src/styles/main.scss');

// Load library
H5P = H5P || {};
H5P.HubClient = require('../scripts/hub').default;
H5P.HubServices = require('../scripts/hub-services').default;
H5P.HubServicesFactory = require('../../test/stub/hub-services').default;
