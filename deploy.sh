#!/bin/bash

# 乡村艺术平台部署脚本
# 使用方法: ./deploy.sh [环境] [操作]
# 环境: dev|prod
# 操作: build|up|down|restart|logs

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

# 检查Docker和Docker Compose
check_requirements() {
    log_info "检查系统要求..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    log_success "系统要求检查通过"
}

# 环境检查
check_env() {
    local env=$1
    
    if [ "$env" = "prod" ]; then
        if [ ! -f "backend/.env" ]; then
            log_warning "生产环境配置文件不存在，从模板创建..."
            cp backend/.env.example backend/.env
            log_warning "请编辑 backend/.env 文件配置生产环境参数"
            read -p "是否继续部署？(y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi
}

# 构建镜像
build_images() {
    local env=$1
    
    log_info "构建Docker镜像..."
    
    if [ "$env" = "dev" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
    else
        docker-compose build
    fi
    
    log_success "镜像构建完成"
}

# 启动服务
start_services() {
    local env=$1
    
    log_info "启动服务..."
    
    if [ "$env" = "dev" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    else
        docker-compose up -d
    fi
    
    log_success "服务启动完成"
    
    # 等待服务就绪
    log_info "等待服务就绪..."
    sleep 10
    
    # 检查服务状态
    check_services
}

# 停止服务
stop_services() {
    local env=$1
    
    log_info "停止服务..."
    
    if [ "$env" = "dev" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    else
        docker-compose down
    fi
    
    log_success "服务已停止"
}

# 重启服务
restart_services() {
    local env=$1
    
    log_info "重启服务..."
    stop_services $env
    start_services $env
}

# 查看日志
view_logs() {
    local env=$1
    local service=$2
    
    if [ "$env" = "dev" ]; then
        if [ -n "$service" ]; then
            docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f $service
        else
            docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
        fi
    else
        if [ -n "$service" ]; then
            docker-compose logs -f $service
        else
            docker-compose logs -f
        fi
    fi
}

# 检查服务状态
check_services() {
    log_info "检查服务状态..."
    
    # 检查MongoDB
    if docker-compose ps mongodb | grep -q "Up"; then
        log_success "MongoDB: 运行中"
    else
        log_error "MongoDB: 未运行"
    fi
    
    # 检查后端
    if docker-compose ps backend | grep -q "Up"; then
        log_success "后端服务: 运行中"
        # 健康检查
        if curl -f http://localhost:3000/health &> /dev/null; then
            log_success "后端健康检查: 通过"
        else
            log_warning "后端健康检查: 失败"
        fi
    else
        log_error "后端服务: 未运行"
    fi
    
    # 检查前端
    if docker-compose ps frontend | grep -q "Up"; then
        log_success "前端服务: 运行中"
    else
        log_error "前端服务: 未运行"
    fi
    
    # 检查Nginx
    if docker-compose ps nginx | grep -q "Up"; then
        log_success "Nginx: 运行中"
        log_info "应用访问地址: http://localhost:8080"
    else
        log_warning "Nginx: 未运行"
    fi
}

# 清理资源
cleanup() {
    log_info "清理Docker资源..."
    
    # 停止并删除容器
    docker-compose down --remove-orphans
    
    # 删除未使用的镜像
    docker image prune -f
    
    # 删除未使用的卷（谨慎使用）
    read -p "是否删除未使用的数据卷？这将删除数据库数据！(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f
        log_warning "数据卷已清理"
    fi
    
    log_success "清理完成"
}

# 备份数据
backup_data() {
    log_info "备份数据库..."
    
    local backup_dir="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $backup_dir
    
    # 备份MongoDB
    docker-compose exec -T mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/rural-art-platform?authSource=admin" --out=/tmp/backup
    docker cp $(docker-compose ps -q mongodb):/tmp/backup $backup_dir/mongodb
    
    # 备份上传文件
    docker cp $(docker-compose ps -q backend):/app/uploads $backup_dir/uploads
    
    log_success "数据备份完成: $backup_dir"
}

# 显示帮助信息
show_help() {
    echo "乡村艺术平台部署脚本"
    echo ""
    echo "使用方法:"
    echo "  $0 [环境] [操作] [服务]"
    echo ""
    echo "环境:"
    echo "  dev   - 开发环境"
    echo "  prod  - 生产环境"
    echo ""
    echo "操作:"
    echo "  build   - 构建镜像"
    echo "  up      - 启动服务"
    echo "  down    - 停止服务"
    echo "  restart - 重启服务"
    echo "  logs    - 查看日志"
    echo "  status  - 检查状态"
    echo "  backup  - 备份数据"
    echo "  cleanup - 清理资源"
    echo ""
    echo "服务 (可选):"
    echo "  mongodb  - MongoDB数据库"
    echo "  backend  - 后端API服务"
    echo "  frontend - 前端应用"
    echo "  nginx    - Nginx代理"
    echo ""
    echo "示例:"
    echo "  $0 dev up          # 启动开发环境"
    echo "  $0 prod build      # 构建生产环境镜像"
    echo "  $0 dev logs backend # 查看后端日志"
}

# 主函数
main() {
    local env=${1:-dev}
    local action=${2:-up}
    local service=$3
    
    # 检查参数
    if [ "$1" = "help" ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_help
        exit 0
    fi
    
    if [ "$env" != "dev" ] && [ "$env" != "prod" ]; then
        log_error "无效的环境参数: $env"
        show_help
        exit 1
    fi
    
    # 检查系统要求
    check_requirements
    
    # 检查环境配置
    check_env $env
    
    # 执行操作
    case $action in
        build)
            build_images $env
            ;;
        up)
            build_images $env
            start_services $env
            ;;
        down)
            stop_services $env
            ;;
        restart)
            restart_services $env
            ;;
        logs)
            view_logs $env $service
            ;;
        status)
            check_services
            ;;
        backup)
            backup_data
            ;;
        cleanup)
            cleanup
            ;;
        *)
            log_error "无效的操作: $action"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"