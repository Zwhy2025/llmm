// 全局变量
let apis = [];
let currentSection = 'api-management';
let syncInterval = null;

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    loadApis();
    loadSettings();
    updateApiGrid();
    updateTestApiSelect();
    setupEventListeners();
    startSync();
});

// 事件监听器设置
function setupEventListeners() {
    // 温度滑块
    const temperatureSlider = document.getElementById('test-temperature');
    const temperatureValue = document.getElementById('temperature-value');
    
    if (temperatureSlider && temperatureValue) {
        temperatureSlider.addEventListener('input', function() {
            temperatureValue.textContent = this.value;
        });
    }

    // 设置变更监听
    const syncEnabled = document.getElementById('sync-enabled');
    const syncIntervalInput = document.getElementById('sync-interval');
    const themeSelect = document.getElementById('theme-select');

    if (syncEnabled) {
        syncEnabled.addEventListener('change', function() {
            saveSettings();
            if (this.checked) {
                startSync();
                showNotification('数据同步已启用', 'success');
            } else {
                stopSync();
                showNotification('数据同步已禁用', 'info');
            }
        });
    }

    if (syncIntervalInput) {
        syncIntervalInput.addEventListener('change', function() {
            saveSettings();
            if (document.getElementById('sync-enabled').checked) {
                startSync();
                showNotification(`同步间隔已更新为 ${this.value} 秒`, 'info');
            }
        });
    }

    if (themeSelect) {
        themeSelect.addEventListener('change', function() {
            applyTheme(this.value);
            saveSettings();
            showNotification(`主题已切换为 ${this.value === 'dark' ? '深色' : '浅色'}`, 'info');
        });
    }

    // 模态框点击外部关闭
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('add-api-modal');
        if (event.target === modal) {
            closeAddApiModal();
        }
    });
}

// 显示/隐藏部分
function showSection(sectionId) {
    // 隐藏所有部分
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 显示选中的部分
    document.getElementById(sectionId).classList.add('active');
    
    // 更新导航状态
    document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.classList.remove('active');
    });
    
    event.target.closest('li').classList.add('active');
    
    currentSection = sectionId;
}

// API 管理功能
function loadApis() {
    const savedApis = localStorage.getItem('ai-apis');
    if (savedApis) {
        try {
            apis = JSON.parse(savedApis);
        } catch (error) {
            console.error('加载API数据失败:', error);
            apis = [];
            showNotification('加载API数据失败，已重置', 'error');
        }
    }
}

function saveApis() {
    try {
        localStorage.setItem('ai-apis', JSON.stringify(apis));
        // 触发同步
        syncData();
    } catch (error) {
        console.error('保存API数据失败:', error);
        showNotification('保存API数据失败', 'error');
    }
}

function addApi() {
    const name = document.getElementById('api-name').value.trim();
    const url = document.getElementById('api-url').value.trim();
    const key = document.getElementById('api-key').value.trim();
    const type = document.getElementById('api-type').value;
    const description = document.getElementById('api-description').value.trim();

    if (!name || !url || !key) {
        showNotification('请填写必填字段', 'error');
        return;
    }

    // 验证URL格式
    try {
        new URL(url);
    } catch (error) {
        showNotification('请输入有效的URL地址', 'error');
        return;
    }

    const newApi = {
        id: Date.now().toString(),
        name,
        url: url.endsWith('/') ? url.slice(0, -1) : url, // 移除末尾斜杠
        key,
        type,
        description,
        createdAt: new Date().toISOString(),
        status: 'active'
    };

    apis.push(newApi);
    saveApis();
    updateApiGrid();
    updateTestApiSelect();
    closeAddApiModal();
    
    // 清空表单
    document.getElementById('add-api-form').reset();
    
    showNotification(`API "${name}" 添加成功`, 'success');
}

function editApi(apiId) {
    const api = apis.find(a => a.id === apiId);
    if (!api) {
        showNotification('API不存在', 'error');
        return;
    }

    // 填充表单
    document.getElementById('api-name').value = api.name;
    document.getElementById('api-url').value = api.url;
    document.getElementById('api-key').value = api.key;
    document.getElementById('api-type').value = api.type;
    document.getElementById('api-description').value = api.description || '';

    // 显示模态框
    showAddApiModal();
    
    // 修改模态框标题和按钮
    const modalTitle = document.querySelector('.modal-header h2');
    const modalButton = document.querySelector('.modal-footer .btn-primary');
    
    modalTitle.textContent = '编辑 API';
    modalButton.textContent = '更新';
    modalButton.onclick = () => updateApi(apiId);
}

