# Debug Helpers - Guia de Uso

Este arquivo contém utilitários para criar e visualizar áreas interativas durante o desenvolvimento.

## Características

- ✅ **Área clicável = Visualização**: O que você vê é EXATAMENTE o que é clicável
- ✅ **Automático em Dev**: Debug visual aparece automaticamente em modo dev
- ✅ **Invisível em produção**: Totalmente removido no build final
- ✅ **Ferramenta de medição**: Desenhe retângulos com o mouse para obter coordenadas exatas

## 🎯 Fluxo de Trabalho Recomendado

### 1. Medir a Área com a Ferramenta de Desenho

Use a ferramenta de desenho para obter coordenadas exatas:

```typescript
import { enableRectangleDrawTool } from '../utils/RectangleDrawTool';

create() {
  // Ativa a ferramenta (só funciona em dev mode)
  enableRectangleDrawTool(this);
}
```

**Como usar:**
1. Pressione e SEGURE a tecla **R**
2. Arraste o mouse para desenhar um retângulo
3. Solte o mouse - as coordenadas aparecem no console
4. **Ajustar o retângulo:**
   - **Arrastar**: Clique no meio do retângulo e arraste para mover
   - **Redimensionar**: Arraste os círculos brancos (cantos) ou quadrados brancos (bordas)
   - **Re-logar**: Pressione **SPACE** para logar as coordenadas atualizadas
   - **Limpar**: Pressione **ESC** para apagar e começar de novo
5. Copie os valores do console

**Recursos de debug:**
- Ao clicar (pointer down/up), o console mostra:
  - `pointer.x` e `pointer.y` (coordenadas usadas pelo Phaser)
  - `pointer.worldX` e `pointer.worldY` (coordenadas no mundo)
  - `canvas.offsetLeft` e `canvas.offsetTop` (offset do canvas)
- Isso ajuda a identificar desalinhamentos entre mouse e coordenadas

### 2. Criar Área Clicável com as Coordenadas

Use as coordenadas obtidas para criar a área clicável:

```typescript
import { createClickableRect, DEBUG_COLORS } from '../utils/DebugHelpers';

const gateZone = createClickableRect(
  this,           // scene
  640,            // centerX (do console)
  504,            // centerY (do console)
  384,            // width (do console)
  288,            // height (do console)
  true,           // showDebug (true = visível, false = invisível)
  DEBUG_COLORS.CLICKABLE,
  'Gate Zone'     // label
);

// Adicionar evento de click
gateZone.on('pointerdown', () => {
  console.log('Clicou no portão!');
});
```

## Funções Disponíveis

### ⭐ createClickableRect()

Cria uma área clicável que **SE DESENHA** quando showDebug é true.
Isto garante que a área clicável e a visualização são **EXATAMENTE** a mesma coisa.

```typescript
import { createClickableRect, DEBUG_COLORS } from '../utils/DebugHelpers';

// Criar área clicável com debug visível
const zone = createClickableRect(
  this,                      // scene
  centerX,                   // X do centro
  centerY,                   // Y do centro
  width,                     // Largura
  height,                    // Altura
  true,                      // showDebug (true = visível)
  DEBUG_COLORS.CLICKABLE,    // Cor
  'Gate'                     // Label (opcional)
);

// Adicionar evento de click
zone.on('pointerdown', () => {
  console.log('Clicou!');
});
```

**Parâmetros:**
- `scene`: A cena Phaser
- `centerX`, `centerY`: Coordenadas do **centro** do retângulo
- `width`, `height`: Dimensões
- `showDebug`: Se true, mostra visualização (padrão: true em dev, false em prod)
- `color`: Cor da visualização (padrão: vermelho)
- `label`: Texto opcional para identificar a área

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
