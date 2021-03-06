process = require('process');
import GraphQLStoreChangeEmitter from 'react-relay/lib/GraphQLStoreChangeEmitter';
import IsomorphicRouter from 'isomorphic-relay-router';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Relay from 'react-relay';
import {match, RoutingContext} from 'react-router';
import CLI from 'commander';
import _ from 'lodash';

import routes from './react/config/routes';

CLI
    .option('-p, --path <s>', 'The current path.')
    .option('-h, --host <s>', 'The host of the GraphQL server.')
    .parse(process.argv);

Relay.injectNetworkLayer(new Relay.DefaultNetworkLayer(CLI.host + '/graphql'));

GraphQLStoreChangeEmitter.injectBatchingStrategy(_.noop);

function throwError(msg){
    console.error(msg);
    process.exit(1);
}

function renderResponse(obj){
    console.log('<-><-><-><-><-><-><-><-><->');
    console.log(JSON.stringify(obj));
}

match({routes, location: CLI.path}, (error, redirectLocation, renderProps) => {
    var obj;

    if (error) {
        throwError(error);
    } else if (redirectLocation) {
        obj = {
            status: 302,
            headers: {
                location: redirectLocation.pathname + redirectLocation.search
            },
            body: 'Redirecting'
        };
        renderResponse(obj);
    } else if (renderProps) {
        IsomorphicRouter.prepareData(renderProps).then(render, throwError)
    } else {
        obj = {
            status: 404,
            body: 'Not Found'
        };
        renderResponse(obj);
    }

    function render(data) {
        const reactOutput = ReactDOMServer.renderToString(
            <IsomorphicRouter.RoutingContext {...renderProps} />
        );
        obj = {
            status: 200,
            scripts: [
                { id: 'preloadedData', type: 'application/json', _: data }
            ],
            body: reactOutput
        };
        renderResponse(obj);
    }
});

