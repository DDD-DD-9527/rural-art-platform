#!/bin/bash

# 乡村艺术平台 - 简化部署脚本
# 适用于阿里云ECS + 宝塔面板环境

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

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    log_success "Docker环境检查通过"
}

# 停止现有服务
stop_services() {
    log_info "停止现有服务..."
    docker-compose -f docker-compose.simple.yml down --remove-orphans || true
    log_success "服务已停止"
}

# 构建和启动服务
start_services() {
    log_info "构建和启动服务..."
    
    # 构建镜像
    log_info "构建Docker镜像..."
    docker-compose -f docker-compose.simple.yml build --no-cache
    
    # 启动服务
    log_info "启动服务..."
    docker-compose -f docker-compose.simple.yml up -d
    
    log_success "服务启动完成"
}

# 等待服务就绪
wait_for_services() {
    log_info "等待服务就绪..."
    
    # 等待MongoDB
    log_info "等待MongoDB启动..."
    for i in {1..30}; do
        if docker-compose -f docker-compose.simple.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
            log_success "MongoDB已就绪"
            break
        fi
        sleep 2
    done
    
    # 等待后端服务
    log_info "等待后端服务启动..."
    for i in {1..30}; do
        if curl -f http://localhost:3000/api/health &> /dev/null; then
            log_success "后端服务已就绪"
            break
        fi
        sleep 2
    done
    
    # 等待前端服务
    log_info "等待前端服务启动..."
    for i in {1..30}; do
        if curl -f http://localhost:80 &> /dev/null; then
            log_success "前端服务已就绪"
            break
        fi
        sleep 2
    done
}

# 检查服务状态
check_services() {
    log_info "检查服务状态..."
    
    echo "=== Docker容器状态 ==="
    docker-compose -f docker-compose.simple.yml ps
    
    echo "\n=== 服务健康检查 ==="
    
    # 检查MongoDB
    if docker-compose -f docker-compose.simple.yml ps mongodb | grep -q "Up"; then
        log_success "MongoDB: 运行中"
    else
        log_error "MongoDB: 未运行"
    fi
    
    # 检查后端
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        log_success "后端API: 运行中 (http://localhost:3000)"
    else
        log_error "后端API: 无法访问"
    fi
    
    # 检查前端
    if curl -f http://localhost:80 &> /dev/null; then
        log_success "前端应用: 运行中 (http://localhost:80)"
    else
        log_error "前端应用: 无法访问"
    fi
    
    # 检查Nginx
    if curl -f http://localhost:8080 &> /dev/null; then
        log_success "Nginx代理: 运行中 (http://localhost:8080)"
        log_info "应用访问地址: http://your-domain.com:8080"
    else
        log_warning "Nginx代理: 无法访问"
    fi
}

# 显示日志
show_logs() {
    log_info "显示服务日志..."
    docker-compose -f docker-compose.simple.yml logs --tail=50
}

# 清理资源
cleanup() {
    log_info "清理Docker资源..."
    docker-compose -f docker-compose.simple.yml down --remove-orphans
    docker system prune -f
    log_success "清理完成"
}

# 主函数
main() {
    case "$1" in
        "start")
            check_docker
            stop_services
            start_services
            wait_for_services
            check_services
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            check_docker
            stop_services
            start_services
            wait_for_services
            check_services
            ;;
        "status")
            check_services
            ;;
        "logs")
            show_logs
            ;;
        "cleanup")
            cleanup
            ;;
        *)
            echo "使用方法: $0 {start|stop|restart|status|logs|cleanup}"
            echo ""
            echo "命令说明:"
            echo "  start   - 启动所有服务"
            echo "  stop    - 停止所有服务"
            echo "  restart - 重启所有服务"
            echo "  status  - 检查服务状态"
            echo "  logs    - 查看服务日志"
            echo "  cleanup - 清理Docker资源"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"