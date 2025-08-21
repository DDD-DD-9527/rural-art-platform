#!/bin/bash

# 乡村艺术平台 - 宝塔面板一键部署脚本
# 适用于直接拉取代码或上传压缩包的部署方式

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 项目配置
PROJECT_NAME="rural-art-platform"
DOMAIN="ai-future-rural-art.top"
PROJECT_DIR="/www/wwwroot/${DOMAIN}"
BACKUP_DIR="/www/backup/${PROJECT_NAME}"

# 检查是否为root用户
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "检测到root用户，建议使用普通用户运行此脚本"
    fi
}

# 检查宝塔面板环境
check_baota_env() {
    log_info "检查宝塔面板环境..."
    
    if [ ! -d "/www/server" ]; then
        log_error "未检测到宝塔面板，请先安装宝塔面板"
        exit 1
    fi
    
    log_success "宝塔面板环境检查通过"
}

# 检查Docker环境
check_docker() {
    log_info "检查Docker环境..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请在宝塔面板中安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请在宝塔面板中安装Docker Compose"
        exit 1
    fi
    
    # 检查Docker服务状态
    if ! systemctl is-active --quiet docker; then
        log_info "启动Docker服务..."
        systemctl start docker
    fi
    
    log_success "Docker环境检查通过"
}

# 创建项目目录
setup_project_dir() {
    log_info "设置项目目录..."
    
    # 创建备份目录
    mkdir -p "$BACKUP_DIR"
    
    # 如果项目目录存在，先备份
    if [ -d "$PROJECT_DIR" ]; then
        log_info "备份现有项目..."
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
        cp -r "$PROJECT_DIR" "$BACKUP_DIR/$BACKUP_NAME"
        log_success "项目已备份到: $BACKUP_DIR/$BACKUP_NAME"
    fi
    
    # 创建项目目录
    mkdir -p "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    
    log_success "项目目录设置完成: $PROJECT_DIR"
}

# 获取项目代码
get_project_code() {
    log_info "获取项目代码..."
    
    echo "请选择代码获取方式:"
    echo "1) Git拉取 (推荐)"
    echo "2) 手动上传压缩包"
    read -p "请输入选择 (1-2): " choice
    
    case $choice in
        1)
            get_code_from_git
            ;;
        2)
            get_code_from_upload
            ;;
        *)
            log_error "无效选择"
            exit 1
            ;;
    esac
}

