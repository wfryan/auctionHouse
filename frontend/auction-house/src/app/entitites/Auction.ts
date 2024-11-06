export default class Auction{
    private auction_id: number
    private item_id: number
    private seller_id: number
    private starting_bid: number
    private highest_bid: number //id of highest bid
    private status: string
    private start_time: Date
    private end_time: Date
    constructor(aId: number, iId: number, sId: number, sBid: number, hBid: number, stat: string, sTime: Date, eTime: Date){
        this.auction_id = aId
        this.item_id = iId
        this.seller_id = sId
        this.starting_bid = sBid
        this.highest_bid = hBid
        this.status = stat
        this.start_time = sTime
        this.end_time = eTime
    }
}