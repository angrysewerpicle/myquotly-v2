function setres(res1, res2, res3, res4, res5) {
    if (res1){
        console.log('res1')
    } else if (res2) {
        console.log('res2')
    } else if (res3) {
        console.log('res3')
    } else if (res4) {
        console.log('res4')
    } else if (res5) {
        console.log('res5')
    }
    
}
var res1, res2, res3, res4, res5 = false

res3 = true
setres(res1, res2, res3, res4, res5)