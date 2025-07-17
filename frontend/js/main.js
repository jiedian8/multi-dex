// 多语言支持
const translations = {
    en: {
        trading_pairs: "Trading Pairs (Top 500)",
        trading_pairs_desc: "Trade the top 500 cryptocurrencies with deep liquidity and low fees. Real-time market data updated every minute.",
        pair: "Pair",
        price: "Price",
        change_24h: "24h Change",
        volume_24h: "24h Volume",
        liquidity: "Liquidity",
        action: "Action",
        back_to_markets: "Back to Markets",
        high_24h: "24h High",
        low_24h: "24h Low",
        buy: "Buy",
        amount: "Amount",
        total: "Total",
        market: "Market",
        max: "Max",
        buy_btc: "Buy BTC",
        sell: "Sell",
        sell_btc: "Sell BTC",
        order_book: "Order Book",
        spread: "Spread",
        recent_trades: "Recent Trades",
        exclusive_airdrop: "Exclusive Airdrop",
        airdrop_desc: "Complete simple tasks to earn MDX tokens! Rewards are distributed instantly to your wallet.",
        follow_twitter: "Follow on Twitter",
        follow_twitter_desc: "Follow our official Twitter account to earn 10 MDX tokens",
        complete_task: "Complete Task",
        retweet_daily: "Retweet Daily",
        retweet_daily_desc: "Retweet our daily pinned tweet to earn 10 MDX per day",
        like_tweet: "Like Tweet",
        like_tweet_desc: "Like our specified tweet to earn 10 MDX tokens",
        comment_tweet: "Comment on Tweet",
        comment_tweet_desc: "Comment on our specified tweet to earn 10 MDX tokens",
        invite_friends: "Invite Friends",
        invite_friends_desc: "Invite friends using your referral link to earn 30 MDX per new user",
        get_referral_link: "Get Referral Link",
        your_referral_link: "Your Referral Link",
        referrals: "Referrals",
        earned_tokens: "Earned Tokens",
        mdx_preorder: "MDX Token Pre-order",
        preorder_desc: "Participate in our token pre-order and get MDX tokens at a discounted rate! Send funds to the addresses below.",
        send_btc: "Send BTC to this address to participate",
        send_eth: "Send ETH or ERC-20 tokens to this address",
        send_sol: "Send SOL or SPL tokens to this address",
        send_bnb: "Send BNB or BEP-20 tokens to this address",
        footer_desc: "The leading multi-chain decentralized exchange with advanced trading features and deep liquidity.",
        products: "Products",
        exchange: "Exchange",
        liquidity_pools: "Liquidity Pools",
        staking: "Staking",
        airdrops: "Airdrops",
        preorder: "Pre-order",
        resources: "Resources",
        whitepaper: "Whitepaper",
        documentation: "Documentation",
        tutorials: "Tutorials",
        blog: "Blog",
        api: "API",
        support: "Support",
        help_center: "Help Center",
        contact_us: "Contact Us",
        community: "Community",
        status: "Status",
        faq: "FAQ",
        all_rights: "All rights reserved.",
        admin_login: "Admin Login",
        username: "Username",
        password: "Password",
        login: "Login",
        dont_show_again: "Don't show this again",
        close: "Close"
    },
    // 其他语言翻译省略以节省空间
};

