extends BaseNetworkHandler
class_name MarketHandler

func fetch_listings(user_id: int):
	_request("/market/listings?userId=" + str(user_id), HTTPClient.METHOD_GET)

func list_item(user_id: int, item_id: int, price: int):
	_request("/market/list", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"itemId": item_id,
		"price": price
	})

func buy_item(user_id: int, listing_id: int):
	_request("/market/buy", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"listingId": listing_id
	})

func sell_to_npc(user_id: int, item_id: int):
	_request("/market/sell-npc", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"itemId": item_id
	})
