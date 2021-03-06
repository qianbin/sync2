import type { Vault } from './index'
import { address, HDNode } from 'thor-devkit'
import { decrypt } from './cipher'

export type Entity = {
    type: Vault.Type
    pub: string
    chainCode?: string
    cipherGlob?: string
}

export function newVault(entity: Entity): Vault {
    const vault: Vault = {
        get type() { return entity.type },
        derive: index => {
            if (entity.type === 'static') {
                if (index !== 0) {
                    // static type vault only support 0-index node
                    throw new Error('invalid node index')
                }
                const addr = address.fromPublicKey(Buffer.from(entity.pub, 'hex'))

                return {
                    get address() { return addr },
                    get index() { return index },
                    unlock: key => vault.decrypt(key)
                }
            } else {
                const node = HDNode.fromPublicKey(
                    Buffer.from(entity.pub, 'hex'),
                    Buffer.from(entity.chainCode!, 'hex')
                ).derive(index)

                return {
                    get address() { return node.address },
                    get index() { return index },
                    unlock: key => {
                        const clearText = vault.decrypt(key)
                        const words = clearText.toString('utf8').split(' ')
                        return HDNode.fromMnemonic(words).derive(index).privateKey!
                    }
                }
            }
        },
        decrypt: key => {
            if (!entity.cipherGlob) {
                // usb type has no cipher glob
                throw new Error('unsupported operation')
            }
            return decrypt(JSON.parse(entity.cipherGlob), key)
        },
        encode: () => JSON.stringify(entity)
    }
    return vault
}
