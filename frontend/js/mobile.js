// 检测移动设备并优化UI
export function optimizeForMobile() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) return;
  
  // 添加移动设备类
  document.documentElement.classList.add('mobile-device');
  
  // 简化复杂UI组件
  simplifyUI();
  
  // 添加手势支持
  addTouchGestures();
  
  // 优化键盘输入
  optimizeInputs();
}

function simplifyUI() {
  // 隐藏不必要的元素
  document.querySelectorAll('.desktop-only').forEach(el => {
    el.style.display = 'none';
  });
  
  // 简化表格
  document.querySelectorAll('table').forEach(table => {
    table.classList.add('mobile-table');
  });
  
  // 压缩页脚
  const footer = document.querySelector('footer');
  if (footer) {
    footer.style.padding = '10px';
    footer.style.fontSize = '0.8rem';
  }
}

function addTouchGestures() {
  // 滑动导航
  let touchStartX = 0;
  let touchEndX = 0;
  
  document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const diff = touchEndX - touchStartX;
    const minSwipe = 50; // 最小滑动距离
    
    if (Math.abs(diff) < minSwipe) return;
    
    if (diff > 0) {
      // 向右滑动 - 返回
      window.history.back();
    } else {
      // 向左滑动 - 刷新
      window.location.reload();
    }
  }
}

function optimizeInputs() {
  // 数字输入优化
  document.querySelectorAll('input[type="number"]').forEach(input => {
    input.setAttribute('inputmode', 'decimal');
    input.setAttribute('pattern', '[0-9]*');
    
    // 添加加减按钮
    const wrapper = document.createElement('div');
    wrapper.className = 'mobile-input-wrapper';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    
    const minusBtn = document.createElement('button');
    minusBtn.className = 'mobile-input-btn minus';
    minusBtn.textContent = '-';
    minusBtn.addEventListener('click', () => {
      const value = parseFloat(input.value) || 0;
      input.value = Math.max(0, value - 1);
      input.dispatchEvent(new Event('input'));
    });
    
    const plusBtn = document.createElement('button');
    plusBtn.className = 'mobile-input-btn plus';
    plusBtn.textContent = '+';
    plusBtn.addEventListener('click', () => {
      const value = parseFloat(input.value) || 0;
      input.value = value + 1;
      input.dispatchEvent(new Event('input'));
    });
    
    wrapper.appendChild(minusBtn);
    wrapper.appendChild(plusBtn);
  });
  
  // 选择框优化
  document.querySelectorAll('select').forEach(select => {
    select.addEventListener('focus', () => {
      window.scrollTo(0, select.getBoundingClientRect().top - 100);
    });
  });
}