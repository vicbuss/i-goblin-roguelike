import { Actor, RenderOrder } from "../Entity";
import { BaseComponent } from "./baseComponent";

export class Fighter implements BaseComponent {
    entity: Actor | null
    _hp: number

    constructor(
        public maxHp: number,
        public defense: number,
        public power: number
    ) {
        this._hp = maxHp
        this.entity = null
    }

    public get hp(): number {
        return this._hp
    }

    public set hp(value: number) {
        this._hp = Math.max(0, Math.min(value, this._hp))
        if(this._hp === 0 && this.entity?.isAlive) {
            this.die()
        }
    }

    public die() {
        if (!this.entity) return
        let deathMessage = ''

        if(window.engine.player === this.entity) {
            deathMessage = 'You died!'
        } else {
            deathMessage = `${this.entity.name} is dead!`
        }

        this.entity.char = '%'
        this.entity.fg = '#bf0000'
        this.entity.blocksMovement = false
        this.entity.ai = null
        this.entity.name = `A dead ${this.entity.name}`
        this.entity.renderOrder = RenderOrder.Corpse

        console.log(deathMessage)
    }
}