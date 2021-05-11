const basic = require("./basic.js")

s = ""
s_custom = ""

function get_main(arr, q){
    k = 0
    // n_w is array of n-s which was processed
    temp = 1;
    prev_n = arr[1].n
    res = ""
    for(i = 1; i<q; i++){
        if(arr[i].n != prev_n){
            res += `\\left ( \\frac{${temp}}{${prev_n}} \\right )`
            temp = arr[i].p
            prev_n = arr[i].n
        }else{
            temp *= arr[i].p
        }
    }
    res += `\\left ( \\frac{${temp}}{${prev_n}} \\right )`
    return res;
}

function simplify(arr, q, pref){
    ch = false
    solv = ""
    arr1 = []
    for(i = 0; i < q; i++){
        //`\\left(\\frac{${arr[i].p}}${{arr[i].n}^{${arr[i].pow}}}\\right)`
        solv += `\\left(\\frac{${arr[i].p}}{${arr[i].n}}\\right)^{${arr[i].pow}}`
    }
    solv += ` = `
    k = 0
    for(i = 0; i < q; i++){
        solv += `${pref}\\cdot`
        if(arr[i].pow % 2 == 0){
            solv += `1`
            ch = true
        }else{
            if(arr[i].pow > 1){
                //`\\left(\\frac{${arr[i].p}}${{arr[i].n}^1}\\right)`
                solv += `\\left(\\frac{${arr[i].p}}{${arr[i].n}}\\right)^1`
                temp = {"p": arr[i].p, "n": arr[i].n, "pow":1}
                arr1.push(temp)
                k++
                ch = true;
            }else{
                solv += `\\left(\\frac{${arr[i].p}}{${arr[i].n}}\\right)^1`
                temp = {"p": arr[i].p, "n": arr[i].n, "pow":1}
                arr1.push(temp)
                k++
            }
        }
    }
    console.log(solv)
    solv += ` = `
    return {"arr":arr1, "q":k, "s":solv, "changed":ch}
}

module.exports.jac_custom = (a,n) => {
    s_custom = ""
    f = true

    if (basic.gcd(a,n)>1){
        s_custom = `0\\;$оскільки$\\;\\gcd(${a}, ${n}) = ${basic.gcd(a,n)}`
        f = false
        return {"s":s_custom, "res":0}
    }
    curr_a = a
    curr_n = n

    s_custom = `\\left ( \\frac{${a}}{${n}} \\right ) = `

    if(a != 1){
        factor = basic.factor(a);

        for(i = 0; i < factor.q; i++){
            factor.arr[i].n = curr_n;
        }
        factor_simple = simplify(factor.arr, factor.arr.length, 1)
        if(factor_simple.changed){
            s_custom += factor_simple.s
            factor.arr = factor_simple.arr
            factor.q = factor_simple.q
        }
    }else{
        s_custom += `1`;
        return {"s":s_custom, "res":0}
    }
    prefix = 1
    if(factor.arr.length > 0){
    while(f){

        //q = factor.q

        curr_a = factor.arr[0].p
        curr_n = factor.arr[0].n


        if(factor.arr.length > 1){
            main = get_main(factor.arr, factor.arr.length)
        }else{
            main = ``
        }

        switch(curr_a){
            case 1:
                //solv += `\\left(\\frac{1}{${curr_n}}\\right)
                s_custom += `\\left(\\frac{1}{${curr_n}}\\right)${main} = 1\\cdot${prefix}${main} = `
                //factor.q -= 1
                factor.arr.shift()
                if(factor.arr.length == 0){
                    s_custom += prefix
                    f = false
                    break
                }else{
                    curr_a = factor.arr[0].p
                    curr_n = factor.arr[0].n
                    if(factor.arr.length > 1){
                        main = get_main(factor.arr, factor.arr.length)
                    }else{
                        main = ``
                    }
                }
                break;

            case -1:
                pow = (curr_n - 1)/2
                s_custom += `${prefix}\\left(\\frac{-1}{${curr_n}}\\right)${main} = (-1)^{\\frac{${curr_n} - 1}{2}}\\cdot${prefix}\\cdot${main} = (-1)^{${pow}}\\cdot${prefix}\\cdot${main} = `
                if(pow % 2 != 0){prefix *= -1}
                s_custom += `${prefix}*${main} = `
                factor.q -= 1
                factor.arr.shift()
                if(factor.arr.length == 0){
                    s_custom += prefix
                    f = false
                    break
                }else{
                    factor.arr.shift()
                    curr_a = factor.arr[0].p
                    curr_n = factor.arr[0].n
                    if(factor.arr.length > 1){
                        main = get_main(factor.arr, factor.arr.length)
                    }else{
                        main = ``
                    }
                }
                break;

            case 2:
                pow = (curr_n*curr_n - 1)/8
                s_custom += `${prefix}\\left(\\frac{2}{${curr_n}}\\right)${main} = ${prefix}\\cdot(-1)^{\\frac{${curr_n}^2-1}{8}} ${main} = ${prefix}\\cdot(-1)^{${pow}}${main} = `
                if(pow % 2 != 0){prefix *= -1}
                s_custom += `${prefix}${main} = `
                //s_custom += prefix + "(-1)^" +  + "(" + curr_a + "/" + curr_n + ")" + main + " = "

                factor.arr.shift()
                if(factor.arr.length == 0){
                    s_custom += prefix
                    f = false
                    break
                }else{
                    curr_a = factor.arr[0].p
                    curr_n = factor.arr[0].n
                    if(factor.arr.length > 1){
                        main = get_main(factor.arr, factor.arr.length)
                    }else{
                        main = ``
                    }
                }
                break;

            default:
                pow = ((curr_a-1)*(curr_n-1))/4
                //\\left(\\frac{${curr_n % curr_a}}{${curr_a}}\\right)
                s_custom +=` ${prefix}(-1)^{\\frac{${curr_a}-1}{2}\\frac{${curr_n}-1}{2}}\\left(\\frac{${curr_n}}{${curr_a}}\\right)${main} = ${prefix}(-1)^{${pow}}\\left(\\frac{${curr_n % curr_a}}{${curr_a}}\\right)${main} = `
                if (pow % 2 != 0) prefix *= -1

                curr_a = factor.arr[0].p
                curr_n = factor.arr[0].n
                t = curr_a
                curr_a = curr_n % t
                curr_n = t

                factor.arr.shift()
                factor.q -= 2
                factortemp = basic.factor(curr_a)
                //console.log(curr_a)
                for(i = 0; i < factortemp.q; i++){
                    factortemp.arr[i].n = curr_n
                }
                //console.log(factortemp.arr)
                factor_simple = simplify(factortemp.arr, factortemp.arr.length, prefix)
                //console.log(factor_simple.arr)
                if(factor_simple.arr.length>0){
                    if(factor_simple.changed){
                        s_custom += prefix + factor_simple.s
                        factortemp.arr = factor_simple.arr
                        factortemp.q = factor_simple.q
                    }
                    factor.q += factortemp.q
                    factor.arr = factortemp.arr.concat(factor.arr)
                    console.log(factor.arr)
                    break
                }else{
                    s_custom += prefix + factor_simple.s
                    s_custom += prefix
                    f = false;
                    break;
                }
        }
    }
    }else{
        s_custom += prefix
    }
    return {"s":s_custom, "res":prefix};
}