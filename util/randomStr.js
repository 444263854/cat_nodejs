/**
 * @param {number} min 
 * @param {number} max
 * @param {boolean} rangeFlag 是否开启长度范围，默认是固定长度的随机码
 *  */
function getRandomCode(min = 6, max, rangeFlag) {
    let Code = '',
        len = min,
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
            'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
            'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
        ];

    if (rangeFlag) {
        len = Math.round(Math.random() * (max - min) + min)
    }

    for (let i = 0; i < len; i++) {
        let index = Math.round(Math.random() * (arr.length - 1))
        Code += arr[index]
    }

    return Code

}

module.exports = getRandomCode