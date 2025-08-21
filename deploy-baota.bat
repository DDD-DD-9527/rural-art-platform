@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 乡村艺术平台 - 宝塔面板一键部署脚本 (Windows版)
REM 适用于直接拉取代码或上传压缩包的部署方式

REM 颜色定义
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM 项目配置
set "PROJECT_NAME=rural-art-platform"
set "DOMAIN=ai-future-rural-art.top"
set "PROJECT_DIR=C:\BtSoft\wwwroot\%DOMAIN%"
set "BACKUP_DIR=C:\BtSoft\backup\%PROJECT_NAME%"

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

REM 检查管理员权限
:check_admin
net session >nul 2>&1
if %errorLevel% == 0 (
    call :log_warning "检测到管理员权限，建议使用普通用户运行此脚本"
) else (
    call :log_info "当前为普通用户权限"
)
goto :eof

REM 检查宝塔面板环境
:check_baota_env
call :log_info "检查宝塔面板环境..."

if not exist "C:\BtSoft" (
    call :log_error "未检测到宝塔面板，请先安装宝塔面板"
    pause
    exit /b 1
)

call :log_success "宝塔面板环境检查通过"
goto :eof

REM 检查Docker环境
:check_docker
call :log_info "检查Docker环境..."

docker --version >nul 2>&1
if %errorLevel% neq 0 (
    call :log_error "Docker未安装，请在宝塔面板中安装Docker"
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorLevel% neq 0 (
    call :log_error "Docker Compose未安装，请在宝塔面板中安装Docker Compose"
    pause
    exit /b 1
)

REM 检查Docker服务状态
sc query docker >nul 2>&1
if %errorLevel% neq 0 (
    call :log_info "启动Docker服务..."
    net start docker
)

call :log_success "Docker环境检查通过"
goto :eof

REM 创建项目目录
:setup_project_dir
call :log_info "设置项目目录..."

REM 创建备份目录
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM 如果项目目录存在，先备份
if exist "%PROJECT_DIR%" (
    call :log_info "备份现有项目..."
    for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
    set "BACKUP_NAME=backup-%dt:~0,8%-%dt:~8,6%"
    xcopy "%PROJECT_DIR%" "%BACKUP_DIR%\!BACKUP_NAME!\" /E /I /H /Y >nul
    call :log_success "项目已备份到: %BACKUP_DIR%\!BACKUP_NAME!"
)

REM 创建项目目录
if not exist "%PROJECT_DIR%" mkdir "%PROJECT_DIR%"
cd /d "%PROJECT_DIR%"

call :log_success "项目目录设置完成: %PROJECT_DIR%"
goto :eof

REM 获取项目代码
:get_project_code
call :log_info "获取项目代码..."

echo 请选择代码获取方式:
echo 1^) Git拉取 ^(推荐^)
echo 2^) 手动上传压缩包
set /p "choice=请输入选择 (1-2): "

if "%choice%"=="1" (
    call :get_code_from_git
) else if "%choice%"=="2" (
    call :get_code_from_upload
) else (
    call :log_error "无效选择"
    pause
    exit /b 1
)
goto :eof

REM 从Git获取代码
:get_code_from_git
call :log_info "从Git仓库获取代码..."

REM 检查git是否安装
git --version >nul 2>&1
if %errorLevel% neq 0 (
    call :log_error "Git未安装，请先安装Git"
    pause
    exit /b 1
)

REM 获取仓库地址
set /p "repo_url=请输入Git仓库地址: "
set /p "branch=请输入分支名称 (默认: develop): "
if "%branch%"=="" set "branch=develop"

REM 清空目录
for /f %%i in ('dir /b "%PROJECT_DIR%"') do (
    if exist "%PROJECT_DIR%\%%i" (
        if exist "%PROJECT_DIR%\%%i\nul" (
            rmdir /s /q "%PROJECT_DIR%\%%i"
        ) else (
            del /q "%PROJECT_DIR%\%%i"
        )
    )
)

REM 克隆代码
git clone -b "%branch%" "%repo_url%" "%PROJECT_DIR%"

call :log_success "代码获取完成"
goto :eof

REM 从上传的压缩包获取代码
:get_code_from_upload
call :log_info "从压缩包获取代码..."

echo 请将项目压缩包上传到: %PROJECT_DIR%
echo 支持的格式: .zip
echo 上传完成后按回车继续...
pause >nul

REM 查找压缩包
set "archive_file="
for %%f in ("%PROJECT_DIR%\*.zip") do (
    set "archive_file=%%f"
    goto :found_archive
)

if "%archive_file%"=="" (
    call :log_error "未找到压缩包文件"
    pause
    exit /b 1
)

:found_archive
call :log_info "找到压缩包: %archive_file%"

REM 解压文件
powershell -command "Expand-Archive -Path '%archive_file%' -DestinationPath '%PROJECT_DIR%' -Force"

REM 删除压缩包
del "%archive_file%"

REM 如果解压后有子目录，移动文件到根目录
for /d %%d in ("%PROJECT_DIR%\*") do (
    if exist "%%d\package.json" (
        xcopy "%%d\*" "%PROJECT_DIR%\" /E /H /Y >nul
        rmdir /s /q "%%d"
        goto :extract_done
    )
)

:extract_done
call :log_success "代码解压完成"
goto :eof

REM 配置环境变量
:setup_environment
call :log_info "配置环境变量..."

REM 检查环境变量文件
if not exist ".env" (
    call :log_warning "未找到.env文件，创建默认配置"
    (
        echo # 前端配置
        echo VITE_DEV_SERVER_PORT=5713
        echo VITE_API_BASE_URL=http://localhost:3000/api
        echo VITE_PRODUCTION_DOMAIN=https://%DOMAIN%
    ) > .env
)

if not exist "backend\.env" (
    call :log_warning "未找到backend\.env文件，创建默认配置"
    if not exist "backend" mkdir "backend"
    (
        echo # 服务器配置
        echo PORT=3000
        echo NODE_ENV=production
        echo.
        echo # 数据库配置
        echo MONGODB_URI=mongodb://admin:password123@mongodb:27017/rural-art-platform?authSource=admin
        echo.
        echo # JWT配置
        echo JWT_SECRET=your-production-jwt-secret-key-change-this
        echo JWT_EXPIRES_IN=7d
        echo.
        echo # 文件上传配置
        echo UPLOAD_PATH=/app/uploads
        echo MAX_FILE_SIZE=10485760
        echo.
        echo # AI服务配置 ^(可选^)
        echo # OPENAI_API_KEY=your-openai-api-key
        echo # OPENAI_BASE_URL=https://api.openai.com/v1
    ) > backend\.env
)

REM 更新域名配置
powershell -command "(Get-Content .env) -replace 'VITE_PRODUCTION_DOMAIN=.*', 'VITE_PRODUCTION_DOMAIN=https://%DOMAIN%' | Set-Content .env"

call :log_success "环境变量配置完成"
goto :eof

REM 安装依赖
:install_dependencies
call :log_info "安装项目依赖..."

REM 检查Node.js
node --version >nul 2>&1
if %errorLevel% neq 0 (
    call :log_error "Node.js未安装，请在宝塔面板中安装Node.js"
    pause
    exit /b 1
)

REM 检查npm
npm --version >nul 2>&1
if %errorLevel% neq 0 (
    call :log_error "npm未安装"
    pause
    exit /b 1
)

REM 安装前端依赖
call :log_info "安装前端依赖..."
npm install

REM 安装后端依赖
call :log_info "安装后端依赖..."
cd backend
npm install
cd ..

call :log_success "依赖安装完成"
goto :eof

REM 构建项目
:build_project
call :log_info "构建项目..."

REM 构建前端
call :log_info "构建前端项目..."
npm run build

call :log_success "项目构建完成"
goto :eof

REM 停止现有服务
:stop_services
call :log_info "停止现有服务..."

if exist "docker-compose.simple.yml" (
    docker-compose -f docker-compose.simple.yml down --remove-orphans >nul 2>&1
)

REM 清理未使用的容器和镜像
docker system prune -f >nul 2>&1

call :log_success "服务停止完成"
goto :eof

REM 启动服务
:start_services
call :log_info "启动服务..."

REM 检查docker-compose文件
if not exist "docker-compose.simple.yml" (
    call :log_error "未找到docker-compose.simple.yml文件"
    pause
    exit /b 1
)

REM 构建并启动服务
docker-compose -f docker-compose.simple.yml up -d --build

call :log_success "服务启动完成"
goto :eof

REM 等待服务就绪
:wait_for_services
call :log_info "等待服务启动..."

REM 等待后端服务
set /a "count=0"
:wait_backend
set /a "count+=1"
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorLevel% == 0 (
    call :log_success "后端服务已就绪"
    goto :wait_frontend
)
if %count% geq 30 (
    call :log_warning "后端服务启动超时，请检查日志"
    goto :wait_frontend
)
timeout /t 2 >nul
goto :wait_backend

:wait_frontend
set /a "count=0"
:wait_frontend_loop
set /a "count+=1"
curl -s http://localhost:80 >nul 2>&1
if %errorLevel% == 0 (
    call :log_success "前端服务已就绪"
    goto :eof
)
if %count% geq 30 (
    call :log_warning "前端服务启动超时，请检查日志"
    goto :eof
)
timeout /t 2 >nul
goto :wait_frontend_loop

REM 检查服务状态
:check_services
call :log_info "检查服务状态..."

echo === Docker容器状态 ===
docker-compose -f docker-compose.simple.yml ps

echo.
echo === 服务访问地址 ===
echo 前端访问: http://%DOMAIN% 或 http://localhost
echo 后端API: http://%DOMAIN%/api 或 http://localhost:3000/api
echo 数据库: mongodb://localhost:27017

echo.
echo === 服务健康检查 ===

REM 检查后端健康状态
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorLevel% == 0 (
    call :log_success "后端服务正常"
) else (
    call :log_error "后端服务异常"
)

REM 检查前端服务
curl -s http://localhost:80 >nul 2>&1
if %errorLevel% == 0 (
    call :log_success "前端服务正常"
) else (
    call :log_error "前端服务异常"
)

REM 检查数据库连接
docker exec rural-art-mongodb mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if %errorLevel% == 0 (
    call :log_success "数据库连接正常"
) else (
    call :log_error "数据库连接异常"
)
goto :eof

REM 显示日志
:show_logs
call :log_info "显示服务日志..."

echo === 最近的服务日志 ===
docker-compose -f docker-compose.simple.yml logs --tail=50
goto :eof

REM 配置防火墙
:setup_firewall
call :log_info "配置防火墙..."

echo 请在宝塔面板中开放以下端口:
echo - 80 (HTTP)
echo - 443 (HTTPS)
echo - 3000 (后端API，可选)

REM Windows防火墙配置
netsh advfirewall firewall show rule name="Rural Art Platform HTTP" >nul 2>&1
if %errorLevel% neq 0 (
    netsh advfirewall firewall add rule name="Rural Art Platform HTTP" dir=in action=allow protocol=TCP localport=80
)

netsh advfirewall firewall show rule name="Rural Art Platform HTTPS" >nul 2>&1
if %errorLevel% neq 0 (
    netsh advfirewall firewall add rule name="Rural Art Platform HTTPS" dir=in action=allow protocol=TCP localport=443
)

netsh advfirewall firewall show rule name="Rural Art Platform API" >nul 2>&1
if %errorLevel% neq 0 (
    netsh advfirewall firewall add rule name="Rural Art Platform API" dir=in action=allow protocol=TCP localport=3000
)

call :log_success "防火墙配置完成"
goto :eof

REM 主函数
:main
echo ==================================
echo   乡村艺术平台 - 宝塔面板部署脚本
echo ==================================
echo.

call :check_admin
call :check_baota_env
call :check_docker
call :setup_project_dir
call :get_project_code
call :setup_environment
call :install_dependencies
call :build_project
call :stop_services
call :start_services
call :wait_for_services
call :check_services
call :setup_firewall

echo.
echo ==================================
call :log_success "部署完成！"
echo ==================================
echo.
echo 访问地址:
echo - 前端: http://%DOMAIN%
echo - 后端API: http://%DOMAIN%/api
echo.
echo 管理命令:
echo - 查看日志: docker-compose -f docker-compose.simple.yml logs -f
echo - 重启服务: docker-compose -f docker-compose.simple.yml restart
echo - 停止服务: docker-compose -f docker-compose.simple.yml down
echo.
echo 如需帮助，请查看部署文档或联系技术支持。
echo.
pause
goto :eof

REM 脚本入口
call :main