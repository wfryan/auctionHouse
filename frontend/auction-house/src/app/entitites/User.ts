export default class User {
    private user_id: number
    private username: string
    private description: string | undefined
    private age: number
    private location: string
    private balance: number
    private account_type: string
    constructor(user_id: number, usern: string, age: number, loc: string, type: string, bal: number, desc?: string | undefined) {
        this.user_id = user_id
        this.username = usern
        this.age = age
        this.location = loc
        this.account_type = type
        this.balance = bal
        this.description = desc
    }
}