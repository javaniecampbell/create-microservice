### TODO:
 - Autogenerate `docker-compose.yml`
 - Autogenerate `docker-compose.override.yml`
 - Should support `--docker` flag which indicates docker generation
 - If `--docker` flag is given then it should generate `Dockerfile` per microservice and based on project type eg. `node`, `dotnet`
 - Should support generation of database given a script possible support types are `mssql`, `mongo`, `neo4j` and `postgresql`
 - Should support messaging such as `rabbitmq`
 - Should support generation of swagger documentation json file given a configuration file such as `schema.json`, `endpoints.json` which tells of the supported HTTP verbs `POST | GET | PUT | DELETE | OPTIONS, ETC`
 - Should have a front-end that allows for form input of services configuration files such as `services.json`
 - Should support specifying the port for each service to be exposed or forwarded from containers 
