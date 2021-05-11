module.exports.gcd = (a,b) => {
    r_2 = 0, r_1 = a, r_ = b;
    while (r_ != 0) {
        r_2 = r_1;
        r_1 = r_;
        r_ = r_2 % r_1;
    }
    return r_1;
}

module.exports.ea = (n, m) => {
    r = []
    q = []
    r_2, r_1 = a, r_ = b
    r.push(r_1)
    r.push(r_)
    while (r_ != 0) {
        r_2 = r_1
        r_1 = r_
        r_ = r_2 % r_1
        r.push(r_)
        q.push((r_2 - r_) / r_1)
    }
    return {"r":r, "q":q};
}
module.exports.prime = (p) =>{
    for (i2 = 2; i2*i2 <= p; i2++) {
        if (p % i2 == 0) { return false; }
    }
    return true;
}
function prime(k){
    for (i2 = 2; i2*i2 <= k; i2++) {
        if (k % i2 == 0) { return false; }
    }
    return true;
}

module.exports.factor = (num) => {
    snum = num
    prevnum = num
    ch = false
    k = 0
    solv = ""
    s = []
    for (i1 = 2; i1*i1 <= num; i1++) {

        if (num % i1 == 0) {
            ch = true
            s.push({"p":i1, "pow":1})
            k++
            prevnum = num
            num = num / i1
            solv += prevnum + ":" + i1 + "\n";
            if (num % i1 != 0) {
                solv += num + "!" + i1 + "\n";
            }
            while (num % i1 == 0) {
                s[k-1].pow += 1;
                prevnum = num;
                num = num / i1;
                solv += prevnum + ":" + i1 + "\n";
                if (num % i1 != 0) {
                    solv += num + "!" + i1 + "\n";
                }
            }
            //solv += "step " + i1 + " = " + s[i1] + "\n";
        }
        else {
            if (prime(i1)){
                solv += num + "!" + i1 +"\n";
            }
        }
        if (num == 1) { break; }
    }
    if (prime(num) && (num != 1)) {
        s[k]= {"p":num, "pow": 1};
        k++;
        solv += num + " - proste" + "\n";
    }else{
        if (prime(snum)) {
            s[k]= {"p":snum, "pow": 1};
            k++;
            solv += snum + " - proste" + "\n";
        }
    }
    solv += "\n" + snum + " = " + s[0].p + "^" + s[0].pow;

    for (i = 1; i < k; i++) {
        solv += "*" + s[i].p + "^" + s[i].pow;
    }
    return {"q":k, "arr":s, "solving":solv};
}