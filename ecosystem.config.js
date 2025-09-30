module.exports = {
  apps: [{
    name: 'jobscooter-production',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3000
    },
    // Production optimizations
    max_memory_restart: '1G',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    
    // Auto restart configuration
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Production settings
    node_args: '--max-old-space-size=1024',
    
    // Health monitoring
    health_check_interval: 30000,
    health_check_grace_period: 10000,
    
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 8000,
    
    // Environment variables for production
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3000,
      // Database
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_PORT: process.env.DB_PORT || 3306,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_NAME: process.env.DB_NAME,
      
      // Security
      JWT_SECRET: process.env.JWT_SECRET,
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
      SESSION_SECRET: process.env.SESSION_SECRET,
      
      // URLs
      BASE_URL: process.env.BASE_URL || 'https://sedap.info',
      FRONTEND_URL: process.env.FRONTEND_URL || 'https://sedap.info',
      API_URL: process.env.API_URL || 'https://sedap.info/api',
      
      // Email
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT || 465,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      SMTP_FROM: process.env.SMTP_FROM,
      
      // CORS
      CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://sedap.info'
    }
  }],

  deploy: {
    production: {
      user: 'sedafzgt',
      host: 'server701.web-hosting.com',
      ref: 'origin/main',
      repo: 'git@github.com:jobscooter/jobscooter-platform.git',
      path: '/home/sedafzgt/jobscooter-production',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci --only=production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};