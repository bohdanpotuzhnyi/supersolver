const basic = require("./basic.js")

function jacobi(a){
    var b = new Object(); b[0] = 1; b[1] = 1; b[2] = 1; // Array(1,1,1);
    var sign = a[0];
    var m = a[1];
    var n = a[2];
    if( sign > 0 ) s+=("("+m+"/"+n+") = ");
    if( sign < 0 ) s+=("-("+m+"/"+n+") = ");
    if( m > n-1 ) {
        m = m % n;
        if( sign > 0 ) s+=("("+m+"/"+n+") = ");
        if( sign < 0 ) s+=("-("+m+"/"+n+") = ");
    }
    m = m % n;
    if( m == 0 ){
        s+=("0");
        return 0;
    }
    if( m == 1 ) {
        if( sign > 0 ) { s+=("1"); return 1; }
        s+=("-1"); return -1;
    }
    var J2n = 1;
    if( (3 == (n%8)) || (5 == (n%8)) ) J2n = -1;
    if( 0 == (m%2) ) {
        b[0] = J2n*sign;
        b[1] = m/2;
        b[2] = n;
        return jacobi(b);
    }
    if( (3 == (n%4)) && (3 == (m%4)) ) {
        b[0] = -sign;
        b[1] = n % m;
        b[2] = m;
        return jacobi(b);
    } else {
        b[0] = sign;
        b[1] = n % m;
        b[2] = m;
        return jacobi(b);
    }
}

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
            res += "(" + temp + "/" + n + ")"
            temp = arr[i].p
            prev_n = arr[i].n
        }else{
            temp *= arr[i].p
        }
    }
    return res;
}

function simplify(arr, q){
    ch = false
    solv = ""
    arr1 = []
    for(i = 0; i < q; i++){
        solv += "("+arr[i].p+"/"+arr[i].n+")^"+arr[i].pow
    }
    solv += " = "
    k = 0
    for(i = 0; i < q; i++){
        if(arr[i].pow % 2 == 0){
            solv += "1*"
            ch = true
        }else{
            if(arr[i].pow > 1){
                solv += "("+arr[i].p+"/"+arr[i].n+")^1"
                temp = {"p": arr[i].p, "n": arr[i].n, "pow":1}
                arr1.push(temp)
                //console.log(arr1[0])
                k++
                ch = true;
            }else{
                //console.log("hello")
                solv += "("+arr[i].p+"/"+arr[i].n+")^1"
                temp = {"p": arr[i].p, "n": arr[i].n, "pow":1}
                arr1.push(temp)

                k++
            }
        }
    }
    solv += " = "
    return {"arr":arr1, "q":k, "s":solv, "changed":ch}
}

module.exports.check_simple = (a,n) =>{
    solv = ""
    factor = basic.factor(a);
    for(i = 0; i < factor.q; i++){
        factor.arr[i].n = n;
    }
    factor_simple = simplify(factor.arr, factor.q)
    if(factor_simple.changed){
        solv += factor_simple.s
    }
    return solv
}

module.exports.jac_custom = (a,n) => {
    s_custom = ""
    f = true
    if (basic.gcd(a,n)>1){
        s_custom = "0 оскільки gcd(" + a + ", " + n +  ") = " + basic.gcd(a,n)
        f = false
        return s_custom
    }
    curr_a = a
    curr_n = n
    arr = []
    //adding n for all primes

    s_custom = "(" + a + "/" + n + ")" + " = "

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
        s_custom += "1";
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
            main = ""
        }
        if(curr_a == 1){
            s_custom += "(1/" + curr_n + ")" + main + " = " + "1*" + prefix + main + " = "
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
            s_custom += prefix + "*(-1/" + curr_n + ")" + main + " = " + "(-1)^((" + curr_n  + "- 1)/2)*" + prefix + "*" + main + " = " + "(-1)^(" + pow + ")*" + prefix + "*" + main + " = "
            if(pow % 2 != 0){prefix *= -1}
            s_custom += prefix + "*" + main + " = "
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
                    main = ""
                }
            }
        }
        if(curr_a == 2){
            pow = (curr_n*curr_n - 1)/8
            s_custom += prefix + "(2/" + curr_n + ")" + main + " = " + prefix + "*(-1)^((" + curr_n + "^2-1)/8)" + main + " = " + prefix + "*(-1)^" + pow + main + " = "
            if(pow % 2 != 0){prefix *= -1}
            s_custom += prefix + main + " = "
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
                    main = ""
                }
            }
        }
        pow = ((curr_a-1)*(curr_n-1))/4
        s_custom += prefix + "(-1)^(((" + curr_a + "-1)/2)*((" + curr_n + "-1)/2))" + "("+ curr_n+"/"+ curr_a +")" + main + " = " + prefix + "(-1)^" + pow + "("+ (curr_n % curr_a) +"/"+ curr_a +")" + main + " = "
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

module.exports.jac = (m,n) => {
    //var s = ""
    if( 0 == n % 2 ){
        s = "The bottom number must be odd";
        return;
    }
    if( (n < 0) || (m < 0) ){
        s = "No negative numbers please";
        return;
    }
    var a = new Object(); a[0] = 1; a[1] = m; a[2] = n;

    var ans = jacobi(a);

    if( (ans == 1) && (n < 30000) ) {
        res = false;
        for( var i = 1; i < n/2; i++ ) {
            if( 0 == (((i*i)-m) % n) ) {
                res = true;
                s+=("\nA residue: "+m+" = "+i+"^2 mod "+n);
                break;
            }
        }
        if (res == false) s+=("Not a residue");
    }

    return s;
}