import * as ROT from 'rot-js';
import { Actor, Entity } from '../Entity';
import { Action, MeleeAction, MovementAction, WaitAction } from '../inputHandler';

export abstract class BaseAI implements Action {
    path: Array<[number, number]>

    constructor() {
        this.path = []
    }

    perform (_entity: Entity) {}

    calculatePathTo(destX: number, destY: number, entity: Entity) {
        const isPassable = (x: number, y: number) => window.engine.gameMap.tiles[y][x].walkable
        const dijkstra = new ROT.Path.Dijkstra(destX, destY, isPassable, {})

        this.path = []

        dijkstra.compute(entity.x, entity.y, (x: number, y: number) => {
            this.path.push([x, y])
        })

        this.path.shift()
    }
}

export class BrawlerEnemy extends BaseAI {
    constructor() {
        super()
    }

    perform(entity: Entity): void {
        const target = window.engine.player
        const dx = target.x - entity.x
        const dy = target.y - entity.y

        const distance = Math.max(Math.abs(dx), Math.abs(dy))

        if(window.engine.gameMap.tiles[entity.y][entity.x].visible) {
            if (distance <= 1) {
                return new MeleeAction(dx, dy).perform(entity as Actor)
            }
            this.calculatePathTo(target.x, target.y, entity)
        }

        if (this.path.length > 0) {
            const [destx, desty] = this.path[0]
            this.path.shift()

            return new MovementAction(destx - entity.x, desty - entity.y).perform(entity)
        }

        // TODO: replace this for a random movement action
        return new WaitAction().perform(entity)
    }
}