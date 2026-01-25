module.exports = {
  apps: [
    {
      name: 'ticket-marketplace-backend',
      script: 'server.js',
      cwd: './BackEnd',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        MONGO_CONN: 'mongodb://tixtradershub_db_user:z15sHkrnogFnAlNF@ac-ijllovy-shard-00-00.zjs6hto.mongodb.net:27017,ac-ijllovy-shard-00-01.zjs6hto.mongodb.net:27017,ac-ijllovy-shard-00-02.zjs6hto.mongodb.net:27017/ticket_exchange?ssl=true&authSource=admin&appName=TicketMarket',
        JWT_SECRET: 'supersecretkey123'
      }
    }
  ]
};
