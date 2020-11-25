<template>
    <q-input
        no-error-icon
        autocomplete="off"
        clearable
        :rules="[val => isAddress(val) || 'Please enter a valid address']"
        v-model.lazy="to"
        label="To"
    >
        <template
            v-if="isAddress(to)"
            v-slot:prepend
        >
            <AddressAvatar
                class="q-mx-auto"
                style="width: 40px; height: 40px; border-radius: 20px;"
                :addr="to"
            />
        </template>
        <template v-slot:append>
            <AddressSelector
                rounded
                dense
                flat
                icon="add"
                :groups="wallets"
                @change="(e) => to = e"
            />
        </template>
    </q-input>
</template>
<script lang="ts">
import Vue from 'vue'
import AddressSelector, { Group } from './AddressSelector.vue'
import { address } from 'thor-devkit'
export default Vue.extend({
    components: {
        AddressSelector
    },
    model: {
        prop: 'address',
        event: 'change'
    },
    props: {
        wallets: {
            type: Array as () => Group[],
            default: []
        },
        address: String
    },
    data() {
        return {
            to: this.address
        }
    },
    watch: {
        to(v: string) {
            this.$emit('change', v)
        }
    },
    methods: {
        isAddress: address.test
    }
})
</script>