function updateApi(apiId) {
    const name = document.getElementById('api-name').value.trim();
    const url = document.getElementById('api-url').value.trim();
    const key = document.getElementById('api-key').value.trim();
    const type = document.getElementById('api-type').value;
    const description = document.getElementById('api-description').value.trim();

    if (!name || !url || !key) {
        showNotification('请填写必填字段', 'error');
        return;
    }

    const apiIndex = apis.findIndex(a => a.id === apiId);
    if (apiIndex === -1) {
        showNotification('API不存在', 'error');
        return;
    }

    // 更新API信息
    apis[apiIndex] = {
        ...apis[apiIndex],
        name,
        url: url.endsWith('/') ? url.slice(0, -1) : url,
        key,
        type,
        description,
        updatedAt: new Date().toISOString()
    };

    saveApis();
    updateApiGrid();
    updateTestApiSelect();
    closeAddApiModal();
    
    // 重置模态框
    const modalTitle = document.querySelector('.modal-header h2');
    const modalButton = document.querySelector('.modal-footer .btn-primary');
    
    modalTitle.textContent = '添加 API';
    modalButton.textContent = '添加';
    modalButton.onclick = addApi;
    
    showNotification(`API "${name}" 更新成功`, 'success');
}

function deleteApi(apiId) {
    const api = apis.find(a => a.id === apiId);
    if (!api) {
        showNotification('API不存在', 'error');
        return;
    }

    if (confirm(`确定要删除API "${api.name}" 吗？`)) {
        apis = apis.filter(api => api.id !== apiId);
        saveApis();
        updateApiGrid();
        updateTestApiSelect();
        showNotification(`API "${api.name}" 已删除`, 'success');
    }
}

function updateApiGrid() {
    const apiGrid = document.getElementById('api-grid');
    if (!apiGrid) return;

    apiGrid.innerHTML = '';

    if (apis.length === 0) {
        apiGrid.innerHTML = `
            <div class="api-card" style="grid-column: 1 / -1; text-align: center; color: #666;">
                <i class="fas fa-plus-circle" style="font-size: 3rem; margin-bottom: 20px; color: #667eea;"></i>
                <h3>还没有添加任何API</h3>
                <p>点击右上角的"添加 API"按钮开始添加您的第一个API</p>
            </div>
        `;
        return;
    }

    apis.forEach(api => {
        const apiCard = document.createElement('div');
        apiCard.className = 'api-card';
        apiCard.innerHTML = `
            <div class="api-card-header">
                <div class="api-card-title">
                    <span class="status-indicator ${api.status === 'active' ? 'status-active' : 'status-inactive'}"></span>
                    ${api.name}
                </div>
                <span class="api-card-type">${getApiTypeName(api.type)}</span>
            </div>
            <div class="api-card-url">${api.url}</div>
            <div class="api-card-description">${api.description || '暂无描述'}</div>
            <div class="api-card-actions">
                <button class="btn btn-primary" onclick="testApiById('${api.id}')">
                    <i class="fas fa-play"></i> 测试
                </button>
                <button class="btn btn-secondary" onclick="editApi('${api.id}')">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button class="btn btn-danger" onclick="deleteApi('${api.id}')">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
        `;
        apiGrid.appendChild(apiCard);
    });
}

function getApiTypeName(type) {
    const typeNames = {
        'openai': 'OpenAI 兼容',
        'anthropic': 'Anthropic Claude',
        'custom': '自定义'
    };
    return typeNames[type] || type;
}

function updateTestApiSelect() {
    const select = document.getElementById('test-api-select');
    if (!select) return;

    select.innerHTML = '<option value="">请选择 API</option>';
    apis.forEach(api => {
        const option = document.createElement('option');
        option.value = api.id;
        option.textContent = api.name;
        select.appendChild(option);
    });
}

// 模态框功能
function showAddApiModal() {
    document.getElementById('add-api-modal').style.display = 'block';
}

function closeAddApiModal() {
    document.getElementById('add-api-modal').style.display = 'none';
    // 重置表单
    document.getElementById('add-api-form').reset();
    
    // 重置模态框标题和按钮
    const modalTitle = document.querySelector('.modal-header h2');
    const modalButton = document.querySelector('.modal-footer .btn-primary');
    
    modalTitle.textContent = '添加 API';
    modalButton.textContent = '添加';
    modalButton.onclick = addApi;
}

// API 测试功能
async function testApi() {
    const apiId = document.getElementById('test-api-select').value;
    const model = document.getElementById('test-model').value;
    const temperature = parseFloat(document.getElementById('test-temperature').value);
    const message = document.getElementById('test-message').value.trim();

    if (!apiId) {
        showNotification('请选择一个API', 'error');
        return;
    }

    if (!message) {
        showNotification('请输入测试消息', 'error');
        return;
    }

    const api = apis.find(a => a.id === apiId);
    if (!api) {
        showNotification('API不存在', 'error');
        return;
    }

    const resultContent = document.getElementById('test-result-content');
    resultContent.innerHTML = '<div class="loading"></div> 正在发送请求...';

    try {
        const response = await callApi(api, model, temperature, message);
        resultContent.innerHTML = formatApiResponse(response);
        showNotification('API测试成功', 'success');
    } catch (error) {
        resultContent.innerHTML = `错误: ${error.message}`;
        showNotification(`API测试失败: ${error.message}`, 'error');
    }
}

async function testApiById(apiId) {
    // 切换到测试页面
    showSection('api-testing');
    
    // 设置选中的API
    const select = document.getElementById('test-api-select');
    if (select) {
        select.value = apiId;
    }
}

async function callApi(api, model, temperature, message) {
    const url = `${api.url}/chat/completions`;
    
    const requestBody = {
        model: model,
        messages: [
            {
                role: "user",
                content: message
            }
        ],
        temperature: temperature,
        max_tokens: 2000
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api.key}`
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
}

function formatApiResponse(response) {
    if (response.choices && response.choices.length > 0) {
        const choice = response.choices[0];
        const content = choice.message.content;
        const usage = response.usage;
        
        return `响应内容:
${content}

使用情况:
- 输入tokens: ${usage?.prompt_tokens || 'N/A'}
- 输出tokens: ${usage?.completion_tokens || 'N/A'}
- 总tokens: ${usage?.total_tokens || 'N/A'}

完整响应:
${JSON.stringify(response, null, 2)}`;
    } else {
        return `响应格式异常:
${JSON.stringify(response, null, 2)}`;
    }
}

function clearTestResult() {
    document.getElementById('test-result-content').innerHTML = '';
    document.getElementById('test-message').value = '';
    showNotification('测试结果已清空', 'info');
}

// 设置功能
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
    
    if (document.getElementById('sync-enabled')) {
        document.getElementById('sync-enabled').checked = settings.syncEnabled !== false;
    }
    
    if (document.getElementById('sync-interval')) {
        document.getElementById('sync-interval').value = settings.syncInterval || 30;
    }
    
    if (document.getElementById('theme-select')) {
        document.getElementById('theme-select').value = settings.theme || 'light';
        applyTheme(settings.theme || 'light');
    }
}

function saveSettings() {
    const settings = {
        syncEnabled: document.getElementById('sync-enabled')?.checked || false,
        syncInterval: parseInt(document.getElementById('sync-interval')?.value || '30'),
        theme: document.getElementById('theme-select')?.value || 'light'
    };
    
    localStorage.setItem('ai-settings', JSON.stringify(settings));
}

function applyTheme(theme) {
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
}

// 数据同步功能
function startSync() {
    stopSync();
    
    const syncEnabled = document.getElementById('sync-enabled')?.checked || false;
    const syncIntervalValue = parseInt(document.getElementById('sync-interval')?.value || '30');
    
    if (syncEnabled && syncIntervalValue > 0) {
        syncInterval = setInterval(syncData, syncIntervalValue * 1000);
        console.log(`数据同步已启动，间隔: ${syncIntervalValue}秒`);
    }
}

function stopSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        console.log('数据同步已停止');
    }
}

function syncData() {
    // 这里可以实现与云端的数据同步
    // 目前使用localStorage作为本地存储
    console.log('数据同步中...', new Date().toLocaleString());
    
    // 示例：可以在这里添加与服务器的同步逻辑
    // 例如：上传到服务器、从服务器下载等
}

// 通知系统
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 自动移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 导出功能（用于备份）
function exportData() {
    const data = {
        apis: apis,
        settings: JSON.parse(localStorage.getItem('ai-settings') || '{}'),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-api-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('数据导出成功', 'success');
}

// 导入功能
function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.apis) {
                apis = data.apis;
                saveApis();
                updateApiGrid();
                updateTestApiSelect();
            }
            
            if (data.settings) {
                localStorage.setItem('ai-settings', JSON.stringify(data.settings));
                loadSettings();
            }
            
            showNotification('数据导入成功', 'success');
        } catch (error) {
            showNotification('数据导入失败: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

// 页面卸载时保存数据
window.addEventListener('beforeunload', function() {
    saveApis();
    saveSettings();
    stopSync();
});

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N: 新建API
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        showAddApiModal();
    }
    
    // Ctrl/Cmd + T: 切换到测试页面
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        showSection('api-testing');
    }
    
    // Ctrl/Cmd + S: 切换到设置页面
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        showSection('settings');
    }
    
    // Esc: 关闭模态框
    if (e.key === 'Escape') {
        closeAddApiModal();
    }
});