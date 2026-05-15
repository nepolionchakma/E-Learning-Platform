const fs = require('fs');
const path = 'C:\\Users\\NC\\Desktop\\E-Learning Platform\\src\\data\\linux.json';
let content = fs.readFileSync(path, 'utf8');
// Fix all broken JSON keys: "key" - VALUE -> "key": VALUE
content = content.replace(/"(\w+)"\s+-\s+/g, '"$1": ');
fs.writeFileSync(path, content, 'utf8');
console.log('JSON fully fixed');
