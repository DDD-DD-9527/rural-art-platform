@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 乡村艺术平台 - 简化部署脚本 (Windows版本)
REM 适用于阿里云ECS + 宝塔面板环境

set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM 日志函数
:log_info
echo %BLUE%[INFO]%NC% %~1
goto :eof

:log_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:log_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:log_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM 检查Docker是否安装
:check_docker
call :log_info "检查Docker环境..."
docker --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker未安装，请先安装Docker Desktop"
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker Compose未安装，请先安装Docker Compose"
    pause
    exit /b 1
)

call :log_success "Docker环境检查通过"
goto :eof

REM 停止现有服务
:stop_services
call :log_info "停止现有服务..."
docker-compose -f docker-compose.simple.yml down --remove-orphans 2>nul
call :log_success "服务已停止"
goto :eof

REM 构建和启动服务
:start_services
call :log_info "构建和启动服务..."

REM 构建镜像
call :log_info "构建Docker镜像..."
docker-compose -f docker-compose.simple.yml build --no-cache
if errorlevel 1 (
    call :log_error "镜像构建失败"
    pause
    exit /b 1
)

REM 启动服务
call :log_info "启动服务..."
docker-compose -f docker-compose.simple.yml up -d
if errorlevel 1 (
    call :log_error "服务启动失败"
    pause
    exit /b 1
)

call :log_success "服务启动完成"
goto :eof

REM 等待服务就绪
:wait_for_services
call :log_info "等待服务就绪..."

REM 等待MongoDB
call :log_info "等待MongoDB启动..."
for /l %%i in (1,1,30) do (
    timeout /t 2 /nobreak >nul
    docker-compose -f docker-compose.simple.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" >nul 2>&1
    if not errorlevel 1 (
        call :log_success "MongoDB已就绪"
        goto :wait_backend
    )
)

:wait_backend
REM 等待后端服务
call :log_info "等待后端服务启动..."
for /l %%i in (1,1,30) do (
    timeout /t 2 /nobreak >nul
    curl -f http://localhost:3000/api/health >nul 2>&1
    if not errorlevel 1 (
        call :log_success "后端服务已就绪"
        goto :wait_frontend
    )
)

:wait_frontend
REM 等待前端服务
call :log_info "等待前端服务启动..."
for /l %%i in (1,1,30) do (
    timeout /t 2 /nobreak >nul
    curl -f http://localhost:80 >nul 2>&1
    if not errorlevel 1 (
        call :log_success "前端服务已就绪"
        goto :eof
    )
)
goto :eof

REM 检查服务状态
:check_services
call :log_info "检查服务状态..."

echo === Docker容器状态 ===
docker-compose -f docker-compose.simple.yml ps

echo.
echo === 服务健康检查 ===

REM 检查MongoDB
docker-compose -f docker-compose.simple.yml ps mongodb | findstr "Up" >nul
if not errorlevel 1 (
    call :log_success "MongoDB: 运行中"
) else (
    call :log_error "MongoDB: 未运行"
)

REM 检查后端
curl -f http://localhost:3000/api/health >nul 2>&1
if not errorlevel 1 (
    call :log_success "后端API: 运行中 (http://localhost:3000)"
) else (
    call :log_error "后端API: 无法访问"
)

REM 检查前端
curl -f http://localhost:80 >nul 2>&1
if not errorlevel 1 (
    call :log_success "前端应用: 运行中 (http://localhost:80)"
) else (
    call :log_error "前端应用: 无法访问"
)

REM 检查Nginx
curl -f http://localhost:8080 >nul 2>&1
if not errorlevel 1 (
    call :log_success "Nginx代理: 运行中 (http://localhost:8080)"
    call :log_info "应用访问地址: http://ai-future-rural-art.top:8080"
) else (
    call :log_warning "Nginx代理: 无法访问"
)
goto :eof

REM 显示日志
:show_logs
call :log_info "显示服务日志..."
docker-compose -f docker-compose.simple.yml logs --tail=50
goto :eof

REM 清理资源
:cleanup
call :log_info "清理Docker资源..."
docker-compose -f docker-compose.simple.yml down --remove-orphans
docker system prune -f
call :log_success "清理完成"
goto :eof

REM 主程序
if "%1"=="start" (
    call :check_docker
    call :stop_services
    call :start_services
    call :wait_for_services
    call :check_services
) else if "%1"=="stop" (
    call :stop_services
) else if "%1"=="restart" (
    call :check_docker
    call :stop_services
    call :start_services
    call :wait_for_services
    call :check_services
) else if "%1"=="status" (
    call :check_services
) else if "%1"=="logs" (
    call :show_logs
) else if "%1"=="cleanup" (
    call :cleanup
) else (
    echo 使用方法: %0 {start^|stop^|restart^|status^|logs^|cleanup}
    echo.
    echo 命令说明:
    echo   start   - 启动所有服务
    echo   stop    - 停止所有服务
    echo   restart - 重启所有服务
    echo   status  - 检查服务状态
    echo   logs    - 查看服务日志
    echo   cleanup - 清理Docker资源
    echo.
    echo 示例: %0 start
    pause
    exit /b 1
)

echo.
echo 操作完成！
pause