module.exports = {
  apps: [
    {
      name: "webapp",
      script: "./dist/app.js",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