# 从Git获取代码
get_code_from_git() {
    log_info "从Git仓库获取代码..."
    
    # 检查git是否安装
    if ! command -v git &> /dev/null; then
        log_error "Git未安装，请先安装Git"
        exit 1
    fi
    
    # 获取仓库地址
    read -p "请输入Git仓库地址: " repo_url
    read -p "请输入分支名称 (默认: develop): " branch
    branch=${branch:-develop}
    
    # 清空目录
    rm -rf "$PROJECT_DIR"/*
    
    # 克隆代码
    git clone -b "$branch" "$repo_url" "$PROJECT_DIR"
    
    log_success "代码获取完成"
}

# 从上传的压缩包获取代码
get_code_from_upload() {
    log_info "从压缩包获取代码..."
    
    echo "请将项目压缩包上传到: $PROJECT_DIR"
    echo "支持的格式: .zip, .tar.gz, .tar.bz2"
    read -p "上传完成后按回车继续..."
    
    # 查找压缩包
    archive_file=$(find "$PROJECT_DIR" -maxdepth 1 -name "*.zip" -o -name "*.tar.gz" -o -name "*.tar.bz2" | head -1)
    
    if [ -z "$archive_file" ]; then
        log_error "未找到压缩包文件"
        exit 1
    fi
    
    log_info "找到压缩包: $archive_file"
    
    # 解压文件
    case "$archive_file" in
        *.zip)
            unzip -q "$archive_file" -d "$PROJECT_DIR"
            ;;
        *.tar.gz)
            tar -xzf "$archive_file" -C "$PROJECT_DIR"
            ;;
        *.tar.bz2)
            tar -xjf "$archive_file" -C "$PROJECT_DIR"
            ;;
    esac
    
    # 删除压缩包
    rm "$archive_file"
    
    # 如果解压后有子目录，移动文件到根目录
    subdir=$(find "$PROJECT_DIR" -maxdepth 1 -type d ! -path "$PROJECT_DIR" | head -1)
    if [ -n "$subdir" ] && [ "$(ls -A "$subdir")" ]; then
        mv "$subdir"/* "$PROJECT_DIR"/
        rmdir "$subdir"
    fi
    
    log_success "代码解压完成"
}

# 配置环境变量
setup_environment() {
    log_info "配置环境变量..."
    
    # 检查环境变量文件
    if [ ! -f ".env" ]; then
        log_warning "未找到.env文件，创建默认配置"
        cat > .env << EOF
# 前端配置
VITE_DEV_SERVER_PORT=5713
VITE_API_BASE_URL=http://localhost:3000/api
VITE_PRODUCTION_DOMAIN=https://${DOMAIN}
EOF
    fi
    
    if [ ! -f "backend/.env" ]; then
        log_warning "未找到backend/.env文件，创建默认配置"
        mkdir -p backend
        cat > backend/.env << EOF
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置
MONGODB_URI=mongodb://admin:password123@mongodb:27017/rural-art-platform?authSource=admin

# JWT配置
JWT_SECRET=your-production-jwt-secret-key-change-this
JWT_EXPIRES_IN=7d

# 文件上传配置
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=10485760

# AI服务配置 (可选)
# OPENAI_API_KEY=your-openai-api-key
# OPENAI_BASE_URL=https://api.openai.com/v1
EOF
    fi
    
    # 更新域名配置
    sed -i "s|VITE_PRODUCTION_DOMAIN=.*|VITE_PRODUCTION_DOMAIN=https://${DOMAIN}|g" .env
    
    log_success "环境变量配置完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请在宝塔面板中安装Node.js"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm未安装"
        exit 1
    fi
    
    # 安装前端依赖
    log_info "安装前端依赖..."
    npm install
    
    # 安装后端依赖
    log_info "安装后端依赖..."
    cd backend
    npm install
    cd ..
    
    log_success "依赖安装完成"
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    # 构建前端
    log_info "构建前端项目..."
    npm run build
    
    log_success "项目构建完成"
}

# 停止现有服务
stop_services() {
    log_info "停止现有服务..."
    
    if [ -f "docker-compose.simple.yml" ]; then
        docker-compose -f docker-compose.simple.yml down --remove-orphans 2>/dev/null || true
    fi
    
    # 清理未使用的容器和镜像
    docker system prune -f 2>/dev/null || true
    
    log_success "服务停止完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 检查docker-compose文件
    if [ ! -f "docker-compose.simple.yml" ]; then
        log_error "未找到docker-compose.simple.yml文件"
        exit 1
    fi
    
    # 构建并启动服务
    docker-compose -f docker-compose.simple.yml up -d --build
    
    log_success "服务启动完成"
}

# 等待服务就绪
wait_for_services() {
    log_info "等待服务启动..."
    
    # 等待后端服务
    for i in {1..30}; do
        if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            log_success "后端服务已就绪"
            break
        fi
        if [ $i -eq 30 ]; then
            log_warning "后端服务启动超时，请检查日志"
        fi
        sleep 2
    done
    
    # 等待前端服务
    for i in {1..30}; do
        if curl -s http://localhost:80 > /dev/null 2>&1; then
            log_success "前端服务已就绪"
            break
        fi
        if [ $i -eq 30 ]; then
            log_warning "前端服务启动超时，请检查日志"
        fi
        sleep 2
    done
}

# 检查服务状态
check_services() {
    log_info "检查服务状态..."
    
    echo "=== Docker容器状态 ==="
    docker-compose -f docker-compose.simple.yml ps
    
    echo "\n=== 服务访问地址 ==="
    echo "前端访问: http://${DOMAIN} 或 http://localhost"
    echo "后端API: http://${DOMAIN}/api 或 http://localhost:3000/api"
    echo "数据库: mongodb://localhost:27017"
    
    echo "\n=== 服务健康检查 ==="
    
    # 检查后端健康状态
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "后端服务正常"
    else
        log_error "后端服务异常"
    fi
    
    # 检查前端服务
    if curl -s http://localhost:80 > /dev/null 2>&1; then
        log_success "前端服务正常"
    else
        log_error "前端服务异常"
    fi
    
    # 检查数据库连接
    if docker exec rural-art-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        log_success "数据库连接正常"
    else
        log_error "数据库连接异常"
    fi
}

# 显示日志
show_logs() {
    log_info "显示服务日志..."
    
    echo "=== 最近的服务日志 ==="
    docker-compose -f docker-compose.simple.yml logs --tail=50
}

# 配置防火墙
setup_firewall() {
    log_info "配置防火墙..."
    
    # 检查宝塔面板防火墙
    if command -v bt &> /dev/null; then
        log_info "请在宝塔面板中开放以下端口:"
        echo "- 80 (HTTP)"
        echo "- 443 (HTTPS)"
        echo "- 3000 (后端API，可选)"
    else
        # 使用系统防火墙
        if command -v ufw &> /dev/null; then
            ufw allow 80/tcp
            ufw allow 443/tcp
            ufw allow 3000/tcp
            log_success "防火墙配置完成"
        elif command -v firewall-cmd &> /dev/null; then
            firewall-cmd --permanent --add-port=80/tcp
            firewall-cmd --permanent --add-port=443/tcp
            firewall-cmd --permanent --add-port=3000/tcp
            firewall-cmd --reload
            log_success "防火墙配置完成"
        fi
    fi
}

# 主函数
main() {
    echo "=================================="
    echo "  乡村艺术平台 - 宝塔面板部署脚本"
    echo "=================================="
    echo ""
    
    check_root
    check_baota_env
    check_docker
    setup_project_dir
    get_project_code
    setup_environment
    install_dependencies
    build_project
    stop_services
    start_services
    wait_for_services
    check_services
    setup_firewall
    
    echo ""
    echo "=================================="
    log_success "部署完成！"
    echo "=================================="
    echo ""
    echo "访问地址:"
    echo "- 前端: http://${DOMAIN}"
    echo "- 后端API: http://${DOMAIN}/api"
    echo ""
    echo "管理命令:"
    echo "- 查看日志: docker-compose -f docker-compose.simple.yml logs -f"
    echo "- 重启服务: docker-compose -f docker-compose.simple.yml restart"
    echo "- 停止服务: docker-compose -f docker-compose.simple.yml down"
    echo ""
    echo "如需帮助，请查看部署文档或联系技术支持。"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi