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

function simplify(arr, q){
    ch = false
    solv = ""
    arr1 = []
    for(i = 0; i < q; i++){
        //`\\left(\\frac{${arr[i].p}}${{arr[i].n}^{${arr[i].pow}}}\\right)`
        solv += `\\left(\\frac{${arr[i].p}}{${arr[i].n}^{${arr[i].pow}}}\\right)`
    }
    solv += ` = `
    k = 0
    for(i = 0; i < q; i++){
        if(arr[i].pow % 2 == 0){
            solv += `1*`
            ch = true
        }else{
            if(arr[i].pow > 1){
                //`\\left(\\frac{${arr[i].p}}${{arr[i].n}^1}\\right)`
                solv += `\\left(\\frac{${arr[i].p}}{${arr[i].n}^1}\\right)`
                temp = {"p": arr[i].p, "n": arr[i].n, "pow":1}
                arr1.push(temp)
                k++
                ch = true;
            }else{
                solv += `\\left(\\frac{${arr[i].p}}{${arr[i].n}^1}\\right)`
                temp = {"p": arr[i].p, "n": arr[i].n, "pow":1}
                arr1.push(temp)
                k++
            }
        }
    }
    solv += ` = `
    return {"arr":arr1, "q":k, "s":solv, "changed":ch}
}

module.exports.jac_custom = (a,n) => {
    s_custom = ""
    f = true
    if (basic.gcd(a,n)>1){
        s_custom = `0\\,оскільки\\gcd(${a}, ${n}) = ${basic.gcd(a,n)}`
        f = false
        return s_custom
    }
    curr_a = a
    curr_n = n
    arr = []
    //adding n for all primes

    s_custom = `\\left ( \\frac{${a}}{${n}} \\right ) = `

    if(a != 1){
        factor = basic.factor(a);

        for(i = 0; i < factor.q; i++){
            factor.arr[i].n = curr_n;
        }
        factor_simple = simplify(factor.arr, factor.q)
        if(factor_simple.changed){
            s_custom += factor_simple.s
            factor.arr = factor_simple.arr
            factor.q = factor_simple.q
        }
    }else{
        s_custom += `1`;
        return s_custom;
    }

    while(f){
        //factor_simple = []
        q = factor.q
        //console.log(s_custom)
        curr_a = factor.arr[0].p
        curr_n = factor.arr[0].n
        prefix = 1
        if(q>1){
            main = get_main(factor.arr, factor.q)
        }else{
            main = ``
        }
        if(curr_a == 1){
            //solv += `\\left(\\frac{1}{${curr_n}}\\right)
            s_custom += `\\left(\\frac{1}{${curr_n}}\\right)${main} = 1*${prefix}${main} = `
            factor.q -= 1
            factor.arr.shift()
            if(q = 1){
                s_custom += "1"
                f = false
                break
            }else{
                curr_a = factor.arr[0].p
                curr_n = factor.arr[0].n
                main = get_main(factor.arr, factor.q)
            }
        }
        if(curr_a == -1){
            pow = (curr_n - 1)/2
            s_custom += `${prefix}\\left(\\frac{-1}{${curr_n}}\\right)${main} = (-1)^{\\frac{${curr_n} - 1}{2}}*${prefix}*${main} = (-1)^{${pow}}*${prefix}*${main} = `
            if(pow % 2 != 0){prefix *= -1}
            s_custom += `${prefix}*${main} = `
            factor.q -= 1
            factor.arr.shift()
            if(q = 1){
                s_custom += prefix
                f = false
                break
            }else{
                curr_a = factor.arr[0].p
                curr_n = factor.arr[0].n
                if(q>1){
                    main = get_main(factor.arr, factor.q)
                }else{
                    main = ``
                }
            }
        }
        if(curr_a == 2){
            pow = (curr_n*curr_n - 1)/8
            s_custom += `${prefix}\\left(\\frac{2}{${curr_n}}\\right)${main} = ${prefix}*(-1)^{\\frac{${curr_n}^2-1}{8}} ${main} = ${prefix}*(-1)^{${pow}}${main} = `
            if(pow % 2 != 0){prefix *= -1}
            s_custom += `${prefix}${main} = `
            //s_custom += prefix + "(-1)^" +  + "(" + curr_a + "/" + curr_n + ")" + main + " = "
            if(q = 1){
                s_custom += prefix
                f = false
                break
            }else{
                curr_a = factor.arr[0].p
                curr_n = factor.arr[0].n
                if(q>1){
                    main = get_main(factor.arr, factor.q)
                }else{
                    main = ``
                }
            }
        }
        pow = ((curr_a-1)*(curr_n-1))/4
        //\\left(\\frac{${curr_n % curr_a}}{${curr_a}}\\right)
        s_custom +=` ${prefix}(-1)^{\\frac{${curr_a}-1}{2}\\frac{${curr_n}-1}{2}}\\left(\\frac{${curr_n}}{${curr_a}}\\right)${main} = ${prefix}(-1)^{${pow}}\\left(\\frac{${curr_n % curr_a}}{${curr_a}}\\right)${main} = `
        t = curr_a
        curr_a = curr_n % t
        curr_n = t

        //console.log(curr_a*curr_n)

        factor.arr.shift()
        //console.log(factor.arr)

        factor.q -= 1
        factortemp = basic.factor(curr_a)
        for(i = 0; i < factortemp.q; i++){
            factortemp.arr[i].n = curr_n
        }

        factor_simple = simplify(factortemp.arr, factortemp.q)

        if(factor_simple.changed){
            solv += factor_simple.s
            factortemp.arr = factor_simple.arr
            factortemp.q = factor_simple.q
        }
        factor.q += factortemp.q - 1
        factor.arr = factor.arr.concat(factortemp.arr)
        //console.log(factor.arr[0])
    }
    return s_custom;
}