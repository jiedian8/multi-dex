import { fetchAdminData } from './api.js';

// 初始化管理面板
export function initAdminPanel() {
    loadDashboardData();
    setupEventListeners();
}

// 加载仪表盘数据
async function loadDashboardData() {
    try {
        const data = await fetchAdminData('/admin/dashboard');
        renderDashboard(data);
    } catch (error) {
        console.error('仪表盘数据加载失败:', error);
    }
}

// 渲染仪表盘
function renderDashboard(data) {
    document.getElementById('total-users').textContent = data.totalUsers;
    document.getElementById('daily-trades').textContent = data.dailyTrades;
    document.getElementById('total-liquidity').textContent = `$${data.totalLiquidity.toLocaleString()}`;
    
    // 渲染交易图表
    renderTradeChart(data.tradeChart);
}

// 渲染交易图表
function renderTradeChart(chartData) {
    const ctx = document.getElementById('trade-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: '每日交易量',
                data: chartData.values,
                borderColor: '#4e73df',
                backgroundColor: 'rgba(78, 115, 223, 0.05)'
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 用户管理标签页
    document.getElementById('users-tab').addEventListener('click', loadUsers);
    
    // 交易管理标签页
    document.getElementById('transactions-tab').addEventListener('click', loadTransactions);
    
    // 代币管理标签页
    document.getElementById('tokens-tab').addEventListener('click', loadTokens);
}

// 加载用户数据
async function loadUsers() {
    try {
        const users = await fetchAdminData('/admin/users');
        renderUserTable(users);
    } catch (error) {
        console.error('用户数据加载失败:', error);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', initAdminPanel);