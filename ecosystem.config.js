module.exports = {
  apps: [
    {
      name: 'ticket-backend',
      script: './server.js',
      cwd: './BackEnd',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'ticket-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
