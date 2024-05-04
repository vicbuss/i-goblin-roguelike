import { BaseAI, BrawlerEnemy } from "./components/ai"
import { Fighter } from "./components/fighter"

export enum RenderOrder {
  Corpse,
  Item,
  Actor
}

export class Entity {

  constructor(
   public x: number,
    public y: number,
    public char: string,
    public fg: string = '#fff',
    public bg: string = '#000',
    public name: string = '<Unnamed>',
    public blocksMovement: boolean = false,
    public renderOrder: RenderOrder = RenderOrder.Corpse
  ) {}

  move(dx: number, dy: number) {
    this.x += dx
    this.y += dy
  }
}

export class Actor extends Entity {
  constructor(
    public x: number,
    public y: number,
    public char: string,
    public fg: string = '#fff',
    public bg: string = '#000',
    public name: string = '<Unnamed>',
    public ai: BaseAI | null,
    public fighter: Fighter
  ) {
    super(x, y, char, fg, bg, name, true, RenderOrder.Actor)
    this.fighter.entity = this
  }

  public get isAlive(): boolean {
    return !!this.ai || window.engine.player === this
  }
}

export function spawnPlayer(x: number, y: number): Actor {
  return new Actor(x, y, 'g', '#00FF00', '#000', 'Goblin', null, new Fighter(30, 2, 5))
}

export function spawnDwarf(x: number, y: number): Actor {
  return new Actor(x, y, 'd', '#00FFFF', '#000', 'Dwarf', new BrawlerEnemy(), new Fighter(10, 0, 3))
}


export function spawnSlaveOgre(x: number, y: number): Actor {
  return new Actor(x, y, 'O', '#F0FFFF', '#000', 'Slave Ogre', new BrawlerEnemy(), new Fighter(16, 1, 4))
}