const hello = require('./handlers/hello');
const jobLoad = require('./handlers/jobload');
const recipes = require('./handlers/recipes');
const recipeTypes = require('./handlers/recipeTypes');
const recipeDetails = require('./handlers/recipeDetails');
const jobs = require('./handlers/jobs');
const jobTypes = require('./handlers/jobTypes');
const jobDetails = require('./handlers/jobDetails');
const jobTypeDetails = require('./handlers/jobTypeDetails');
const recipeTypeDetails = require('./handlers/recipeTypeDetails');

module.exports = {
    init: function(server) {
        server.route({
            method: 'GET',
            path: '/mocks/hello',
            handler: hello
        });

        server.route({
            method: 'GET',
            path: '/mocks/jobload',
            handler: jobLoad
        });

        server.route({
            method: 'GET',
            path: '/mocks/recipes',
            handler: recipes
        });

        server.route({
            method: 'GET',
            path: '/mocks/recipe-types',
            handler: recipeTypes
        });

        server.route({
            method: 'GET',
            path: '/mocks/recipes/{id}',
            handler: recipeDetails
        });

        server.route({
            method: 'GET',
            path: '/mocks/recipe-types/{id}',
            handler: recipeTypeDetails
        });

        server.route({
            method: 'GET',
            path: '/mocks/jobs',
            handler: jobs
        });

        server.route({
            method: 'GET',
            path: '/mocks/jobs/{id}',
            handler: jobDetails
        });

        server.route({
            method: 'GET',
            path: '/mocks/job-types',
            handler: jobTypes
        });

        server.route({
            method: 'GET',
            path: '/mocks/job-types/{id}',
            handler: jobTypeDetails
        });
    }
}
