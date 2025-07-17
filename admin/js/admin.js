// 管理员仪表盘初始化
function initAdminDashboard() {
    // TVL 图表
    const tvlCtx = document.getElementById('tvlChart').getContext('2d');
    const tvlChart = new Chart(tvlCtx, {
        type: 'doughnut',
        data: {
            labels: ['Ethereum', 'BSC', 'Polygon', 'Solana', 'Avalanche'],
            datasets: [{
                data: [45, 25, 15, 10, 5],
                backgroundColor: [
                    '#627eea', // Ethereum
                    '#f0b90b', // BSC
                    '#8247e5', // Polygon
                    '#00f2fe', // Solana
                    '#e84142'  // Avalanche
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
    
    // 交易量图表
    const volumeCtx = document.getElementById('volumeChart').getContext('2d');
    const volumeChart = new Chart(volumeCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Trading Volume (in millions)',
                data: [12, 19, 15, 24, 18, 22, 30],
                backgroundColor: 'rgba(41, 98, 255, 0.1)',
                borderColor: '#2962ff',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // 流动性池图表
    const poolCtx = document.getElementById('poolChart').getContext('2d');
    const poolChart = new Chart(poolCtx, {
        type: 'bar',
        data: {
            labels: ['ETH/USDT', 'BTC/ETH', 'BNB/USDT', 'SOL/USDC', 'MATIC/USDT'],
            datasets: [{
                label: 'Liquidity (in millions)',
                data: [42.8, 36.4, 28.3, 15.7, 12.6],
                backgroundColor: '#2962ff',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// 页面加载完成后初始化
$(document).ready(function() {
    initAdminDashboard();
    
    // 侧边栏菜单点击
    $('.admin-menu a').click(function(e) {
        e.preventDefault();
        
        // 更新活动菜单项
        $('.admin-menu li').removeClass('active');
        $(this).parent().addClass('active');
        
        // 显示对应页面
        const target = $(this).attr('href');
        $('.admin-page').removeClass('active');
        $(target + 'Page').addClass('active');
    });
    
    // 添加代币按钮
    $('#addTokenBtn').click(function() {
        // 显示添加代币模态框
        // 实际应用中应打开模态框
        alert('Add Token functionality would open a modal here');
    });
    
    // 登出按钮
    $('.logout-btn').click(function() {
        // 清除管理员会话
        localStorage.removeItem('adminToken');
        window.location.href = '../frontend/index.html';
    });
});