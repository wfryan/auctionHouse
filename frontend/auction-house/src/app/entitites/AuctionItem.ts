export default class AuctionItem{
    private auction_item_id: number
    private item_name: number
    private information: string
    private picture: any
    constructor(aiId: number, iN: number, info: string, pic: any){
        this.auction_item_id = aiId
        this.item_name = iN
        this.information = info
        this.picture = pic
    }
    public setPicture(image: any){
        this.picture = image
    }
    public getPicture(){
        return this.picture
    }
    public getAII(){
        return this.auction_item_id
    }
    public getInfo(){
        return this.information
    }
    public getIN(){
        return this.item_name
    }
}