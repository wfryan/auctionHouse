export default class Bid{
    private bid_id: number
    private auction_id: number
    private buyer_id: number
    private amount: number
    private bidTime: Date
    constructor(bId: number, aId: number, buId: number, amnt: number, bTime: Date){
        this.bid_id = bId
        this.auction_id = aId
        this.buyer_id = buId
        this.amount = amnt
        this.bidTime = bTime
    }
}