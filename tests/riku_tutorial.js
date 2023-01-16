const get_user =  (index, nameorage) => {
    index = index -1
    x = [ 
        {'name': 'riku',
         'age': 69},
         {'name': 'elijah',
         'age': 15},
         {'name': 'juno',
         'age': 42}
        ]
    console.log(x[index][nameorage])
}

module.exports = get_user