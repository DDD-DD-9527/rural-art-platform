module.exports = {
  apps: [{
    name: 'rural-art-platform-backend',
    script: 'server.js',
    instances: 'max', // 使用所有CPU核心
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    // 日志配置
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    
    // 性能配置
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024',
    
    // 自动重启配置
    watch: false, // 生产环境不建议开启
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    
    // 健康检查
    min_uptime: '10s',
    max_restarts: 10,
    
    // 其他配置
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }],
  
  // 部署配置 (可选)
  deploy: {
    production: {
      user: 'root',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'your-git-repo-url',
      path: '/var/www/rural-art-platform',
      'post-deploy': 'npm install --production && pm2 reload ecosystem.config.js --env production'
    }
  }
};