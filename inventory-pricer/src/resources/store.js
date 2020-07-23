import { writable, derived } from 'svelte/store'

function createCart() {
	const { subscribe, set, update } = writable(new Array())
	
	return  {
		subscribe,
		add: (item) => {
			update(items => {
				const index = items.findIndex(x => x.id === item.id)
				
				if (index === -1)
					items.push({
						count: 1,
						...item,
					})
				else 
					items[index].count += 1

				
				console.log(items)
				return items
			})
		},
		remove: (item) => {
			update(items => {
				const index = items.findIndex(x => x.id === item.id)

				if (index === -1)
					return items
				else{
					const cartItem = items.find(x => x.id === item.id)
					if (cartItem.count > 1)
						cartItem.count -= 1
					else if (cartItem.count === 1)
						items.splice(index, 1)
				}


				console.log(items)
				return items
			})
		},	
		setItemCount: (item, newCount) => {
			update(items => {
				const itemToUpdate = items.find(x => x.id === item.id)
				if (!itemToUpdate) {
					items.push({
						count: newCount,
						...item
					})
				}
				else {
					itemToUpdate.count = newCount
				}

				return items
			})
		},
	}

}

export const cart = createCart()

export const cartValue = derived(
	cart,
	$cart => $cart.reduce((acc, curr) => acc += (curr.price * curr.count) , 0),
)