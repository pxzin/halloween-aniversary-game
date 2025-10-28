# Debug Helpers - Guia de Uso

Este arquivo contém utilitários para visualizar áreas interativas durante o desenvolvimento.

## Características

- ✅ **Automático**: Só aparecem em modo dev (`pnpm dev`)
- ✅ **Invisível em produção**: Totalmente removidos no build final
- ✅ **Componentizável**: Use em qualquer cena
- ✅ **Informativo**: Mostra dimensões, vértices e labels

## Funções Disponíveis

### ⭐ RECOMENDADO: Criar Áreas Interativas com Debug

Use estas funções para criar zonas interativas que automaticamente mostram debug em dev:

#### 1. `createInteractiveRect()` - Retângulos Interativos

Cria uma zona interativa retangular com debug automático.

```typescript
import { createInteractiveRect, DEBUG_COLORS } from '../utils/DebugHelpers';

// Cria zona interativa + debug em uma chamada
const zone = createInteractiveRect(
  this,           // A cena Phaser
  x,              // Posição X (centro)
  y,              // Posição Y (centro)
  width,          // Largura
  height,         // Altura
  DEBUG_COLORS.CLICKABLE,  // Cor (opcional)
  'Nome da Área'  // Label (opcional)
);

// Adicionar evento de click
zone.on('pointerdown', () => {
  console.log('Clicou!');
});
```

#### 2. `createInteractivePolygon()` - Polígonos Interativos

Cria uma zona interativa em formato de polígono customizado.

```typescript
import { createInteractivePolygon, DEBUG_COLORS } from '../utils/DebugHelpers';

const points = [
  { x: 100, y: 100 },
  { x: 200, y: 150 },
  { x: 180, y: 250 },
  { x: 120, y: 230 },
];

const zone = createInteractivePolygon(
  this,
  points,
  DEBUG_COLORS.HOTSPOT,
  'Área Customizada'
);

zone.on('pointerdown', () => {
  console.log('Clicou no polígono!');
});
```

#### 3. `createInteractiveCircle()` - Círculos Interativos

Cria uma zona interativa circular.

```typescript
import { createInteractiveCircle, DEBUG_COLORS } from '../utils/DebugHelpers';

const zone = createInteractiveCircle(
  this,
  x,
  y,
  radius,
  DEBUG_COLORS.ITEM,
  'Item'
);

zone.on('pointerdown', () => {
  console.log('Pegou o item!');
});
```

---

### Funções de Debug Manual (uso avançado)

Use apenas se precisar desenhar debug sem criar zonas:

#### `drawDebugRect()` - Desenhar Retângulo

```typescript
import { drawDebugRect, DEBUG_COLORS } from '../utils/DebugHelpers';

drawDebugRect(this, x, y, width, height, DEBUG_COLORS.CLICKABLE, 'Nome');
```

### 2. `drawDebugPolygon()` - Polígonos

Desenha um polígono personalizado com vértices numerados.

```typescript
import { drawDebugPolygon, DEBUG_COLORS } from '../utils/DebugHelpers';

const points = [
  { x: 100, y: 100 },
  { x: 200, y: 150 },
  { x: 180, y: 250 },
  { x: 120, y: 230 },
];

drawDebugPolygon(
  this,
  points,
  DEBUG_COLORS.HOTSPOT,
  'Polígono Customizado'
);
```

### 3. `drawDebugCircle()` - Círculos

Desenha um círculo sobre áreas circulares.

```typescript
import { drawDebugCircle, DEBUG_COLORS } from '../utils/DebugHelpers';

drawDebugCircle(
  this,
  x,
  y,
  radius,
  DEBUG_COLORS.ITEM,
  'Item Clicável'
);
```

## Cores Disponíveis

Use as cores pré-definidas para diferentes tipos de áreas:

```typescript
DEBUG_COLORS.CLICKABLE    // 0xff0000 - Vermelho (áreas clicáveis)
DEBUG_COLORS.TRIGGER      // 0x00ff00 - Verde (zonas de trigger)
DEBUG_COLORS.COLLIDER     // 0x0000ff - Azul (colisões)
DEBUG_COLORS.HOTSPOT      // 0xffff00 - Amarelo (hotspots)
DEBUG_COLORS.NAVIGATION   // 0xff00ff - Magenta (navegação)
DEBUG_COLORS.ITEM         // 0x00ffff - Ciano (itens)
```

Ou use qualquer cor hex:

```typescript
drawDebugRect(this, x, y, w, h, 0xff9900, 'Laranja');
```

## Exemplo Completo

```typescript
import Phaser from 'phaser';
import {
  createInteractiveRect,
  createInteractiveCircle,
  DEBUG_COLORS
} from '../utils/DebugHelpers';

export class MyScene extends Phaser.Scene {
  create(): void {
    // Porta clicável - retângulo
    const doorZone = createInteractiveRect(
      this,
      400, 300,  // x, y
      100, 200,  // width, height
      DEBUG_COLORS.CLICKABLE,
      'Porta'
    );
    doorZone.on('pointerdown', () => this.openDoor());

    // Item coletável - círculo
    const keyZone = createInteractiveCircle(
      this,
      600, 450,  // x, y
      25,        // radius
      DEBUG_COLORS.ITEM,
      'Chave'
    );
    keyZone.on('pointerdown', () => this.collectKey());

    // Área de trigger (sem label)
    const triggerZone = createInteractiveRect(
      this,
      800, 200,
      150, 100,
      DEBUG_COLORS.TRIGGER
    );
    triggerZone.on('pointerdown', () => this.triggerEvent());
  }

  private openDoor(): void {
    console.log('Porta aberta!');
  }

  private collectKey(): void {
    console.log('Chave coletada!');
  }

  private triggerEvent(): void {
    console.log('Evento acionado!');
  }
}
```

## Informações Visuais

Cada debug helper mostra:

- **Retângulo/Polígono/Círculo**: Área semi-transparente (20% de opacidade)
- **Borda**: Linha sólida de 2px
- **Crosshair** (retângulos e círculos): Cruz no centro para posicionamento preciso
- **Vértices numerados** (polígonos): Círculos em cada vértice com número de índice
- **Label**: Texto com fundo colorido (se fornecido)

## Dicas de Uso

1. **Durante desenvolvimento**: Use para visualizar e ajustar áreas clicáveis
2. **Para ajustes**: Os números nos vértices ajudam a referenciar posições específicas
3. **Múltiplas áreas**: Use cores diferentes para distinguir tipos de interação
4. **Build de produção**: Não precisa remover o código - ele some automaticamente!

## Checklist ao criar nova cena

- [ ] Importar os helpers: `import { createInteractiveRect, DEBUG_COLORS } from '../utils/DebugHelpers'`
- [ ] Usar `createInteractiveRect()` ou outra função create* para criar zona + debug de uma vez
- [ ] Adicionar event listener com `.on('pointerdown', callback)`
- [ ] Testar no navegador e ajustar as coordenadas/dimensões
- [ ] Commit o código - o debug permanece e desaparece automaticamente em produção!
