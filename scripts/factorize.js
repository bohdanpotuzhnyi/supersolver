    factor = new Map()

    module.exports.factor = (num) =>{
    var solving = ""
    var s = new Map()
    var snum = num
    var prevnum = num
    var ch = false
    var temp = 0
    for (var i1 = 2; i1 * i1 <= num; i1++) {
        if (num % i1 == 0) {
              ch = true;
              s.set(i1, 1)
              prevnum = num;
              num = num / i1;
              if (out) {
                  solving += prevnum + ":" + i1 + "\n";
              }
              if (num % i1 != 0) {
                  solving += num + "!" + i1 + "\n";
              }
              while (num % i1 == 0){
                  temp = s.get(i1);
                  s.set(i1, temp);
                  prevnum = num;
                  num = num / i1;
                  solving += prevnum + ":" + i1 + "\n";
                  if ((num % i1 != 0)) {
                       solving +=  num + "!" + i1 + "\n";
                  }
              }
              //solving += "step " + i1 + " = " + s.get(i1) + "\n";
        } else {
              if (prime(i1)) {
                  solving += num + "!" + i1 + "\n";
              }
        }
        if (num == 1) { break; }
    }
    if (prime(num) && (num != 1)) {
          s.set(num, 1)
          solving += num + " - proste" + "\n";
    }
    if (prime(snum)){
          s.set(snum, 1)
          solving += snum + " - proste" + "\n";
    }
    solving += snum + " = ";

    s.forEach((value, key) => {
          solving += key + "^" + value + " * "; // огурец: 500 и так далее
    })
    solving = solving.slice(0, -3)
    const res = {
        "res": s,
        "solving": solving
    }
    return res;
}
