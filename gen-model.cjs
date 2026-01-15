const { execSync } = require('child_process');
const fs = require('fs');

const fileName = process.argv[2];

if (!fileName) {
  console.error('Ошибка: Укажите имя файла. Пример: pnpm gen hauntedHouse');
  process.exit(1);
}

const input = `public/models/${fileName}.glb`;
const output = `src/components/${fileName.charAt(0).toUpperCase() + fileName.slice(1)}.tsx`;

try {
  console.log(`🚀 Обработка модели: ${input}...`);

  // 1. Запуск gltfjsx
  execSync(`npx gltfjsx ${input} --types --keepnames -o ${output}`, { stdio: 'inherit' });

  // 2. Исправление путей внутри файла
  let content = fs.readFileSync(output, 'utf8');
  // Ищем '/имя.glb' и заменяем на '/models/имя.glb'
  const wrongPath = `'/${fileName}.glb'`;
  const rightPath = `'/models/${fileName}.glb'`;

  content = content.replaceAll(wrongPath, rightPath);
  fs.writeFileSync(output, content);

  console.log(`✅ Успех! Компонент создан: ${output}`);
  console.log(`🔗 Путь к модели исправлен на: ${rightPath}`);
} catch (error) {
  console.error('❌ Ошибка при генерации:', error.message);
}
