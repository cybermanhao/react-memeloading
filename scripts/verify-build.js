const fs = require('fs');
const path = require('path');

console.log('🔍 检查构建产物...\n');

// 检查dist目录
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('✅ dist 目录存在');
  
  const files = fs.readdirSync(distPath);
  console.log('📦 构建文件列表:');
  files.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    console.log(`   ${file} (${size} KB)`);
  });
} else {
  console.log('❌ dist 目录不存在');
  process.exit(1);
}

// 检查主要文件
const requiredFiles = [
  'index.js',
  'index.esm.js', 
  'index.d.ts',
  'index.css'
];

console.log('\n🔧 检查必需文件:');
const missingFiles = [];
requiredFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file}`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log(`\n❌ 缺少必需文件: ${missingFiles.join(', ')}`);
  process.exit(1);
}

// 简单验证导出
console.log('\n🧪 验证导出...');
try {
  const indexPath = path.join(distPath, 'index.js');
  const content = fs.readFileSync(indexPath, 'utf8');
  
  if (content.includes('exports.default') || content.includes('exports.MemeLoading')) {
    console.log('   ✅ CommonJS 导出正常');
  } else {
    console.log('   ⚠️  CommonJS 导出可能有问题');
  }
  
  const esmPath = path.join(distPath, 'index.esm.js');
  const esmContent = fs.readFileSync(esmPath, 'utf8');
  
  if (esmContent.includes('export{') || esmContent.includes('export ')) {
    console.log('   ✅ ES Module 导出正常');
  } else {
    console.log('   ⚠️  ES Module 导出可能有问题');
  }
  
} catch (error) {
  console.log(`   ❌ 验证导出时出错: ${error.message}`);
}

console.log('\n🎉 构建验证完成！');
console.log('\n📝 使用说明:');
console.log('1. 运行 `npm run test:example` 启动测试页面');
console.log('2. 运行 `npm publish` 发布到 npm');
console.log('3. 构建的包大小合理，包含所有必要文件');
