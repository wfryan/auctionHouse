export default class Auction{
    private auction_id: number
    private item_id: number
    private seller_id: number
    private starting_bid: number
    private highest_bid: number //id of highest bid
    private status: string
    private start_time: Date
    private end_time: Date
    private auctioncol: string = ""
    private winner_id: number = NaN
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
    public setAuctionCol(auctionCol: string){
        this.auctioncol = auctionCol
    }
    public getAuctionCol(){
        return this.auctioncol
    }
    public setWinId(winId: number){
        this.winner_id = winId
    }
    public getWinId(){
        return this.winner_id
    }
    public getAID(){
        return this.auction_id
    }
    public getSID(){
        return this.seller_id
    }
    public getSBid(){
        return this.starting_bid
    }
    public getHBid(){
        return this.highest_bid
    }
    public getStatus(){
        return this.status
    }
    public getSTime(){
        return this.start_time
    }
    public getETime(){
        return this.end_time
    }
}