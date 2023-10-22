import { derived, Store } from "./mega.js";

derived(new Store("", {
    state() {
        return {
            count: 0
        }
    },
}), (state) => {
    return state
});