// 用户数据和推广系统
const UserData = {
    currentUser: null,
    users: {},
    referralStats: {},
    
    init() {
        this.loadFromLocalStorage();
    },
    
    connectWallet() {
        // 生成模拟钱包地址
        const walletAddress = '0x' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
        
        if (!this.users[walletAddress]) {
            this.users[walletAddress] = {
                address: walletAddress,
                referralCode: this.generateReferralCode(),
                tasks: {
                    twitter_follow: false,
                    twitter_retweet: false,
                    twitter_like: false,
                    twitter_comment: false,
                    referrals: 0
                }
            };
            
            this.referralStats[this.users[walletAddress].referralCode] = {
                referrals: 0,
                earnedTokens: 0
            };
        }
        
        this.currentUser = this.users[walletAddress];
        this.saveToLocalStorage();
        
        return this.currentUser;
    },
    
    generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },
    
    getReferralLink() {
        if (!this.currentUser) return null;
        return `https://multidex.com/ref/${this.currentUser.referralCode}`;
    },
    
    completeTask(taskName) {
        if (!this.currentUser || this.currentUser.tasks[taskName]) return false;
        
        this.currentUser.tasks[taskName] = true;
        this.saveToLocalStorage();
        return true;
    },
    
    recordReferral(referralCode) {
        if (!this.referralStats[referralCode]) return false;
        
        this.referralStats[referralCode].referrals++;
        this.referralStats[referralCode].earnedTokens += 30;
        
        for (const address in this.users) {
            if (this.users[address].referralCode === referralCode) {
                this.users[address].tasks.referrals++;
                break;
            }
        }
        
        this.saveToLocalStorage();
        return true;
    },
    
    saveToLocalStorage() {
        localStorage.setItem('multiDEXUsers', JSON.stringify(this.users));
        localStorage.setItem('multiDEXReferralStats', JSON.stringify(this.referralStats));
    },
    
    loadFromLocalStorage() {
        const users = localStorage.getItem('multiDEXUsers');
        const stats = localStorage.getItem('multiDEXReferralStats');
        
        if (users) this.users = JSON.parse(users);
        if (stats) this.referralStats = JSON.parse(stats);
    }
};

// DOM 就绪后初始化
$(document).ready(function() {
    // 初始化用户数据
    UserData.init();
    
    // 应用语言
    function applyLanguage(lang) {
        $('[data-translate]').each(function() {
            const key = $(this).data('translate');
            if (translations[lang] && translations[lang][key]) {
                if ($(this).is('input')) {
                    $(this).attr('placeholder', translations[lang][key]);
                } else {
                    $(this).text(translations[lang][key]);
                }
            }
        });
    }
    
    // 获取语言设置
    function getSelectedLanguage() {
        return localStorage.getItem('selectedLanguage') || 'en';
    }
    
    // 设置语言
    function setLanguage(lang) {
        localStorage.setItem('selectedLanguage', lang);
        $('#languageSelector').val(lang);
        applyLanguage(lang);
    }
    
    // 初始化语言
    setLanguage(getSelectedLanguage());
    
    // 语言选择器事件
    $('#languageSelector').change(function() {
        const lang = $(this).val();
        setLanguage(lang);
    });
    
    // 钱包连接
    $('#connectWallet').click(function() {
        const user = UserData.connectWallet();
        $('#walletText').text(user.address.substring(0, 6) + '...' + user.address.substring(user.address.length - 4));
        $(this).addClass('connected').prop('disabled', true);
        showToast('Wallet connected successfully!', 'success');
    });
    
    // 显示 Toast 通知
    function showToast(message, type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        
        const toast = $(`
            <div class="toast toast-${type}">
                <div class="toast-icon">
                    <i class="fas ${icons[type]}"></i>
                </div>
                <div class="toast-content">
                    <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `);
        
        $('#toastContainer').append(toast);
        toast.addClass('show');
        
        // 关闭按钮
        toast.find('.toast-close').click(function() {
            toast.remove();
        });
        
        // 自动关闭
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
    
    // 管理按钮点击
    $('#adminButton').click(function() {
        const adminModal = new bootstrap.Modal(document.getElementById('adminLoginModal'));
        adminModal.show();
    });
    
    // 管理员登录
    $('#adminLoginForm').submit(function(e) {
        e.preventDefault();
        const username = $('#adminUsername').val();
        const password = $('#adminPassword').val();
        
        // 简单的硬编码验证（实际应用中应从后端验证）
        if (username === 'admin' && password === 'admin123') {
            window.location.href = '../admin/index.html';
        } else {
            showToast('Invalid admin credentials', 'error');
        }
    });
});