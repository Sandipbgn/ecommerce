const swaggerUi = require('swagger-ui-express');
const path = require('path');
const parsePrismaSchema = require('./prisma-schema-parser');
const parseRouteComments = require('./route-comment-parser');

/**
 * Set up Swagger documentation
 */
function setupSwagger(app) {
    // Parse Prisma schema to get models
    const prismaModels = parsePrismaSchema();

    // Parse route comments
    const routesDir = path.join(__dirname, '../routes');
    const { paths, tags } = parseRouteComments(routesDir);

    // Generate schemas section from Prisma models
    const schemas = {};
    Object.keys(prismaModels).forEach(modelName => {
        const model = prismaModels[modelName];
        schemas[modelName] = {
            type: 'object',
            properties: model.properties,
            required: model.required
        };

        // Add special case for register and login
        if (modelName === 'User') {
            schemas['UserRegister'] = {
                type: 'object',
                properties: {
                    name: model.properties.name,
                    email: model.properties.email,
                    password: { type: 'string', format: 'password' }
                },
                required: ['name', 'email', 'password']
            };

            schemas['UserLogin'] = {
                type: 'object',
                properties: {
                    email: model.properties.email,
                    password: { type: 'string', format: 'password' }
                },
                required: ['email', 'password']
            };
        }
    });

    // Create tag definitions
    const tagDefinitions = tags.map(tag => ({
        name: tag,
        description: `Operations related to ${tag}`
    }));

    // Create OpenAPI spec
    const swaggerSpec = {
        openapi: '3.0.0',
        info: {
            title: 'E-Commerce API',
            version: '1.0.0',
            description: 'API documentation for the E-Commerce application'
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3030}`,
                description: 'Development server'
            }
        ],
        tags: tagDefinitions,
        paths,
        components: {
            schemas,
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    };

    // Serve Swagger docs
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`Swagger docs available at http://localhost:${process.env.PORT || 3030}/api-docs`);
}

module.exports = setupSwagger;