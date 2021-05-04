//check
var s = ""
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

module.exports.jac = (m,n) => {
    s = ""
    //check name
    if( 0 == n % 2 ){
        alert("The bottom number must be odd");
        return;
    }
    if( (n < 0) || (m < 0) ){
        alert("No negative numbers please");
        return;
    }
    var a = new Object(); a[0] = 1; a[1] = m; a[2] = n; // Array(1,m,n);

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