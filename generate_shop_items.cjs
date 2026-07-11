const fs = require('fs');

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const rarities = ['Common', 'Rare', 'Epic', 'Legendary'];
function randomRarity() {
  return rarities[randomInt(0, 3)];
}

const instruments = [];
for (let i = 1; i <= 50; i++) {
  const isHarp = Math.random() > 0.5;
  instruments.push({
    id: `instrument_gen_${i}`,
    item_name: `${isHarp ? 'Harp' : 'Guitar'} of power ${i}`,
    category: 'instrument',
    coin_cost: randomInt(20, 500),
    description: `A mighty ${isHarp ? 'harp' : 'guitar'} for math rock stars!`,
    icon_emoji: isHarp ? '🪕' : '🎸',
    rarity: randomRarity(),
    accent_color: 'from-blue-500 to-blue-700'
  });
}

const hairs = [];
for (let i = 1; i <= 20; i++) {
  hairs.push({
    id: `hair_gen_${i}`,
    item_name: `Cool Hairstyle ${i}`,
    category: 'hair',
    coin_cost: randomInt(20, 500),
    description: `A fresh new look for your avatar.`,
    icon_emoji: '💇',
    rarity: randomRarity(),
    accent_color: 'from-pink-500 to-purple-600'
  });
}

const outfits = [];
for (let i = 1; i <= 40; i++) {
  outfits.push({
    id: `body_gen_${i}`,
    item_name: `Rock Outfit ${i}`,
    category: 'body',
    coin_cost: randomInt(20, 500),
    description: `Dress to impress on the math stage.`,
    icon_emoji: '👕',
    rarity: randomRarity(),
    accent_color: 'from-green-400 to-emerald-600'
  });
}

const allNewItems = [...instruments, ...hairs, ...outfits];

let content = fs.readFileSync('src/lib/shopCatalog.ts', 'utf8');

// Also update existing items that have coin_cost < 20
content = content.replace(/coin_cost:\s*(\d+)/g, (match, p1) => {
  const cost = parseInt(p1, 10);
  if (cost < 20) return `coin_cost: ${cost === 0 ? 20 : Math.max(20, cost)}`;
  return match;
});

const newItemsStr = allNewItems.map(item => `  {
    id: '${item.id}',
    item_name: '${item.item_name}',
    category: '${item.category}',
    coin_cost: ${item.coin_cost},
    description: '${item.description}',
    icon_emoji: '${item.icon_emoji}',
    rarity: '${item.rarity}',
    accent_color: '${item.accent_color}'
  }`).join(',\n');

content = content.replace(/];$/, `,\n${newItemsStr}\n];`);

fs.writeFileSync('src/lib/shopCatalog.ts', content);
console.log('Shop items generated and updated.');
