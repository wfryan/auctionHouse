interface ImageResponse {
    data: number[],
    type: string
}
export default class AuctionItem {
    private auction_item_id: number
    private item_name: string
    private information: string
    private picture: ImageResponse
    constructor(aiId: number, iN: string, info: string, pic: ImageResponse) {
        this.auction_item_id = aiId
        this.item_name = iN
        this.information = info
        this.picture = pic
    }
    public setPicture(image: ImageResponse) {
        this.picture = image
    }
    public getPicture() {
        return this.picture
    }
    public getAIId() {
        return this.auction_item_id
    }
    public getInfo() {
        return this.information
    }
    public getIN() {
        return this.item_name
    }
}